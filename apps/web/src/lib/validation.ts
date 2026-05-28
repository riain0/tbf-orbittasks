export function isValidEmail(input: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
}

export interface PasswordPolicy {
  minLength: number;
}

export function checkPassword(input: string, policy: PasswordPolicy = { minLength: 8 }): string | null {
  if (input.length < policy.minLength) return `Must be at least ${policy.minLength} characters`;
  if (!/[A-Z]/.test(input)) return 'Must contain an uppercase letter';
  if (!/[0-9]/.test(input)) return 'Must contain a number';
  return null;
}

export function isNonEmpty(input: string): boolean {
  return input.trim().length > 0;
}
