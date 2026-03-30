import { createServiceClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

const log = logger.child('memory');

export interface MemoryEntry {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

/**
 * Get recent conversation history for a user (last N messages).
 * Used to give the AI context about previous interactions.
 */
export async function getRecentHistory(userId: string, limit = 10): Promise<MemoryEntry[]> {
  try {
    const supabase = createServiceClient();

    const { data: notes } = await supabase
      .from('notes')
      .select('transcript, formatted_content, title, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (!notes || notes.length === 0) return [];

    // Convert notes to conversation entries (reverse to chronological order)
    return notes.reverse().map((note) => ({
      role: 'user' as const,
      content: note.transcript || note.formatted_content || note.title,
      timestamp: note.created_at,
    }));
  } catch (error) {
    log.error('Failed to get history', error as Error);
    return [];
  }
}

/**
 * Get user preferences/facts from profile.
 * Returns a string summary of what we know about the user.
 */
export async function getUserContext(userId: string): Promise<string> {
  try {
    const supabase = createServiceClient();

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, timezone, settings')
      .eq('id', userId)
      .single();

    if (!profile) return '';

    const parts: string[] = [];
    if (profile.full_name) parts.push(`Kullanıcı adı: ${profile.full_name}`);
    if (profile.timezone) parts.push(`Saat dilimi: ${profile.timezone}`);

    // Get recent activity summary
    const { count: noteCount } = await supabase
      .from('notes')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: todoCount } = await supabase
      .from('todos')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'pending');

    if (noteCount) parts.push(`Toplam ${noteCount} not`);
    if (todoCount) parts.push(`${todoCount} bekleyen görev`);

    return parts.join('. ');
  } catch {
    return '';
  }
}
