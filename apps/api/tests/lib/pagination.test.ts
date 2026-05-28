import {
  parseLimit,
  encodeCursor,
  decodeCursor,
  paginate,
} from '../../src/lib/pagination';

describe('pagination lib', () => {
  describe('parseLimit', () => {
    it('returns default when undefined', () => {
      expect(parseLimit(undefined)).toBe(25);
    });

    it('parses numeric string', () => {
      expect(parseLimit('10')).toBe(10);
    });

    it('caps at maximum', () => {
      expect(parseLimit(500)).toBe(100);
    });

    it('falls back on garbage', () => {
      expect(parseLimit('abc')).toBe(25);
      expect(parseLimit(-5)).toBe(25);
      expect(parseLimit(0)).toBe(25);
    });
  });

  describe('encode / decode cursor', () => {
    it('round-trips a number', () => {
      const enc = encodeCursor(42);
      expect(decodeCursor(enc)).toBe('42');
    });

    it('round-trips a string', () => {
      const enc = encodeCursor('hello');
      expect(decodeCursor(enc)).toBe('hello');
    });
  });

  describe('paginate', () => {
    const data = Array.from({ length: 30 }, (_, i) => ({ id: i + 1 }));

    it('returns first page when no cursor', () => {
      const out = paginate(data, { limit: 5 });
      expect(out.items).toHaveLength(5);
      expect(out.items[0].id).toBe(1);
      expect(out.hasMore).toBe(true);
    });

    it('returns hasMore=false when at end', () => {
      const out = paginate(data.slice(0, 3), { limit: 5 });
      expect(out.hasMore).toBe(false);
      expect(out.nextCursor).toBeUndefined();
    });

    it('advances on next cursor', () => {
      const page1 = paginate(data, { limit: 5 });
      const page2 = paginate(data, { limit: 5, cursor: page1.nextCursor });
      expect(page2.items[0].id).toBe(6);
    });

    it('respects max limit', () => {
      const out = paginate(data, { limit: 9999 });
      expect(out.items.length).toBeLessThanOrEqual(100);
    });
  });
});
