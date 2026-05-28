import { useState } from 'react';
import { checkPassword } from '../lib/validation';

export function Settings({ initialEmail = '' }: { initialEmail?: string }) {
  const [email, setEmail] = useState(initialEmail);
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  function save() {
    const pwErr = newPassword ? checkPassword(newPassword) : null;
    if (pwErr) {
      setMessage(pwErr);
      return;
    }
    setMessage('Saved');
  }

  return (
    <main data-testid="settings" style={{ maxWidth: 520 }}>
      <h1 className="page-title">Settings</h1>
      <p className="page-sub">Manage your account.</p>

      <div className="card" style={{ padding: 24 }}>
        <label className="field" style={{ marginTop: 0 }}>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="email"
            className="input"
          />
        </label>
        <label className="field">
          <span>New password</span>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            aria-label="new password"
            className="input"
            placeholder="Leave blank to keep current"
          />
        </label>
        {message && (
          <p
            data-testid="settings-message"
            style={{ color: message === 'Saved' ? 'var(--done-fg)' : '#b91c1c', fontSize: 14 }}
          >
            {message}
          </p>
        )}
        <button onClick={save} data-testid="settings-save" className="btn btn--primary" style={{ marginTop: 16 }}>
          Save
        </button>
      </div>
    </main>
  );
}
