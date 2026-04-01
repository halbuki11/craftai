import { NextRequest } from 'next/server';
import { getClaudeClient } from '@/lib/ai/claude';
import { getOpenAIClient } from '@/lib/ai/openai';
import { getModelConfig, type ModelId, DEFAULT_MODEL } from '@/lib/ai/model-config';
import { checkTokens, checkModelAccess } from '@/lib/credits/check';
import { deductTokens } from '@/lib/credits/deduct';
import { resolveSkill } from '@/lib/skills/registry';
import { logger } from '@/lib/logger';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { message, model: requestedModel, skillId, noteId, history = [], attachments = [] } = await request.json();

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Please sign in to use CraftAI.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Rate limit: 20 requests per minute per user
    const rl = rateLimit(`chat:${user.id}`, 20, 60_000);
    if (!rl.allowed) {
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please wait a moment.' }),
        { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      );
    }

    const preferredModel = (requestedModel || DEFAULT_MODEL) as ModelId;
    const config = getModelConfig(preferredModel);

    {
      const modelAccess = await checkModelAccess(user.id, preferredModel);
      if (!modelAccess.allowed) {
        return new Response(JSON.stringify({ error: modelAccess.error }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const tokenCheck = await checkTokens(user.id);
      if (!tokenCheck.allowed) {
        return new Response(JSON.stringify({ error: tokenCheck.error }), {
          status: 402,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const nowLocal = new Date().toLocaleString('en-US', {
      timeZone: tz,
      dateStyle: 'short',
      timeStyle: 'short',
    });

    // Resolve skill
    const { skill } = resolveSkill(message, skillId);

    const hasFiles = attachments && (attachments as unknown[]).length > 0;
    const hasImages = hasFiles && (attachments as Array<{ type: string }>).some((a) => a.type?.startsWith('image/'));

    let systemPrompt = '';
    if (skill?.systemPrompt) {
      systemPrompt = skill.systemPrompt + `\n\nCurrent time: ${nowLocal} (${tz})`;
    } else {
      systemPrompt = `You are CraftAI — a smart, helpful, and versatile AI assistant.

RULES:
- Respond in the user's language (auto-detect)
- Use Markdown formatting
- Give detailed, accurate, and helpful answers
- Specify language for code blocks
- Be professional but friendly
- Current time: ${nowLocal} (${tz})`;
    }

    // Add vision/file instructions when attachments are present
    if (hasImages) {
      systemPrompt += `\n\nIMPORTANT: The user has attached image(s). Carefully analyze the image content. Describe what you see, read any text in the image, solve any problems shown, and respond to the user's question about the image. Be thorough and detailed in your visual analysis.`;
    }
    if (hasFiles && !hasImages) {
      systemPrompt += `\n\nIMPORTANT: The user has attached file(s). Carefully analyze the file content provided and respond to the user's question about it.`;
    }

    const messages: { role: 'user' | 'assistant'; content: string | Array<{ type: string; [key: string]: unknown }> }[] = [];
    const recentHistory = (history as { role: 'user' | 'assistant'; content: string }[]).slice(-20);
    for (const entry of recentHistory) {
      messages.push({ role: entry.role, content: entry.content });
    }

    // Build user message with attachments
    const fileAttachments = attachments as Array<{ name: string; type: string; data: string }>;
    if (fileAttachments.length > 0 && config.provider === 'anthropic') {
      // Claude vision format
      const contentParts: Array<{ type: string; [key: string]: unknown }> = [];
      for (const file of fileAttachments) {
        const base64Data = file.data.includes(',') ? file.data.split(',')[1] : file.data;
        if (file.type.startsWith('image/')) {
          contentParts.push({
            type: 'image',
            source: { type: 'base64', media_type: file.type, data: base64Data },
          });
        } else {
          try {
            const textContent = Buffer.from(base64Data, 'base64').toString('utf-8');
            contentParts.push({ type: 'text', text: `[File: ${file.name}]\n\n${textContent.substring(0, 50000)}` });
          } catch {
            contentParts.push({ type: 'text', text: `[File: ${file.name} — could not read]` });
          }
        }
      }
      contentParts.push({ type: 'text', text: message });
      messages.push({ role: 'user', content: contentParts });
    } else if (fileAttachments.length > 0 && config.provider === 'openai') {
      // OpenAI vision format
      const contentParts: Array<{ type: string; [key: string]: unknown }> = [];
      for (const file of fileAttachments) {
        if (file.type.startsWith('image/')) {
          contentParts.push({ type: 'image_url', image_url: { url: file.data } });
        } else {
          try {
            const base64Data = file.data.includes(',') ? file.data.split(',')[1] : file.data;
            const textContent = Buffer.from(base64Data, 'base64').toString('utf-8');
            contentParts.push({ type: 'text', text: `[File: ${file.name}]\n\n${textContent.substring(0, 50000)}` });
          } catch {
            contentParts.push({ type: 'text', text: `[File: ${file.name} — could not read]` });
          }
        }
      }
      contentParts.push({ type: 'text', text: message });
      messages.push({ role: 'user', content: contentParts });
    } else {
      messages.push({ role: 'user', content: message });
    }

    const encoder = new TextEncoder();

    // Route to correct provider
    if (config.provider === 'openai') {
      return streamOpenAI(config, systemPrompt, messages, encoder, preferredModel, message, user, noteId);
    } else if (config.provider === 'google') {
      return streamGemini(config, systemPrompt, messages, encoder, preferredModel, message, user, noteId);
    } else {
      return streamClaude(config, systemPrompt, messages, encoder, preferredModel, message, user, noteId);
    }
  } catch (error) {
    logger.error('Stream API error', error instanceof Error ? error : undefined);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// ─── Claude (Anthropic) ───────────────────────────────────────

function streamClaude(
  config: ReturnType<typeof getModelConfig>,
  systemPrompt: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  messages: any[],
  encoder: TextEncoder,
  modelId: ModelId,
  originalMessage: string,
  user: { id: string } | null,
  existingNoteId?: string,
) {
  const claude = getClaudeClient();

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        const stream = await claude.messages.stream({
          model: config.apiModel,
          max_tokens: config.maxTokens,
          temperature: 0.4,
          system: systemPrompt,
          messages,
        });

        let inputTokens = 0;
        let outputTokens = 0;
        let fullText = '';

        for await (const event of stream) {
          if (event.type === 'message_start' && event.message?.usage) {
            inputTokens = event.message.usage.input_tokens;
          }
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            fullText += event.delta.text;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'text', content: event.delta.text })}\n\n`)
            );
          }
          if (event.type === 'message_delta' && event.usage) {
            outputTokens = event.usage.output_tokens;
          }
        }

        const totalTokens = inputTokens + outputTokens;
        const savedNoteId = await saveConversation(user, originalMessage, fullText, existingNoteId);

        // Deduct total tokens from user's pool
        let tokensRemaining: number | undefined;
        if (user) {
          const deduction = await deductTokens({
            userId: user.id,
            tokens: totalTokens,
            model: modelId,
            source: 'web',
          });
          tokensRemaining = deduction.remaining;
        }

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({
            type: 'done',
            model: modelId,
            provider: 'anthropic',
            noteId: savedNoteId,
            tokens: { input: inputTokens, output: outputTokens, total: totalTokens },
            tokensRemaining,
          })}\n\n`)
        );
        controller.close();
      } catch (error) {
        logger.error('Claude stream error', error instanceof Error ? error : undefined);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', content: 'Something went wrong.' })}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(readableStream, { headers: sseHeaders() });
}

// ─── OpenAI (GPT) ────────────────────────────────────────────

function streamOpenAI(
  config: ReturnType<typeof getModelConfig>,
  systemPrompt: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  messages: any[],
  encoder: TextEncoder,
  modelId: ModelId,
  originalMessage: string,
  user: { id: string } | null,
  existingNoteId?: string,
) {
  const openai = getOpenAIClient();

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        const stream = await openai.chat.completions.create({
          model: config.apiModel,
          max_tokens: config.maxTokens,
          temperature: 0.4,
          stream: true,
          stream_options: { include_usage: true },
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages,
          ],
        });

        let fullText = '';
        let inputTokens = 0;
        let outputTokens = 0;

        for await (const chunk of stream) {
          const delta = chunk.choices?.[0]?.delta?.content;
          if (delta) {
            fullText += delta;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'text', content: delta })}\n\n`)
            );
          }
          // Usage comes in the final chunk
          if (chunk.usage) {
            inputTokens = chunk.usage.prompt_tokens;
            outputTokens = chunk.usage.completion_tokens;
          }
        }

        const totalTokens = inputTokens + outputTokens;
        const savedNoteId = await saveConversation(user, originalMessage, fullText, existingNoteId);

        let tokensRemaining: number | undefined;
        if (user) {
          const deduction = await deductTokens({
            userId: user.id,
            tokens: totalTokens,
            model: modelId,
            source: 'web',
          });
          tokensRemaining = deduction.remaining;
        }

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({
            type: 'done',
            model: modelId,
            provider: 'openai',
            noteId: savedNoteId,
            tokens: { input: inputTokens, output: outputTokens, total: totalTokens },
            tokensRemaining,
          })}\n\n`)
        );
        controller.close();
      } catch (error) {
        logger.error('OpenAI stream error', error instanceof Error ? error : undefined);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', content: 'Something went wrong.' })}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(readableStream, { headers: sseHeaders() });
}

