'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'todoku-known-words';

function loadFromStorage(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveToStorage(set: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

export function useVocab() {
  const [knownSet, setKnownSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    setKnownSet(loadFromStorage());
  }, []);

  const markKnown = useCallback((word: string) => {
    setKnownSet(prev => {
      const next = new Set(prev);
      next.add(word);
      saveToStorage(next);
      return next;
    });
  }, []);

  const markUnknown = useCallback((word: string) => {
    setKnownSet(prev => {
      const next = new Set(prev);
      next.delete(word);
      saveToStorage(next);
      return next;
    });
  }, []);

  const toggle = useCallback((word: string) => {
    setKnownSet(prev => {
      const next = new Set(prev);
      if (next.has(word)) next.delete(word);
      else next.add(word);
      saveToStorage(next);
      return next;
    });
  }, []);

  return { knownSet, markKnown, markUnknown, toggle };
}
