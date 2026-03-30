import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const history = request.nextUrl.searchParams.get('history') === 'true';
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20', 10);

  // Get balance
  const { data: balance } = await supabase
    .from('user_credits')
    .select('credits_remaining, credits_total, period_start, period_end')
    .eq('user_id', user.id)
    .single();

  // Get subscription info
  const { data: subscription } = await supabase
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
    const { data: usage } = await supabase
      .from('credit_usage_logs')
      .select('id, credits_used, credits_remaining_after, model, skill_id, action_type, source, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    result.usage = usage || [];
  }

  return NextResponse.json(result);
}