// ─── Gemini (Google AI) ──────────────────────────────────────

function streamGemini(
  config: ReturnType<typeof getModelConfig>,
  systemPrompt: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  messages: any[],
  encoder: TextEncoder,
  modelId: ModelId,
  originalMessage: string,
  user: { id: string } | null,
  existingNoteId?: string,
) {
  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        const { getGeminiClient } = await import('@/lib/ai/gemini');
        const ai = getGeminiClient();

        // Convert messages to Gemini format
        const geminiHistory: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
        for (const msg of messages.slice(0, -1)) {
          const role = msg.role === 'assistant' ? 'model' : 'user';
          const text = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
          geminiHistory.push({ role, parts: [{ text }] });
        }

        const lastMsg = messages[messages.length - 1];
        const userText = typeof lastMsg.content === 'string' ? lastMsg.content : JSON.stringify(lastMsg.content);

        const stream = await ai.models.generateContentStream({
          model: config.apiModel,
          config: {
            maxOutputTokens: config.maxTokens,
            temperature: 0.4,
            systemInstruction: systemPrompt,
          },
          contents: [
            ...geminiHistory,
            { role: 'user', parts: [{ text: userText }] },
          ],
        });

        let fullText = '';
        let inputTokens = 0;
        let outputTokens = 0;

        for await (const chunk of stream) {
          const text = chunk.text || '';
          if (text) {
            fullText += text;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'text', content: text })}\n\n`)
            );
          }
          if (chunk.usageMetadata) {
            inputTokens = chunk.usageMetadata.promptTokenCount || 0;
            outputTokens = chunk.usageMetadata.candidatesTokenCount || 0;
          }
        }

        const totalTokens = inputTokens + outputTokens;
        const savedNoteId = await saveConversation(user, originalMessage, fullText, existingNoteId);

        let tokensRemaining: number | undefined;
        if (user) {
          const deduction = await deductTokens({
            userId: user.id,
            tokens: totalTokens,
            model: modelId,
            source: 'web',
          });
          tokensRemaining = deduction.remaining;
        }

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({
            type: 'done',
            model: modelId,
            provider: 'google',
            noteId: savedNoteId,
            tokens: { input: inputTokens, output: outputTokens, total: totalTokens },
            tokensRemaining,
          })}\n\n`)
        );
        controller.close();
      } catch (error) {
        logger.error('Gemini stream error', error instanceof Error ? error : undefined);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', content: 'Something went wrong.' })}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(readableStream, { headers: sseHeaders() });
}

