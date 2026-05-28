// Thin DB wrapper. In real life this would point at better-sqlite3.
//
// Two modes, chosen automatically:
//   * In-memory (default): used by the test suites. Nothing is persisted,
//     so `db.reset()` between tests keeps them isolated and fast. This is
//     the behaviour Workshop 1 students see when they run `npm test`.
//   * File-backed: used when DATABASE_URL points at a JSON file AND we are
//     NOT running under a test runner. This is what powers the live app —
//     `npm run seed` writes the file, the server loads it on boot, and
//     mutations (new tasks, status changes) are written back so your data
//     survives a restart. SQLite would do this for real; a JSON file keeps
//     the sample repo zero-setup.
//
// Note: DATABASE_URL is intentionally undocumented in .env.example. New
// developers discovering they need it is part of the Workshop 4 exercise.

import fs from 'fs';
import path from 'path';

type Row = Record<string, unknown>;

const IS_TEST = !!(
  process.env.JEST_WORKER_ID ||
  process.env.VITEST ||
  process.env.NODE_ENV === 'test'
);

function resolveDbFile(): string | null {
  if (IS_TEST) return null;
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  // Accept either a bare path or a `file:` URL.
  const p = url.startsWith('file:') ? url.slice('file:'.length) : url;
  return path.resolve(p);
}

class JsonDb {
  private tables = new Map<string, Row[]>();
  private readonly file = resolveDbFile();

  constructor() {
    this.load();
  }

  /** True when changes are being written to disk. */
  get persistent(): boolean {
    return this.file !== null;
  }

  private load(): void {
    if (!this.file || !fs.existsSync(this.file)) return;
    try {
      const raw = JSON.parse(fs.readFileSync(this.file, 'utf8')) as Record<string, Row[]>;
      this.tables = new Map(Object.entries(raw));
    } catch {
      // Corrupt or partial file — start empty rather than crash the server.
      this.tables = new Map();
    }
  }

  /** Persist the current state. No-op for the in-memory (test) store. */
  save(): void {
    if (!this.file) return;
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    const obj = Object.fromEntries(this.tables.entries());
    fs.writeFileSync(this.file, JSON.stringify(obj, null, 2));
  }

  table(name: string): Row[] {
    if (!this.tables.has(name)) this.tables.set(name, []);
    return this.tables.get(name)!;
  }

  insert(table: string, row: Row): Row {
    const rows = this.table(table);
    const nextId = rows.reduce((max, r) => Math.max(max, Number(r.id) || 0), 0) + 1;
    const withId = { id: nextId, ...row };
    rows.push(withId);
    this.save();
    return withId;
  }

  find(table: string, predicate: (r: Row) => boolean): Row | undefined {
    return this.table(table).find(predicate);
  }

  list(table: string, predicate?: (r: Row) => boolean): Row[] {
    const t = this.table(table);
    return predicate ? t.filter(predicate) : t.slice();
  }

  reset(): void {
    this.tables.clear();
  }
}

export const db = new JsonDb();
