'use client';

import { useEffect } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import posthog from 'posthog-js';
import { POSTHOG_KEY, track } from '@/lib/analytics';

const SIGNUP_TRACKED_KEY = 'todoku-signup-tracked';

if (typeof window !== 'undefined' && POSTHOG_KEY) {
  posthog.init(POSTHOG_KEY, {
    // Proxied through next.config.ts rewrites so the CSP can stay 'self'
    api_host: '/ingest',
    ui_host: 'https://us.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: 'history_change',
    autocapture: false,
    disable_session_recording: true,
  });
}

// Links events to the signed-in user (by id only, no email or name) and fires
// `signup` once on the first authenticated session after account creation.
function SessionTracker() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (!POSTHOG_KEY || status !== 'authenticated' || !session?.user?.id) return;
    try {
      posthog.identify(session.user.id);
      if (session.isNewUser && !localStorage.getItem(SIGNUP_TRACKED_KEY)) {
        track('signup');
        localStorage.setItem(SIGNUP_TRACKED_KEY, '1');
      }
    } catch {
      // ignore storage or analytics errors
    }
  }, [status, session?.user?.id, session?.isNewUser]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionTracker />
      {children}
    </SessionProvider>
  );
}
