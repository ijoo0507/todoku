import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getStripe } from '@/lib/stripe';
import { getPool } from '@/lib/db';

export const runtime = 'nodejs';

// Called after returning from Stripe checkout to sync subscription status
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const pool = getPool();
  const { rows } = await pool.query(
    'SELECT stripe_customer_id FROM users WHERE id = $1',
    [session.user.id]
  );

  const customerId = rows[0]?.stripe_customer_id;
  if (!customerId) {
    // No customer yet — checkout may not have completed, return current plan
    return NextResponse.json({ plan: 'free' });
  }

  const stripe = getStripe();
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'all',
    limit: 5,
  });

  const active = subscriptions.data.find(
    s => s.status === 'active' || s.status === 'trialing'
  );

  const plan = active ? 'pro' : 'free';
  const subId = active?.id ?? null;

  await pool.query(
    'UPDATE users SET plan = $1, stripe_subscription_id = $2 WHERE id = $3',
    [plan, subId, session.user.id]
  );

  return NextResponse.json({ plan });
}
