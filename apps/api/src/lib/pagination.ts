export interface PageInput {
  cursor?: string;
  limit?: number;
}

export interface Page<T> {
  items: T[];
  nextCursor?: string;
  hasMore: boolean;
}

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

export function parseLimit(input: number | string | undefined): number {
  const n = typeof input === 'string' ? Number(input) : (input ?? DEFAULT_LIMIT);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_LIMIT;
  return Math.min(Math.floor(n), MAX_LIMIT);
}

export function encodeCursor(value: number | string): string {
  return Buffer.from(String(value), 'utf8').toString('base64url');
}

export function decodeCursor(cursor: string): string | undefined {
  if (!cursor) return undefined;
  try {
    return Buffer.from(cursor, 'base64url').toString('utf8');
  } catch {
    return undefined;
  }
}

export function paginate<T extends { id: number }>(items: T[], input: PageInput): Page<T> {
  const limit = parseLimit(input.limit);
  const cursorValue = input.cursor ? Number(decodeCursor(input.cursor)) : undefined;
  const filtered = cursorValue !== undefined
    ? items.filter((i) => i.id > cursorValue)
    : items;
  const sorted = [...filtered].sort((a, b) => a.id - b.id);
  const sliced = sorted.slice(0, limit);
  const hasMore = sorted.length > limit;
  return {
    items: sliced,
    nextCursor: hasMore ? encodeCursor(sliced[sliced.length - 1].id) : undefined,
    hasMore,
  };
}
