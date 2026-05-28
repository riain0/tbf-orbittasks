export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function truncate(input: string, max: number, suffix = '…'): string {
  if (input.length <= max) return input;
  return input.slice(0, Math.max(0, max - suffix.length)) + suffix;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return `${count} ${count === 1 ? singular : plural ?? singular + 's'}`;
}

export function titleCase(input: string): string {
  return input
    .split(/\s+/)
    .map((w) => (w.length === 0 ? w : w[0].toUpperCase() + w.slice(1).toLowerCase()))
    .join(' ');
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

export function isEmail(input: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
}

export function maskEmail(input: string): string {
  const at = input.indexOf('@');
  if (at <= 0) return input;
  const head = input.slice(0, at);
  const tail = input.slice(at);
  if (head.length <= 2) return head[0] + '*'.repeat(head.length - 1) + tail;
  return head[0] + '*'.repeat(head.length - 2) + head[head.length - 1] + tail;
}

export function safeJsonParse<T>(input: string, fallback: T): T {
  try {
    return JSON.parse(input) as T;
  } catch {
    return fallback;
  }
}

export function wordCount(input: string): number {
  return input.trim().split(/\s+/).filter(Boolean).length;
}
