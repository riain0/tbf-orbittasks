import {
  ValidationError,
  requireString,
  requireNumber,
  requireOneOf,
  optionalString,
} from '../../src/lib/validation';

describe('validation lib', () => {
  describe('requireString', () => {
    it('returns trimmed string', () => {
      expect(requireString('  hi  ', 'name')).toBe('hi');
    });

    it('throws on non-string', () => {
      expect(() => requireString(123, 'name')).toThrow(ValidationError);
    });

    it('throws on empty', () => {
      expect(() => requireString('   ', 'name')).toThrow('name: is required');
    });

    it('respects min length', () => {
      expect(() => requireString('hi', 'name', { min: 3 })).toThrow();
    });

    it('respects max length', () => {
      expect(() => requireString('hellohello', 'name', { max: 5 })).toThrow();
    });
  });

  describe('requireNumber', () => {
    it('returns value when valid', () => {
      expect(requireNumber(7, 'age')).toBe(7);
    });

    it('rejects NaN', () => {
      expect(() => requireNumber(NaN, 'age')).toThrow();
    });

    it('rejects non-number', () => {
      expect(() => requireNumber('7', 'age')).toThrow();
    });

    it('rejects non-integer when integer required', () => {
      expect(() => requireNumber(3.5, 'count', { integer: true })).toThrow();
    });

    it('respects min/max', () => {
      expect(() => requireNumber(-1, 'age', { min: 0 })).toThrow();
      expect(() => requireNumber(150, 'age', { max: 120 })).toThrow();
    });
  });

  describe('requireOneOf', () => {
    it('accepts an allowed value', () => {
      expect(requireOneOf('todo', 'status', ['todo', 'done'] as const)).toBe('todo');
    });

    it('rejects an unknown value', () => {
      expect(() =>
        requireOneOf('maybe', 'status', ['todo', 'done'] as const),
      ).toThrow();
    });
  });

  describe('optionalString', () => {
    it('returns undefined for undefined input', () => {
      expect(optionalString(undefined, 'name')).toBeUndefined();
    });

    it('returns undefined for null', () => {
      expect(optionalString(null, 'name')).toBeUndefined();
    });

    it('validates when present', () => {
      expect(optionalString('hi', 'name')).toBe('hi');
      expect(() => optionalString('', 'name')).toThrow();
    });
  });

  describe('ValidationError', () => {
    it('exposes field and message', () => {
      const err = new ValidationError('email', 'is invalid');
      expect(err.field).toBe('email');
      expect(err.message).toBe('email: is invalid');
    });
  });
});
