import Anthropic from '@anthropic-ai/sdk';
import { type ModelId, getModelConfig } from './model-config';

let client: Anthropic | null = null;

export function getClaudeClient(): Anthropic {
  if (!client) {
    client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return client;
}

export interface ClaudeMessageOptions {
  model: ModelId;
  system: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
  maxTokens?: number;
  temperature?: number;
}

export async function sendClaudeMessage(options: ClaudeMessageOptions): Promise<string> {
  const claude = getClaudeClient();
  const config = getModelConfig(options.model);

  const response = await claude.messages.create({
    model: config.apiModel,
    max_tokens: options.maxTokens ?? config.maxTokens,
    temperature: options.temperature ?? 0.4,
    system: options.system,
    messages: options.messages,
  });

  const textBlock = response.content.find(b => b.type === 'text');
  return textBlock?.text ?? '';
}

export interface ClaudeJsonOptions<T> extends ClaudeMessageOptions {
  /** If true, strips markdown code fences before JSON.parse */
  stripFences?: boolean;
}

export async function sendClaudeJson<T>(options: ClaudeJsonOptions<T>): Promise<T> {
  const raw = await sendClaudeMessage(options);

  let jsonStr = raw.trim();
  if (options.stripFences !== false) {
    jsonStr = jsonStr.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  }

  return JSON.parse(jsonStr) as T;
}
