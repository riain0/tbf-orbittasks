import {
  formatDuration,
  parseDuration,
  average,
  percentile,
} from '../../src/lib/duration';

describe('duration lib', () => {
  describe('formatDuration', () => {
    it('formats milliseconds', () => {
      expect(formatDuration(450)).toBe('450ms');
    });

    it('formats seconds', () => {
      expect(formatDuration(1500)).toBe('1.5s');
    });

    it('formats minutes', () => {
      expect(formatDuration(75_000)).toBe('1m 15s');
    });

    it('formats hours', () => {
      expect(formatDuration(3_660_000)).toBe('1h 1m');
    });

    it('clamps negative', () => {
      expect(formatDuration(-100)).toBe('0ms');
    });
  });

  describe('parseDuration', () => {
    it('parses milliseconds', () => {
      expect(parseDuration('500ms')).toBe(500);
    });

    it('parses seconds with decimals', () => {
      expect(parseDuration('1.5s')).toBe(1500);
    });

    it('parses minutes / hours / days', () => {
      expect(parseDuration('2m')).toBe(120_000);
      expect(parseDuration('1h')).toBe(3_600_000);
      expect(parseDuration('1d')).toBe(86_400_000);
    });

    it('returns undefined on garbage', () => {
      expect(parseDuration('nope')).toBeUndefined();
    });
  });

  describe('average', () => {
    it('computes simple mean', () => {
      expect(average([1, 2, 3, 4])).toBe(2.5);
    });

    it('returns 0 for empty', () => {
      expect(average([])).toBe(0);
    });
  });

  describe('percentile', () => {
    it('returns min at p=0', () => {
      expect(percentile([1, 5, 10], 0)).toBe(1);
    });

    it('returns max at p=100', () => {
      expect(percentile([1, 5, 10], 100)).toBe(10);
    });

    it('returns middle at p=50', () => {
      expect(percentile([1, 5, 10], 50)).toBe(5);
    });

    it('returns 0 for empty', () => {
      expect(percentile([], 50)).toBe(0);
    });
  });
});
