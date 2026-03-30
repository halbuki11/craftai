import { createServiceClient } from '@/lib/supabase/server';

export async function recordDelivery(params: {
  noteId: string;
  integration: string;
  status: 'pending' | 'success' | 'failed';
  externalId?: string;
  errorMessage?: string;
}) {
  const supabase = createServiceClient();

  // Find integration_id for this user's integration
  // For now, simplified version
  const { data, error } = await supabase
    .from('note_deliveries')
    .insert({
      note_id: params.noteId,
      provider: params.integration,
      status: params.status,
      external_id: params.externalId,
      error_message: params.errorMessage,
      delivered_at: params.status === 'success' ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) {
    // Don't throw - delivery recording failure shouldn't block the flow
    // Don't throw - this is just logging
  }

  return data;
}
