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

  const { rows } = await getPool().query(
    'SELECT stripe_customer_id FROM users WHERE id = $1',
    [session.user.id]
  );
  const customerId = rows[0]?.stripe_customer_id;
  if (!customerId) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
  }

  const origin = process.env.NEXTAUTH_URL ?? 'https://todoku.vercel.app';
  const portalSession = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: `${origin}/settings`,
  });

  return NextResponse.json({ url: portalSession.url });
}
