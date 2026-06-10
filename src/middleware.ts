import { NextRequest, NextResponse } from 'next/server';

// In-memory rate limiter — resets on cold start (fine for Vercel serverless)
// 10 requests per minute per IP on /api/analyze
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;
const store = new Map<string, { count: number; resetAt: number }>();

function getIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === '/api/analyze') {
    const ip = getIP(req);
    const now = Date.now();
    const entry = store.get(ip);

    if (!entry || now > entry.resetAt) {
      store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    } else {
      entry.count++;
      if (entry.count > MAX_REQUESTS) {
        return NextResponse.json(
          { error: 'Too many requests. Please wait a minute.' },
          { status: 429, headers: { 'Retry-After': '60' } }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/analyze',
};
