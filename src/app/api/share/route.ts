export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createShare, parseShareInput } from '@/lib/shares';

export async function POST(req: NextRequest) {
  try {
    const input = parseShareInput(await req.json());
    if (!input) return NextResponse.json({ error: 'Invalid share data' }, { status: 400 });
    const id = await createShare(input);
    return NextResponse.json({ id });
  } catch (err) {
    console.error('share error:', err);
    return NextResponse.json({ error: 'Could not create share link' }, { status: 500 });
  }
}
