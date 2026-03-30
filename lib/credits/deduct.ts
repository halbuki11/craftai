import { createServiceClient } from '@/lib/supabase/server';
import type { ModelId } from '@/lib/ai/model-config';
import type { DeductionResult } from './types';
import { logger } from '@/lib/logger';

const log = logger.child('credits');

/**
 * Atomically deduct credits after a successful request.
 * Uses PostgreSQL FOR UPDATE to prevent race conditions.
 */
export async function deductCredits(params: {
  userId: string;
  credits: number;
  model: ModelId;
  skillId?: string;
  actionType?: string;
  source: 'web' | 'telegram' | 'whatsapp' | 'api';
  metadata?: Record<string, unknown>;
}): Promise<DeductionResult> {
  const supabase = await createServiceClient();

  const { data, error } = await supabase.rpc('deduct_credits', {
    p_user_id: params.userId,
    p_credits: params.credits,
    p_model: params.model,
    p_skill_id: params.skillId || null,
    p_action_type: params.actionType || null,
    p_source: params.source,
    p_metadata: params.metadata || {},
  });

  if (error) {
    log.error('Credit deduction RPC error', error as unknown as Error, { userId: params.userId });
    return { success: false, remaining: 0, error_message: error.message };
  }

  const result = data?.[0] || { success: false, remaining: 0, error_message: 'Bilinmeyen hata' };

  if (result.success) {
    log.info('Credits deducted', {
      userId: params.userId,
      credits: params.credits,
      remaining: result.remaining,
      model: params.model,
    });
  } else {
    log.warn('Credit deduction failed', {
      userId: params.userId,
      reason: result.error_message,
    });
  }

  return result;
}
