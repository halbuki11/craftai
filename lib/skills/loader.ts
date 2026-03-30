import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { Skill, SkillCategory } from './types';
import type { ModelId } from '@/lib/ai/model-config';

const SKILLS_DIR = path.join(process.cwd(), 'content', 'skills');

let cachedSkills: Skill[] | null = null;

export function loadSkills(): Skill[] {
  if (cachedSkills) return cachedSkills;

  if (!fs.existsSync(SKILLS_DIR)) {
    cachedSkills = [];
    return cachedSkills;
  }

  const files = fs.readdirSync(SKILLS_DIR).filter(f => f.endsWith('.md'));

  cachedSkills = files.map(file => {
    const raw = fs.readFileSync(path.join(SKILLS_DIR, file), 'utf-8');
    const { data, content } = matter(raw);

    return {
      id: data.name || file.replace('.md', ''),
      title: data.title || data.name || file.replace('.md', ''),
      description: data.description || '',
      category: (data.category || 'general') as SkillCategory,
      icon: data.icon || 'sparkles',
      defaultModel: (data.default_model || 'sonnet') as ModelId,
      creditMultiplier: data.credit_multiplier ?? 1.0,
      requiresFile: data.requires_file ?? false,
      minPlan: data.min_plan || 'free',
      tags: data.tags || [],
      triggerPatterns: data.trigger_patterns || [],
      systemPrompt: content.trim(),
    } satisfies Skill;
  });

  return cachedSkills;
}

export function getSkillById(id: string): Skill | undefined {
  return loadSkills().find(s => s.id === id);
}

export function getSkillsByCategory(category: SkillCategory): Skill[] {
  return loadSkills().filter(s => s.category === category);
}

/** Invalidate cache (for dev hot-reload) */
export function invalidateSkillCache(): void {
  cachedSkills = null;
}
