import { createServiceClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

const log = logger.child('tokens');

export interface DeductionResult {
  success: boolean;
  remaining: number;
  error_message: string | null;
}

/**
 * Deduct actual tokens used from user's pool.
 * All models share the same token pool.
 */
export async function deductTokens(params: {
  userId: string;
  tokens: number;
  model: string;
  source: 'web' | 'api';
}): Promise<DeductionResult> {
  const supabase = await createServiceClient();

  const { data, error } = await supabase.rpc('deduct_credits', {
    p_user_id: params.userId,
    p_credits: params.tokens,
    p_model: params.model,
    p_skill_id: null,
    p_action_type: 'chat',
    p_source: params.source,
    p_metadata: { tokens: params.tokens },
  });

  if (error) {
    log.error('Token deduction RPC error', error as unknown as Error, { userId: params.userId });
    return { success: false, remaining: 0, error_message: error.message };
  }

  const result = data?.[0] || { success: false, remaining: 0, error_message: 'Unknown error' };

  if (result.success) {
    log.info('Tokens deducted', {
      userId: params.userId,
      tokens: params.tokens,
      remaining: result.remaining,
      model: params.model,
    });
  }

  return result;
}
