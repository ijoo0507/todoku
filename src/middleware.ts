import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { checkLimit } from '@/lib/ratelimit';

function getIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

function tooMany(retryAfter: number) {
  return NextResponse.json(
    { error: 'Too many requests. Please wait a minute.' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip = getIP(req);

  if (pathname === '/api/analyze') {
    const session = await auth();
    const isAuthed = !!session?.user?.id;
    const key = `analyze:${isAuthed ? `user:${session!.user!.id}` : `ip:${ip}`}`;
    const { ok, retryAfter } = await checkLimit(isAuthed ? 'analyzeAuthed' : 'analyzeGuest', key);
    if (!ok) return tooMany(retryAfter);
  }

  if (pathname === '/api/export') {
    const { ok, retryAfter } = await checkLimit('export', `export:ip:${ip}`);
    if (!ok) return tooMany(retryAfter);
  }

  if (pathname === '/api/share' && req.method === 'POST') {
    const { ok, retryAfter } = await checkLimit('share', `share:ip:${ip}`);
    if (!ok) return tooMany(retryAfter);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/analyze', '/api/export', '/api/share'],
};
