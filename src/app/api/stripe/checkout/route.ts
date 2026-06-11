import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getStripe } from '@/lib/stripe';
import { getPool } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const stripe = getStripe();
  const pool = getPool();

  // Get or create Stripe customer
  const { rows } = await pool.query(
    'SELECT email, stripe_customer_id FROM users WHERE id = $1',
    [session.user.id]
  );
  const user = rows[0];
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  let customerId: string = user.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: session.user.id },
    });
    customerId = customer.id;
    await pool.query(
      'UPDATE users SET stripe_customer_id = $1 WHERE id = $2',
      [customerId, session.user.id]
    );
  }

  const origin = process.env.NEXTAUTH_URL ?? 'https://todoku.vercel.app';

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    allow_promotion_codes: true,   // enables coupon codes for friends
    success_url: `${origin}/?upgraded=1`,
    cancel_url: `${origin}/`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
