import { NextRequest, NextResponse } from 'next/server';
import { getClaudeClient } from '@/lib/ai/claude';
import { getModelConfig, type ModelId, DEFAULT_MODEL } from '@/lib/ai/model-config';
import { checkTokens, checkModelAccess } from '@/lib/credits/check';
import { deductTokens } from '@/lib/credits/deduct';
import { createServiceClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';
import crypto from 'crypto';

function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

async function authenticateApiKey(apiKey: string): Promise<string | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('api_keys')
    .select('user_id, id')
    .eq('key_hash', hashKey(apiKey))
    .eq('is_active', true)
    .single();

  if (!data) return null;

  // Update last_used_at
  await supabase.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', data.id);

  return data.user_id;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing API key. Use: Authorization: Bearer craft_xxx' }, { status: 401 });
    }

    const apiKey = authHeader.slice(7);
    const userId = await authenticateApiKey(apiKey);

    if (!userId) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    // Rate limit: 30 req/min per user
    const rl = rateLimit(`api:${userId}`, 30, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Rate limited', retry_after: Math.ceil((rl.resetAt - Date.now()) / 1000) }, { status: 429 });
    }

    const body = await request.json();
    const { message, model: requestedModel, history = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'message (string) is required' }, { status: 400 });
    }

    const modelId = (requestedModel || DEFAULT_MODEL) as ModelId;
    const config = getModelConfig(modelId);

    // Check access
    const modelAccess = await checkModelAccess(userId, modelId);
    if (!modelAccess.allowed) {
      return NextResponse.json({ error: modelAccess.error }, { status: 403 });
    }

    const tokenCheck = await checkTokens(userId);
    if (!tokenCheck.allowed) {
      return NextResponse.json({ error: tokenCheck.error }, { status: 402 });
    }

    // Build messages
    const messages = [
      ...history.slice(-10).map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: message },
    ];

    // Non-streaming response via Claude
    const claude = getClaudeClient();
    const response = await claude.messages.create({
      model: config.apiModel,
      max_tokens: config.maxTokens,
      temperature: 0.4,
      system: 'You are CraftAI — a smart, helpful AI assistant. Respond in the user\'s language.',
      messages,
    });

    const text = response.content[0]?.type === 'text' ? response.content[0].text : '';
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const totalTokens = inputTokens + outputTokens;

    // Deduct tokens
    const deduction = await deductTokens({ userId, tokens: totalTokens, model: modelId, source: 'api' });

    return NextResponse.json({
      message: text,
      model: modelId,
      usage: { input_tokens: inputTokens, output_tokens: outputTokens, total_tokens: totalTokens },
      tokens_remaining: deduction.remaining,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
