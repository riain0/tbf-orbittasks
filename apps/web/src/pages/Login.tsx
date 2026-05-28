import { useState } from 'react';
import { login } from '../api/auth';
import { isValidEmail, isNonEmpty } from '../lib/validation';

export interface LoginProps {
  onSuccess?: () => void;
}

export function Login({ onSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!isNonEmpty(password)) {
      setError('Password is required');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth">
      <form
        onSubmit={handleSubmit}
        // Defer to the app's own validation (isValidEmail/isNonEmpty) instead of
        // the browser's native constraint validation, which would otherwise block
        // submit on an invalid email before handleSubmit runs.
        noValidate
        data-testid="login-form"
        className="auth__card"
      >
        <div className="auth__brand">
          <span className="brand-dot" aria-hidden="true" />
          OrbitTasks
        </div>
        <h1 className="auth__title">Sign in</h1>
        <p className="auth__sub">Welcome back. Sign in to your workspace.</p>

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="email"
            required
            className="input"
            placeholder="you@company.com"
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-label="password"
            required
            className="input"
            placeholder="••••••••"
          />
        </label>

        {error && (
          <p data-testid="login-error" className="auth__error">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          data-testid="login-submit"
          className="btn btn--primary btn--block"
          style={{ marginTop: 20 }}
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
