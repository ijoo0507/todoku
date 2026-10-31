export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getShare } from '@/lib/shares';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const share = await getShare(id);
    if (!share) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(share);
  } catch (err) {
    console.error('share fetch error:', err);
    return NextResponse.json({ error: 'Could not load share' }, { status: 500 });
  }
}
