import { nanoid } from 'nanoid';
import { getPool } from './db';

export interface Share {
  id: string;
  score: number;
  totalUnique: number;
  known: number;
  title: string | null;
  createdAt: string;
}

export interface ShareInput {
  totalUnique: number;
  known: number;
  title?: string;
}

const MAX_TITLE = 100;
const MAX_WORDS = 1_000_000;

/** Validates untrusted input and computes the score server-side. Returns null if invalid. */
export function parseShareInput(body: unknown): (ShareInput & { score: number }) | null {
  if (!body || typeof body !== 'object') return null;
  const { totalUnique, known, title } = body as Record<string, unknown>;
  if (!Number.isInteger(totalUnique) || !Number.isInteger(known)) return null;
  const total = totalUnique as number;
  const k = known as number;
  if (total < 1 || total > MAX_WORDS || k < 0 || k > total) return null;
  const cleanTitle = typeof title === 'string' ? title.replace(/\s+/g, ' ').trim().slice(0, MAX_TITLE) : '';
  return {
    totalUnique: total,
    known: k,
    title: cleanTitle || undefined,
    score: Math.round((k / total) * 100),
  };
}

export async function createShare(input: ShareInput & { score: number }): Promise<string> {
  const id = nanoid(10);
  await getPool().query(
    'INSERT INTO shares (id, score, total_unique, known, title) VALUES ($1, $2, $3, $4, $5)',
    [id, input.score, input.totalUnique, input.known, input.title ?? null]
  );
  return id;
}

export async function getShare(id: string): Promise<Share | null> {
  if (!/^[A-Za-z0-9_-]{1,32}$/.test(id)) return null;
  const { rows } = await getPool().query(
    'SELECT id, score, total_unique, known, title, created_at FROM shares WHERE id = $1',
    [id]
  );
  const row = rows[0];
  if (!row) return null;
  return {
    id: row.id,
    score: row.score,
    totalUnique: row.total_unique,
    known: row.known,
    title: row.title,
    createdAt: new Date(row.created_at).toISOString(),
  };
}
