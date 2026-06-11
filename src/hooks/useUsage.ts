'use client';

import { useState, useEffect, useCallback } from 'react';

interface UsageData {
  guest: boolean;
  plan?: string;
  used: number;
  limit: number | null;
}

export function useUsage() {
  const [usage, setUsage] = useState<UsageData | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch('/api/usage');
    const data = await res.json();
    setUsage(data);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { usage, refresh };
}
