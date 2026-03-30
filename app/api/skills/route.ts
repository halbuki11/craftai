import { NextResponse } from 'next/server';
import { loadSkills } from '@/lib/skills/loader';

export async function GET() {
  const skills = loadSkills();

  // Don't expose system prompts to the client
  const publicSkills = skills.map(({ systemPrompt, triggerPatterns, ...rest }) => rest);

  return NextResponse.json({ skills: publicSkills });
}
