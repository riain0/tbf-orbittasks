import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatRelativeDays,
  formatStatusLabel,
  initialsOf,
  truncate,
} from '../../src/lib/format';

describe('format lib', () => {
  describe('formatDate', () => {
    it('formats a real date', () => {
      const out = formatDate(new Date(2026, 4, 26));
      expect(out).toContain('May');
      expect(out).toContain('26');
      expect(out).toContain('2026');
    });

    it('returns em-dash on null', () => {
      expect(formatDate(null)).toBe('—');
    });

    it('returns em-dash on invalid input', () => {
      expect(formatDate('not a date')).toBe('—');
    });
  });

  describe('formatRelativeDays', () => {
    const now = new Date(2026, 4, 26);

    it('returns "today" for same day', () => {
      expect(formatRelativeDays(now, now)).toBe('today');
    });

    it('returns "tomorrow"', () => {
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      expect(formatRelativeDays(tomorrow, now)).toBe('tomorrow');
    });

    it('returns "yesterday"', () => {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      expect(formatRelativeDays(yesterday, now)).toBe('yesterday');
    });

    it('formats N days in the future', () => {
      const future = new Date(now);
      future.setDate(now.getDate() + 5);
      expect(formatRelativeDays(future, now)).toBe('in 5 days');
    });
  });

  describe('formatStatusLabel', () => {
    it('formats each status', () => {
      expect(formatStatusLabel('todo')).toBe('To do');
      expect(formatStatusLabel('doing')).toBe('In progress');
      expect(formatStatusLabel('done')).toBe('Done');
    });
  });

  describe('initialsOf', () => {
    it('returns uppercase initials', () => {
      expect(initialsOf('riain condon')).toBe('RC');
    });

    it('handles a single word', () => {
      expect(initialsOf('Cher')).toBe('C');
    });
  });

  describe('truncate', () => {
    it('does nothing when short enough', () => {
      expect(truncate('hi', 10)).toBe('hi');
    });

    it('truncates and appends an ellipsis', () => {
      expect(truncate('hello world', 8)).toBe('hello w…');
    });
  });
});
