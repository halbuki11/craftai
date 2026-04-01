import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const history = request.nextUrl.searchParams.get('history') === 'true';
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20', 10);

  const serviceClient = createServiceClient();

  // Get balance
  let { data: balance } = await serviceClient
    .from('user_credits')
    .select('credits_remaining, credits_total, period_start, period_end')
    .eq('user_id', user.id)
    .single();

  // Auto-renew any active plan if period expired
  if (balance && new Date(balance.period_end) < new Date()) {
    const { data: sub } = await serviceClient
      .from('user_subscriptions')
      .select('plan_id, status')
      .eq('user_id', user.id)
      .single();

    if (sub?.status === 'active') {
      const { data: plan } = await serviceClient
        .from('subscription_plans')
        .select('credits_per_month')
        .eq('id', sub.plan_id)
        .single();

      const credits = plan?.credits_per_month || 15000;
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setDate(periodEnd.getDate() + 30);

      await serviceClient.rpc('reset_credits', {
        p_user_id: user.id,
        p_credits: credits,
        p_period_start: now.toISOString(),
        p_period_end: periodEnd.toISOString(),
      });

      // Re-fetch updated balance
      const { data: updated } = await serviceClient
        .from('user_credits')
        .select('credits_remaining, credits_total, period_start, period_end')
        .eq('user_id', user.id)
        .single();

      if (updated) balance = updated;
    }
  }

  // Get subscription info
  const { data: subscription } = await serviceClient
    .from('user_subscriptions')
    .select('plan_id, status, current_period_end, cancel_at_period_end')
    .eq('user_id', user.id)
    .single();

  const result: Record<string, unknown> = {
    balance: balance || { credits_remaining: 0, credits_total: 0 },
    subscription: subscription || { plan_id: 'free', status: 'active' },
  };

  // Get usage history if requested
  if (history) {
    const { data: usage } = await serviceClient
      .from('credit_usage_logs')
      .select('id, credits_used, credits_remaining_after, model, skill_id, action_type, source, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    result.usage = usage || [];
  }

  return NextResponse.json(result);
}
