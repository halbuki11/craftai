import type { ModelId } from '@/lib/ai/model-config';

export interface Skill {
  /** Unique identifier, matches filename */
  id: string;
  /** Display name */
  title: string;
  /** Short description */
  description: string;
  /** Category for grouping */
  category: SkillCategory;
  /** Lucide icon name */
  icon: string;
  /** Default model for this skill */
  defaultModel: ModelId;
  /** Multiplier applied to base model credit cost */
  creditMultiplier: number;
  /** Whether this skill requires a file upload */
  requiresFile: boolean;
  /** Minimum subscription plan required */
  minPlan: string;
  /** Tags for search/filtering */
  tags: string[];
  /** Regex patterns for auto-detection */
  triggerPatterns: string[];
  /** The system prompt template (body of .md file) */
  systemPrompt: string;
}

export type SkillCategory =
  | 'general'
  | 'analysis'
  | 'writing'
  | 'coding'
  | 'translation'
  | 'productivity'
  | 'education'
  | 'creative'
  | 'research';

export const CATEGORY_LABELS: Record<SkillCategory, string> = {
  general: 'Genel',
  analysis: 'Analiz',
  writing: 'Yazı',
  coding: 'Kodlama',
  translation: 'Çeviri',
  productivity: 'Üretkenlik',
  education: 'Eğitim',
  creative: 'Yaratıcı',
  research: 'Araştırma',
};

export const CATEGORY_ICONS: Record<SkillCategory, string> = {
  general: 'sparkles',
  analysis: 'search',
  writing: 'pen-tool',
  coding: 'code',
  translation: 'globe',
  productivity: 'zap',
  education: 'graduation-cap',
  creative: 'palette',
  research: 'book-open',
};
