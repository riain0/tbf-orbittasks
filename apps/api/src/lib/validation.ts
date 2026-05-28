export class ValidationError extends Error {
  constructor(public field: string, message: string) {
    super(`${field}: ${message}`);
    this.name = 'ValidationError';
  }
}

export function requireString(value: unknown, field: string, opts: { min?: number; max?: number } = {}): string {
  if (typeof value !== 'string') throw new ValidationError(field, 'must be a string');
  const trimmed = value.trim();
  if (trimmed.length === 0) throw new ValidationError(field, 'is required');
  if (opts.min !== undefined && trimmed.length < opts.min) {
    throw new ValidationError(field, `must be at least ${opts.min} characters`);
  }
  if (opts.max !== undefined && trimmed.length > opts.max) {
    throw new ValidationError(field, `must be at most ${opts.max} characters`);
  }
  return trimmed;
}

export function requireNumber(value: unknown, field: string, opts: { min?: number; max?: number; integer?: boolean } = {}): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new ValidationError(field, 'must be a number');
  }
  if (opts.integer && !Number.isInteger(value)) {
    throw new ValidationError(field, 'must be an integer');
  }
  if (opts.min !== undefined && value < opts.min) {
    throw new ValidationError(field, `must be at least ${opts.min}`);
  }
  if (opts.max !== undefined && value > opts.max) {
    throw new ValidationError(field, `must be at most ${opts.max}`);
  }
  return value;
}

export function requireOneOf<T extends string>(value: unknown, field: string, allowed: readonly T[]): T {
  if (typeof value !== 'string' || !allowed.includes(value as T)) {
    throw new ValidationError(field, `must be one of ${allowed.join(', ')}`);
  }
  return value as T;
}

export function optionalString(value: unknown, field: string, opts: { max?: number } = {}): string | undefined {
  if (value === undefined || value === null) return undefined;
  return requireString(value, field, opts);
}
