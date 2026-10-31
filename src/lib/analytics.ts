'use client';

import posthog from 'posthog-js';

export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;

type EventProps = Record<string, string | number | boolean | undefined>;

/** Fire-and-forget event capture. No-op when PostHog isn't configured. */
export function track(event: string, props?: EventProps) {
  if (!POSTHOG_KEY) return;
  try {
    posthog.capture(event, props);
  } catch {
    // analytics must never break the app
  }
}
