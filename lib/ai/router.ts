import OpenAI from 'openai';
import { sendClaudeJson, sendClaudeMessage } from './claude';
import { type ModelId, DEFAULT_MODEL } from './model-config';

// Keep OpenAI for DALL-E image generation only (lazy init)
let _openai: OpenAI | null = null;
function getOpenAI() {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '', timeout: 60_000 });
  }
  return _openai;
}

export type ActionType =
  | 'note_save'
  | 'gmail_draft'
  | 'calendar_add'
  | 'reminder_set'
  | 'todo_create'
  | 'summarize'
  | 'notion_save'
  | 'create_content'
  | 'generate_image'
  | 'web_research'
  | 'analyze_document'
  | 'quick_answer';

export interface DetectedAction {
  type: ActionType;
  params: Record<string, unknown>;
  confidence: number;
}

export interface RouterResult {
  detected_language: string;
  actions: DetectedAction[];
  formatted_content: string;
  title: string;
  tags: string[];
  response_message: string;
}

const SYSTEM_PROMPT = `You are a powerful AI assistant. Analyze the user's message and determine the correct action. You are NOT just a note-taking app — you are an action-performing assistant.

SUPPORTED ACTIONS:

📧 gmail_draft - Create email draft when email is requested
   params: { to, subject, body }
   - "to": email or contact name
   - "subject": appropriate subject from context
   - "body": write a professional email from what the user said. Do NOT fabricate, only use what was said.

📅 calendar_add - Add event/appointment
   params: { title, datetime, duration, description }

⏰ reminder_set - Set a reminder
   params: { message, remind_at }

✅ todo_create - Create a task
   params: { title, due_date, priority }

✍️ create_content - Generate content (blog post, LinkedIn post, social media, tweet, proposal, report, etc.)
   params: { content_type, topic, tone, length, content }
   - content_type: "blog" | "linkedin" | "tweet" | "instagram" | "email_template" | "proposal" | "report" | "general"
   - topic: the subject
   - tone: "professional" | "casual" | "friendly" | "formal" (default: professional)
   - length: "short" | "medium" | "long" (default: medium)
   - content: THE GENERATED CONTENT. Write complete, publish-ready content. Include title, body, hashtags (if applicable).

🎨 generate_image - Generate image (DALL-E)
   params: { prompt, style }
   - prompt: write detailed visual description in English
   - style: "realistic" | "artistic" | "minimal" | "cartoon"

🔍 web_research - Web research / summarize URL
   params: { query, url }
   - If user provided a URL, put it in the url field
   - For general research, put it in the query field

📄 analyze_document - Image/document analysis (when user sends a photo/PDF)
   params: { instruction }
   - instruction: the user's analysis request

💬 quick_answer - Quick Q&A (general knowledge, translation, calculation, etc.)
   params: { question, answer }
   - question: the question asked
   - answer: write a DETAILED and HELPFUL answer. Be thorough, not brief.

📝 note_save - ONLY when user explicitly says "save", "take note", etc.
   params: {}

💡 summarize - Text summarization
   params: {}

RULES:
- Detect the message language and write CONTENT in the same language
- Dates/times: ISO 8601. User timezone: __TIMEZONE__
- Current time: __NOW__
- In create_content, WRITE THE CONTENT YOURSELF. The "content" field must not be empty.
- In quick_answer, WRITE THE ANSWER YOURSELF. The "answer" field must not be empty.
- If no action fits, use quick_answer
- Do not auto-add note_save, only when explicitly requested
- If confidence is below 0.7, do not include the action

JSON FORMAT (RETURN ONLY JSON, no extra text):
{
  "detected_language": "ISO 639-1 code",
  "actions": [
    {"type": "action_type", "params": {...}, "confidence": 0.0-1.0}
  ],
  "formatted_content": "Formatted content",
  "title": "Short title (max 50 chars)",
  "tags": ["tag1"],
  "response_message": "Brief confirmation message to user"
}`;

export async function routeMessage(
  message: string,
  timezone?: string,
  context?: { history?: Array<{ role: 'user' | 'assistant'; content: string }>; userInfo?: string },
  model?: ModelId
): Promise<RouterResult> {
  const tz = timezone || 'Europe/Istanbul';
  const nowLocal = new Date().toLocaleString('en-US', { timeZone: tz, dateStyle: 'short', timeStyle: 'short' });
  let systemPrompt = SYSTEM_PROMPT
    .replace('__TIMEZONE__', tz)
    .replace('__NOW__', nowLocal);

  if (context?.userInfo) {
    systemPrompt += `\n\nUSER INFO: ${context.userInfo}`;
  }

  // Build messages for Claude
  const messages: { role: 'user' | 'assistant'; content: string }[] = [];

  if (context?.history && context.history.length > 0) {
    for (const entry of context.history.slice(-5)) {
      messages.push({ role: entry.role, content: entry.content });
    }
  }

  messages.push({ role: 'user', content: message });

  const result = await sendClaudeJson<RouterResult>({
    model: model || DEFAULT_MODEL,
    system: systemPrompt,
    messages,
    temperature: 0.4,
  });

  result.actions = result.actions.filter(
    action => action.confidence >= 0.7
  );

  // Safety: gmail_send → gmail_draft
  result.actions = result.actions.map(action => {
    if ((action.type as string) === 'gmail_send') {
      return { ...action, type: 'gmail_draft' as ActionType };
    }
    return action;
  });

  // Fallback: no actions → quick_answer
  if (result.actions.length === 0) {
    result.actions.push({
      type: 'quick_answer',
      params: { question: message, answer: result.response_message || '' },
      confidence: 1.0,
    });
  }

  return result;
}

/**
 * Analyze an image or document using Claude Vision
 */
export async function analyzeImage(imageUrl: string, instruction?: string, model?: ModelId): Promise<string> {
  const claude = (await import('./claude')).getClaudeClient();

  const response = await claude.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'url', url: imageUrl },
          },
          {
            type: 'text',
            text: instruction || 'Analyze this image in detail. Describe what you see and any relevant information.',
          },
        ],
      },
    ],
  });

  return response.content[0]?.type === 'text' ? response.content[0].text : '';
}

/**
 * Web research — placeholder for future implementation
 */
export async function webResearch(query?: string, url?: string): Promise<string> {
  if (url) {
    return `Research requested for URL: ${url}. Web fetching is not yet implemented.`;
  }
  if (query) {
    return `Research requested: ${query}. Web search is not yet implemented.`;
  }
  return 'No query or URL provided.';
}

/**
 * Generate an image using DALL-E
 */
export async function generateImage(prompt: string, style?: string): Promise<{ url: string }> {
  const openai = getOpenAI();
  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: style ? `${style} style: ${prompt}` : prompt,
    n: 1,
    size: '1024x1024',
    quality: 'standard',
  });

  return { url: response.data?.[0]?.url || '' };
}
