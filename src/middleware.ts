import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

// In-memory rate limiter — resets on cold start (fine for Vercel serverless)
const WINDOW_MS = 60_000;

const LIMITS = {
  authed: 10,   // logged-in users: 10 req/min
  guest: 3,     // guests: 3 req/min (stricter)
  export: 10,   // export: 10 req/min per IP
};

const store = new Map<string, { count: number; resetAt: number }>();

function getIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

function checkLimit(key: string, max: number): boolean {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  entry.count++;
  return entry.count <= max;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip = getIP(req);

  if (pathname === '/api/analyze') {
    const session = await auth();
    const isAuthed = !!session?.user?.id;
    const key = `analyze:${isAuthed ? `user:${session!.user!.id}` : `ip:${ip}`}`;
    const max = isAuthed ? LIMITS.authed : LIMITS.guest;

    if (!checkLimit(key, max)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }
  }

  if (pathname === '/api/export') {
    if (!checkLimit(`export:ip:${ip}`, LIMITS.export)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/analyze', '/api/export'],
};
