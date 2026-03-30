export type ModelId = 'haiku' | 'sonnet' | 'opus';

export interface ModelConfig {
  id: ModelId;
  apiModel: string;
  name: string;
  credits: number;
  maxTokens: number;
  description: string;
}

export const MODELS: Record<ModelId, ModelConfig> = {
  haiku: {
    id: 'haiku',
    apiModel: 'claude-haiku-4-5-20251001',
    name: 'Haiku 4.5',
    credits: 1,
    maxTokens: 8192,
    description: 'Hızlı ve ekonomik. Basit görevler için ideal.',
  },
  sonnet: {
    id: 'sonnet',
    apiModel: 'claude-sonnet-4-6-20250514',
    name: 'Sonnet 4.6',
    credits: 3,
    maxTokens: 16384,
    description: 'Dengeli performans. Çoğu görev için önerilen.',
  },
  opus: {
    id: 'opus',
    apiModel: 'claude-opus-4-6-20250514',
    name: 'Opus 4.6',
    credits: 10,
    maxTokens: 32768,
    description: 'En güçlü model. Karmaşık analiz ve üretim için.',
  },
};

export const EXTRA_CREDITS = {
  whisper_transcription: 1,
  dall_e_generation: 5,
  image_analysis: 2,
} as const;

export const DEFAULT_MODEL: ModelId = 'sonnet';

export function getModelConfig(model: ModelId): ModelConfig {
  return MODELS[model] || MODELS[DEFAULT_MODEL];
}

export function calculateCredits(model: ModelId, multiplier: number = 1, extras: (keyof typeof EXTRA_CREDITS)[] = []): number {
  const base = MODELS[model]?.credits ?? MODELS[DEFAULT_MODEL].credits;
  const extraTotal = extras.reduce((sum, key) => sum + EXTRA_CREDITS[key], 0);
  return Math.ceil(base * multiplier) + extraTotal;
}
