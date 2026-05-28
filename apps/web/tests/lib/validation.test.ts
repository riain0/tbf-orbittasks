import { describe, it, expect } from 'vitest';
import { isValidEmail, checkPassword, isNonEmpty } from '../../src/lib/validation';

describe('validation lib', () => {
  describe('isValidEmail', () => {
    it('accepts a standard email', () => {
      expect(isValidEmail('a@b.co')).toBe(true);
    });

    it('rejects missing @', () => {
      expect(isValidEmail('no-at-symbol')).toBe(false);
    });

    it('rejects missing tld', () => {
      expect(isValidEmail('a@b')).toBe(false);
    });
  });

  describe('checkPassword', () => {
    it('returns null on a strong password', () => {
      expect(checkPassword('Hunter22Pass')).toBeNull();
    });

    it('rejects when too short', () => {
      expect(checkPassword('Aa1')).toContain('at least');
    });

    it('rejects missing uppercase', () => {
      expect(checkPassword('hunter22pass')).toContain('uppercase');
    });

    it('rejects missing number', () => {
      expect(checkPassword('HunterPassword')).toContain('number');
    });
  });

  describe('isNonEmpty', () => {
    it('returns true for content', () => {
      expect(isNonEmpty('hi')).toBe(true);
    });

    it('returns false for whitespace', () => {
      expect(isNonEmpty('   ')).toBe(false);
    });
  });
});
