import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { Skill, SkillCategory } from './types';
import type { ModelId } from '@/lib/ai/model-config';

const SKILLS_DIR = path.join(process.cwd(), 'content', 'skills');

let cachedSkills: Skill[] | null = null;

/**
 * Load skills from SKILL.md folder structure.
 * Each skill lives in: content/skills/{skill-name}/SKILL.md
 */
export function loadSkills(): Skill[] {
  if (cachedSkills) return cachedSkills;

  if (!fs.existsSync(SKILLS_DIR)) {
    cachedSkills = [];
    return cachedSkills;
  }

  const entries = fs.readdirSync(SKILLS_DIR, { withFileTypes: true });

  cachedSkills = entries
    .filter((entry) => {
      if (!entry.isDirectory()) return false;
      const skillFile = path.join(SKILLS_DIR, entry.name, 'SKILL.md');
      return fs.existsSync(skillFile);
    })
    .map((entry) => {
      const skillDir = path.join(SKILLS_DIR, entry.name);
      const skillFile = path.join(skillDir, 'SKILL.md');
      const raw = fs.readFileSync(skillFile, 'utf-8');
      const { data, content } = matter(raw);

      // Load references if they exist
      let references = '';
      const refsDir = path.join(skillDir, 'references');
      if (fs.existsSync(refsDir)) {
        const refFiles = fs.readdirSync(refsDir).filter((f) => f.endsWith('.md'));
        for (const ref of refFiles) {
          references += '\n\n' + fs.readFileSync(path.join(refsDir, ref), 'utf-8');
        }
      }

      const systemPrompt = references
        ? content.trim() + '\n\n---\n' + references.trim()
        : content.trim();

      return {
        id: data.name || entry.name,
        title: data.title || entry.name,
        description: data.description || '',
        category: (data.category || 'general') as SkillCategory,
        icon: data.icon || 'sparkles',
        defaultModel: (data.default_model || 'sonnet') as ModelId,
        creditMultiplier: data.credit_multiplier ?? 1.0,
        requiresFile: data.requires_file ?? false,
        minPlan: data.min_plan || 'free',
        tags: data.tags || [],
        triggerPatterns: data.trigger_patterns || [],
        systemPrompt,
        // New fields from SKILL.md format
        hasScripts: fs.existsSync(path.join(skillDir, 'scripts')),
        hasAssets: fs.existsSync(path.join(skillDir, 'assets')),
      } satisfies Skill;
    });

  return cachedSkills;
}

export function getSkillById(id: string): Skill | undefined {
  return loadSkills().find((s) => s.id === id);
}

export function getSkillsByCategory(category: SkillCategory): Skill[] {
  return loadSkills().filter((s) => s.category === category);
}

export function invalidateSkillCache(): void {
  cachedSkills = null;
}
