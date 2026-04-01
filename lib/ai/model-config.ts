export type Provider = 'anthropic' | 'openai';
export type ModelId = 'haiku' | 'sonnet' | 'gpt-4o' | 'gpt-4o-mini';

export interface ModelConfig {
  id: ModelId;
  provider: Provider;
  apiModel: string;
  name: string;
  maxTokens: number;
  description: string;
  costPer1M: number;
}

export const MODELS: Record<ModelId, ModelConfig> = {
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    provider: 'openai',
    apiModel: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    maxTokens: 16384,
    description: 'Fastest & cheapest',
    costPer1M: 0.38,
  },
  haiku: {
    id: 'haiku',
    provider: 'anthropic',
    apiModel: 'claude-haiku-4-5',
    name: 'Claude 4.5 Haiku',
    maxTokens: 8192,
    description: 'Fast & efficient',
    costPer1M: 0.75,
  },
  'gpt-4o': {
    id: 'gpt-4o',
    provider: 'openai',
    apiModel: 'gpt-4o',
    name: 'GPT-4o',
    maxTokens: 16384,
    description: 'Versatile & popular',
    costPer1M: 6.25,
  },
  sonnet: {
    id: 'sonnet',
    provider: 'anthropic',
    apiModel: 'claude-sonnet-4-6',
    name: 'Claude Sonnet 4.6',
    maxTokens: 16384,
    description: 'Balanced performance',
    costPer1M: 9.00,
  },
};

export const DEFAULT_MODEL: ModelId = 'sonnet';

export function getModelConfig(model: ModelId): ModelConfig {
  return MODELS[model] || MODELS[DEFAULT_MODEL];
}