// ─── Helpers ──────────────────────────────────────────────────

function sseHeaders() {
  return {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  };
}

async function saveConversation(
  user: { id: string } | null,
  message: string,
  response: string,
  existingNoteId?: string,
): Promise<string | undefined> {
  if (!user || !response) return undefined;
  try {
    const serviceClient = createServiceClient();

    if (existingNoteId) {
      // Append to existing conversation
      const { data: existing } = await serviceClient
        .from('notes')
        .select('raw_transcript, formatted_content')
        .eq('id', existingNoteId)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        const newRaw = existing.raw_transcript + '\n---USER---\n' + message;
        const newFormatted = existing.formatted_content + '\n---ASSISTANT---\n' + response;

        await serviceClient
          .from('notes')
          .update({
            raw_transcript: newRaw,
            formatted_content: newFormatted,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingNoteId);

        return existingNoteId;
      }
    }

    // New conversation — save with temp title, then generate a better one async
    const tempTitle = message.length > 60 ? message.substring(0, 57) + '...' : message;
    const { data, error } = await serviceClient
      .from('notes')
      .insert({
        user_id: user.id,
        title: tempTitle,
        formatted_content: response,
        raw_transcript: message,
        source: 'web',
        ai_confidence: 1.0,
        has_action_items: false,
        has_calendar_event: false,
      })
      .select('id')
      .single();

    if (error) {
      logger.error('Save conversation error', error as unknown as Error);
      return undefined;
    }

    // Fire-and-forget: generate a better title
    if (data?.id) {
      generateTitle(serviceClient, data.id, message, response).catch(() => {});
    }

    return data?.id;
  } catch (err) {
    logger.error('Save conversation failed', err instanceof Error ? err : undefined);
    return undefined;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateTitle(serviceClient: any, noteId: string, message: string, response: string) {
  try {
    const claude = getClaudeClient();
    const snippet = response.substring(0, 200);
    const result = await claude.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 30,
      messages: [
        {
          role: 'user',
          content: `Generate a short title (max 50 chars) for this conversation. Reply with ONLY the title, no quotes.\n\nUser: ${message.substring(0, 200)}\nAssistant: ${snippet}`,
        },
      ],
    });
    const title = result.content[0]?.type === 'text'
      ? result.content[0].text.trim().replace(/^["']|["']$/g, '').substring(0, 60)
      : null;
    if (title) {
      await serviceClient.from('notes').update({ title }).eq('id', noteId);
    }
  } catch {
    // Title generation is optional — silently fail
  }
}
