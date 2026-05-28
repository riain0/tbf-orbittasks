export const MS_PER_SECOND = 1000;
export const MS_PER_MINUTE = 60 * MS_PER_SECOND;
export const MS_PER_HOUR = 60 * MS_PER_MINUTE;
export const MS_PER_DAY = 24 * MS_PER_HOUR;
export const MS_PER_WEEK = 7 * MS_PER_DAY;

export function startOfDay(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

export function endOfDay(d: Date): Date {
  const out = new Date(d);
  out.setHours(23, 59, 59, 999);
  return out;
}

export function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

export function diffInDays(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / MS_PER_DAY);
}

export function isWeekend(d: Date): boolean {
  const day = d.getDay();
  return day === 0 || day === 6;
}

export function businessDaysBetween(a: Date, b: Date): number {
  if (a.getTime() === b.getTime()) return 0;
  const [start, end] = a < b ? [a, b] : [b, a];
  let count = 0;
  const cursor = startOfDay(start);
  while (cursor <= end) {
    if (!isWeekend(cursor)) count++;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

export function formatYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseYmd(s: string): Date | undefined {
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return undefined;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (isNaN(d.getTime())) return undefined;
  return d;
}

export function relativeFromNow(d: Date, now = new Date()): string {
  const ms = now.getTime() - d.getTime();
  const abs = Math.abs(ms);
  if (abs < MS_PER_MINUTE) return ms >= 0 ? 'just now' : 'in a moment';
  if (abs < MS_PER_HOUR) {
    const mins = Math.floor(abs / MS_PER_MINUTE);
    return ms >= 0 ? `${mins} minute${mins === 1 ? '' : 's'} ago` : `in ${mins} minute${mins === 1 ? '' : 's'}`;
  }
  if (abs < MS_PER_DAY) {
    const hrs = Math.floor(abs / MS_PER_HOUR);
    return ms >= 0 ? `${hrs} hour${hrs === 1 ? '' : 's'} ago` : `in ${hrs} hour${hrs === 1 ? '' : 's'}`;
  }
  const days = Math.floor(abs / MS_PER_DAY);
  return ms >= 0 ? `${days} day${days === 1 ? '' : 's'} ago` : `in ${days} day${days === 1 ? '' : 's'}`;
}
