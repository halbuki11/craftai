import { createServiceClient } from '@/lib/supabase/server';

export interface TokenCheckResult {
  allowed: boolean;
  tokens_remaining: number;
  error?: string;
}

/**
 * Check if user has tokens remaining.
 * Auto-renews free plan credits when period expires.
 */
export async function checkTokens(userId: string): Promise<TokenCheckResult> {
  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from('user_credits')
    .select('credits_remaining, credits_total, period_end')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return {
      allowed: false,
      tokens_remaining: 0,
      error: 'No token balance found. Please sign in again.',
    };
  }

  // If period expired, auto-renew if plan is still active
  if (new Date(data.period_end) < new Date()) {
    const renewed = await autoRenewPlan(supabase, userId);
    if (renewed) {
      return { allowed: true, tokens_remaining: renewed.credits };
    }
    return {
      allowed: false,
      tokens_remaining: 0,
      error: 'Your plan is not active. Please subscribe.',
    };
  }

  if (data.credits_remaining <= 0) {
    return {
      allowed: false,
      tokens_remaining: 0,
      error: 'No tokens remaining. Please upgrade your plan.',
    };
  }

  return {
    allowed: true,
    tokens_remaining: data.credits_remaining,
  };
}

/**
 * Auto-renew credits for any active plan when period expires.
 * Returns the new credit amount if renewed, null if not eligible.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function autoRenewPlan(supabase: any, userId: string): Promise<{ credits: number } | null> {
  const { data: sub } = await supabase
    .from('user_subscriptions')
    .select('plan_id, status')
    .eq('user_id', userId)
    .single();

  if (!sub || sub.status !== 'active') return null;

  const { data: plan } = await supabase
    .from('subscription_plans')
    .select('credits_per_month')
    .eq('id', sub.plan_id)
    .single();

  const credits = plan?.credits_per_month || 15000;

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setDate(periodEnd.getDate() + 30);

  await supabase.rpc('reset_credits', {
    p_user_id: userId,
    p_credits: credits,
    p_period_start: now.toISOString(),
    p_period_end: periodEnd.toISOString(),
  });

  return { credits };
}

/**
 * Check if a model is allowed for the user's plan.
 */
export async function checkModelAccess(
  userId: string,
  model: string,
): Promise<{ allowed: boolean; error?: string }> {
  const supabase = await createServiceClient();

  const { data } = await supabase
    .from('user_subscriptions')
    .select('plan_id, subscription_plans(allowed_models)')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (!data) {
    // No subscription — only allow cheapest models
    const freeModels = ['haiku', 'gpt-4o-mini'];
    return {
      allowed: freeModels.includes(model),
      error: freeModels.includes(model) ? undefined : 'Upgrade your plan to use this model.',
    };
  }

  const plan = data.subscription_plans as unknown as { allowed_models: string[] };
  if (!plan?.allowed_models?.includes(model)) {
    return {
      allowed: false,
      error: `${model} is not available on your plan. Please upgrade.`,
    };
  }

  return { allowed: true };
}
