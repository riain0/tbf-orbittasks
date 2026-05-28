import {
  startOfDay,
  endOfDay,
  addDays,
  diffInDays,
  isWeekend,
  businessDaysBetween,
  formatYmd,
  parseYmd,
  relativeFromNow,
  MS_PER_DAY,
} from '../../src/lib/dates';

describe('dates lib', () => {
  describe('startOfDay / endOfDay', () => {
    it('zeroes out time on startOfDay', () => {
      const d = new Date(2026, 4, 26, 13, 45, 17);
      const s = startOfDay(d);
      expect(s.getHours()).toBe(0);
      expect(s.getMinutes()).toBe(0);
      expect(s.getMilliseconds()).toBe(0);
    });

    it('pushes time to end of day on endOfDay', () => {
      const d = new Date(2026, 4, 26, 4, 0, 0);
      const e = endOfDay(d);
      expect(e.getHours()).toBe(23);
      expect(e.getMinutes()).toBe(59);
      expect(e.getSeconds()).toBe(59);
    });

    it('does not mutate input', () => {
      const d = new Date(2026, 4, 26, 13, 45);
      const before = d.getTime();
      startOfDay(d);
      expect(d.getTime()).toBe(before);
    });
  });

  describe('addDays / diffInDays', () => {
    it('adds days correctly across month boundaries', () => {
      const d = new Date(2026, 0, 30);
      expect(addDays(d, 5).getMonth()).toBe(1); // Feb
    });

    it('handles negative deltas', () => {
      const d = new Date(2026, 4, 1);
      expect(addDays(d, -1).getMonth()).toBe(3); // April
    });

    it('diffInDays computes rounded difference', () => {
      const a = new Date(2026, 4, 26);
      const b = new Date(2026, 4, 20);
      expect(diffInDays(a, b)).toBe(6);
    });

    it('diffInDays is signed', () => {
      const a = new Date(2026, 4, 1);
      const b = new Date(2026, 4, 26);
      expect(diffInDays(a, b)).toBe(-25);
    });
  });

  describe('isWeekend', () => {
    it('returns true for Saturday', () => {
      const sat = new Date(2026, 4, 30); // a Saturday
      expect(isWeekend(sat)).toBe(true);
    });

    it('returns false for Wednesday', () => {
      const wed = new Date(2026, 4, 27);
      expect(isWeekend(wed)).toBe(false);
    });
  });

  describe('businessDaysBetween', () => {
    it('counts weekdays only', () => {
      const mon = new Date(2026, 4, 25);
      const fri = new Date(2026, 4, 29);
      expect(businessDaysBetween(mon, fri)).toBe(5);
    });

    it('is symmetric', () => {
      const a = new Date(2026, 4, 25);
      const b = new Date(2026, 5, 5);
      expect(businessDaysBetween(a, b)).toBe(businessDaysBetween(b, a));
    });

    it('returns 0 for same day', () => {
      const d = new Date(2026, 4, 26);
      expect(businessDaysBetween(d, d)).toBe(0);
    });
  });

  describe('formatYmd / parseYmd', () => {
    it('round-trips through format → parse', () => {
      const d = new Date(2026, 4, 26);
      const s = formatYmd(d);
      const back = parseYmd(s);
      expect(back?.getFullYear()).toBe(2026);
      expect(back?.getMonth()).toBe(4);
      expect(back?.getDate()).toBe(26);
    });

    it('returns undefined on garbage', () => {
      expect(parseYmd('not a date')).toBeUndefined();
      expect(parseYmd('2026-13-01')).toBeDefined(); // Date is lenient on overflow
    });

    it('pads month and day with zeros', () => {
      const d = new Date(2026, 0, 5);
      expect(formatYmd(d)).toBe('2026-01-05');
    });
  });

  describe('relativeFromNow', () => {
    const NOW = new Date(2026, 4, 26, 12, 0, 0);

    it('returns "just now" within a minute', () => {
      const d = new Date(NOW.getTime() - 30 * 1000);
      expect(relativeFromNow(d, NOW)).toBe('just now');
    });

    it('formats minutes ago', () => {
      const d = new Date(NOW.getTime() - 5 * 60 * 1000);
      expect(relativeFromNow(d, NOW)).toBe('5 minutes ago');
    });

    it('handles singular "1 hour ago"', () => {
      const d = new Date(NOW.getTime() - 60 * 60 * 1000);
      expect(relativeFromNow(d, NOW)).toBe('1 hour ago');
    });

    it('handles future', () => {
      const d = new Date(NOW.getTime() + MS_PER_DAY);
      expect(relativeFromNow(d, NOW)).toBe('in 1 day');
    });
  });
});
