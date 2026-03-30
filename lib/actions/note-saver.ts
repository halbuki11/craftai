import { createServiceClient } from '@/lib/supabase/server';

export interface SaveNoteParams {
  userId: string;
  transcript: string;
  source: 'telegram' | 'whatsapp' | 'web' | 'email';
  language?: string;
  aiConfidence?: number;
  processingTimeMs?: number;
  formattedContent?: string;
  title?: string;
  hasActionItems?: boolean;
  hasCalendarEvent?: boolean;
  audioUrl?: string;
  audioDurationSeconds?: number;
}

export async function saveNote(params: SaveNoteParams) {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('notes')
    .insert({
      user_id: params.userId,
      source: params.source,
      raw_transcript: params.transcript,
      transcript: params.transcript,
      formatted_content: params.formattedContent || params.transcript,
      title: params.title,
      has_action_items: params.hasActionItems || false,
      has_calendar_event: params.hasCalendarEvent || false,
      audio_url: params.audioUrl,
      audio_duration_seconds: params.audioDurationSeconds,
      language: params.language,
      ai_confidence: params.aiConfidence,
      processing_time_ms: params.processingTimeMs,
      processed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save note: ${error.message}`);
  }

  return data;
}
