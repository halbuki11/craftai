import Stripe from 'stripe';
import { createServiceClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

const log = logger.child('stripe-webhook');

export async function handleStripeWebhook(event: Stripe.Event) {
  const supabase = await createServiceClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const planId = session.metadata?.plan_id;

      if (!userId || !planId) {
        log.error('Missing metadata in checkout session', undefined, { sessionId: session.id });
        break;
      }

      // Get plan details
      const { data: plan } = await supabase
        .from('subscription_plans')
        .select('credits_per_month')
        .eq('id', planId)
        .single();

      if (!plan) break;

      const periodStart = new Date();
      const periodEnd = new Date();
      periodEnd.setDate(periodEnd.getDate() + 30);

      // Create/update subscription
      await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: userId,
          plan_id: planId,
          status: 'active',
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          current_period_start: periodStart.toISOString(),
          current_period_end: periodEnd.toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      // Reset credits
      await supabase.rpc('reset_credits', {
        p_user_id: userId,
        p_credits: plan.credits_per_month,
        p_period_start: periodStart.toISOString(),
        p_period_end: periodEnd.toISOString(),
      });

      log.info('Subscription created', { userId, planId });
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice & { subscription?: string | { id: string } };
      const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;

      if (!subscriptionId) break;

      const { data: sub } = await supabase
        .from('user_subscriptions')
        .select('user_id, plan_id')
        .eq('stripe_subscription_id', subscriptionId)
        .single();

      if (!sub) break;

      const { data: plan } = await supabase
        .from('subscription_plans')
        .select('credits_per_month')
        .eq('id', sub.plan_id)
        .single();

      if (!plan) break;

      const periodStart = new Date();
      const periodEnd = new Date();
      periodEnd.setDate(periodEnd.getDate() + 30);

      // Update subscription period
      await supabase
        .from('user_subscriptions')
        .update({
          status: 'active',
          current_period_start: periodStart.toISOString(),
          current_period_end: periodEnd.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscriptionId);

      // Reset credits for new period
      await supabase.rpc('reset_credits', {
        p_user_id: sub.user_id,
        p_credits: plan.credits_per_month,
        p_period_start: periodStart.toISOString(),
        p_period_end: periodEnd.toISOString(),
      });

      log.info('Credits reset for new period', { userId: sub.user_id });
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice & { subscription?: string | { id: string } };
      const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;

      if (subscriptionId) {
        await supabase
          .from('user_subscriptions')
          .update({ status: 'past_due', updated_at: new Date().toISOString() })
          .eq('stripe_subscription_id', subscriptionId);

        log.warn('Payment failed', { subscriptionId });
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;

      await supabase
        .from('user_subscriptions')
        .update({ status: 'canceled', updated_at: new Date().toISOString() })
        .eq('stripe_subscription_id', subscription.id);

      log.info('Subscription canceled', { subscriptionId: subscription.id });
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;

      await supabase
        .from('user_subscriptions')
        .update({
          cancel_at_period_end: subscription.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id);
      break;
    }
  }
}
