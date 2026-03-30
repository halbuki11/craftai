import { loadSkills, getSkillById } from './loader';
import type { Skill } from './types';

/**
 * Auto-detect the best matching skill based on user message.
 * Returns null if no skill matches (fallback to default routing).
 */
export function detectSkill(message: string): Skill | null {
  const skills = loadSkills();
  const lower = message.toLowerCase();

  for (const skill of skills) {
    for (const pattern of skill.triggerPatterns) {
      try {
        const regex = new RegExp(pattern, 'i');
        if (regex.test(lower)) {
          return skill;
        }
      } catch {
        // Invalid regex, skip
      }
    }
  }

  return null;
}

/**
 * Build the system prompt for a skill, replacing template variables.
 */
export function buildSkillPrompt(
  skill: Skill,
  vars: Record<string, string> = {}
): string {
  let prompt = skill.systemPrompt;

  // Replace simple {{var}} placeholders
  for (const [key, value] of Object.entries(vars)) {
    prompt = prompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }

  // Handle {{#if var}}...{{/if}} blocks
  prompt = prompt.replace(
    /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (_, varName, block) => {
      return vars[varName] ? block : '';
    }
  );

  // Clean up any remaining unreplaced variables
  prompt = prompt.replace(/\{\{[^}]+\}\}/g, '');

  return prompt.trim();
}

/**
 * Get a skill by ID or auto-detect from message.
 * Returns the skill and whether it was auto-detected.
 */
export function resolveSkill(
  message: string,
  skillId?: string
): { skill: Skill | null; autoDetected: boolean } {
  if (skillId) {
    const skill = getSkillById(skillId);
    return { skill: skill || null, autoDetected: false };
  }

  const detected = detectSkill(message);
  return { skill: detected, autoDetected: !!detected };
}
