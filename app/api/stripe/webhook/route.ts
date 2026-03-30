import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/client';
import { handleStripeWebhook } from '@/lib/stripe/webhooks';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    await handleStripeWebhook(event);

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('Stripe webhook error', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }
}
