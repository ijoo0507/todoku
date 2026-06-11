import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getPool } from '@/lib/db';
import Stripe from 'stripe';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const pool = getPool();

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;
      const plan = sub.status === 'active' || sub.status === 'trialing' ? 'pro' : 'free';
      await pool.query(
        'UPDATE users SET plan = $1, stripe_subscription_id = $2 WHERE stripe_customer_id = $3',
        [plan, sub.id, customerId]
      );
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      await pool.query(
        'UPDATE users SET plan = $1, stripe_subscription_id = NULL WHERE stripe_customer_id = $2',
        ['free', sub.customer as string]
      );
      break;
    }
  }

  return NextResponse.json({ received: true });
}
