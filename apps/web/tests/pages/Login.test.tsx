import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Login } from '../../src/pages/Login';

function mockFetch(response: unknown, ok = true, status = 200) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => response,
  });
}

describe('Login page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders email and password inputs', () => {
    render(<Login />);
    expect(screen.getByLabelText('email')).toBeInTheDocument();
    expect(screen.getByLabelText('password')).toBeInTheDocument();
  });

  it('rejects invalid email format on submit', async () => {
    render(<Login />);
    fireEvent.change(screen.getByLabelText('email'), { target: { value: 'not-email' } });
    fireEvent.change(screen.getByLabelText('password'), { target: { value: 'whatever' } });
    fireEvent.click(screen.getByTestId('login-submit'));
    // Browsers can short-circuit on the `type=email` HTML validation, so the
    // app's own error path runs when the validator gets through.
    const err = await screen.findByTestId('login-error');
    expect(err).toHaveTextContent(/valid email/);
  });

  it('shows server error on failed login', async () => {
    globalThis.fetch = mockFetch({ error: 'invalid credentials' }, false, 401);
    render(<Login />);
    fireEvent.change(screen.getByLabelText('email'), { target: { value: 'a@b.co' } });
    fireEvent.change(screen.getByLabelText('password'), { target: { value: 'hunter22' } });
    fireEvent.click(screen.getByTestId('login-submit'));
    await waitFor(() => {
      expect(screen.getByTestId('login-error')).toHaveTextContent(/invalid credentials/);
    });
  });

  it('calls onSuccess on a successful login', async () => {
    globalThis.fetch = mockFetch({
      user: { id: 1, email: 'a@b.co', name: 'A', role: 'member' },
      token: 'abc',
    });
    const onSuccess = vi.fn();
    render(<Login onSuccess={onSuccess} />);
    fireEvent.change(screen.getByLabelText('email'), { target: { value: 'a@b.co' } });
    fireEvent.change(screen.getByLabelText('password'), { target: { value: 'hunter22' } });
    fireEvent.click(screen.getByTestId('login-submit'));
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
  });

  // ⚠️ FLAKY TEST (≈50% failure rate).
  //
  // The login request resolves after a randomised 0–30 ms delay (real
  // networks are never instant). Instead of waiting for the result with
  // `waitFor`, this test sleeps a FIXED 15 ms and then asserts. When the
  // request happens to land inside the budget the assertion passes; when
  // it lands after, `onSuccess` hasn't fired yet and the test fails. The
  // 15 ms budget sits in the middle of the 0–30 ms window, so it flips
  // about half the time.
  //
  // Workshop 2 students will identify this as a missing-`waitFor` race:
  // the test guesses how long async work takes instead of waiting for the
  // condition. Workshop 5 students fix it together with the Fellow during
  // the live-demo by replacing the fixed sleep with
  // `await waitFor(() => expect(onSuccess).toHaveBeenCalled())`.
  it('signs in once the request resolves', async () => {
    globalThis.fetch = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                status: 200,
                json: async () => ({
                  user: { id: 1, email: 'a@b.co', name: 'A', role: 'member' },
                  token: 'abc',
                }),
              }),
            Math.random() * 30,
          ),
        ),
    );
    const onSuccess = vi.fn();
    render(<Login onSuccess={onSuccess} />);
    fireEvent.change(screen.getByLabelText('email'), { target: { value: 'a@b.co' } });
    fireEvent.change(screen.getByLabelText('password'), { target: { value: 'hunter22' } });
    fireEvent.click(screen.getByTestId('login-submit'));
    // BUG: fixed-time guess instead of waiting for the condition.
    await new Promise((r) => setTimeout(r, 15));
    expect(onSuccess).toHaveBeenCalled();
  });
});
