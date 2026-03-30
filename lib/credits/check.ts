import { createServiceClient } from '@/lib/supabase/server';
import { type ModelId, calculateCredits } from '@/lib/ai/model-config';
import type { CreditCheckResult } from './types';

/**
 * Pre-flight credit check. Read-only, no locks.
 * Call this BEFORE processing a request.
 */
export async function checkCredits(
  userId: string,
  model: ModelId,
  creditMultiplier: number = 1,
  extras: ('whisper_transcription' | 'dall_e_generation' | 'image_analysis')[] = []
): Promise<CreditCheckResult> {
  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from('user_credits')
    .select('credits_remaining, period_end')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return {
      allowed: false,
      credits_remaining: 0,
      credits_needed: 0,
      error: 'Kredi kaydı bulunamadı. Lütfen tekrar giriş yapın.',
    };
  }

  if (new Date(data.period_end) < new Date()) {
    return {
      allowed: false,
      credits_remaining: data.credits_remaining,
      credits_needed: 0,
      error: 'Abonelik süreniz dolmuş. Lütfen planınızı yenileyin.',
    };
  }

  const needed = calculateCredits(model, creditMultiplier, extras);

  if (data.credits_remaining < needed) {
    return {
      allowed: false,
      credits_remaining: data.credits_remaining,
      credits_needed: needed,
      error: `Yetersiz kredi. Kalan: ${data.credits_remaining}, Gereken: ${needed}`,
    };
  }

  return {
    allowed: true,
    credits_remaining: data.credits_remaining,
    credits_needed: needed,
  };
}

/**
 * Check if a model is allowed for the user's plan.
 */
export async function checkModelAccess(userId: string, model: ModelId): Promise<{ allowed: boolean; error?: string }> {
  const supabase = await createServiceClient();

  const { data } = await supabase
    .from('user_subscriptions')
    .select('plan_id, subscription_plans(allowed_models)')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (!data) {
    return { allowed: model === 'haiku', error: model !== 'haiku' ? 'Aktif abonelik bulunamadı.' : undefined };
  }

  const plan = data.subscription_plans as unknown as { allowed_models: string[] };
  if (!plan?.allowed_models?.includes(model)) {
    return {
      allowed: false,
      error: `${model.charAt(0).toUpperCase() + model.slice(1)} modeli mevcut planınızda kullanılamaz. Lütfen planınızı yükseltin.`,
    };
  }

  return { allowed: true };
}
