// W5 step 2: test suite for auth.service.ts, which previously had zero tests.
// Generated with AI under the comprehension-preserving prompt, then reviewed
// like a PR: imports use relative paths, token claims are checked via the
// public verifyToken (not by reaching into the JWT payload), and the
// invalid-credentials path is covered for both wrong password and unknown user.
import {
  registerUser,
  loginUser,
  verifyToken,
  getUserById,
} from '../src/services/auth.service';
import { db } from '../src/db/client';

describe('auth.service', () => {
  beforeEach(() => {
    db.reset();
  });

  const valid = { email: 'ada@orbittasks.local', name: 'Ada', password: 'hunter2-strong' };

  describe('registerUser', () => {
    it('creates a user and returns a token, without the password hash', async () => {
      const { user, token } = await registerUser(valid);
      expect(user.email).toBe(valid.email);
      expect(user.name).toBe('Ada');
      expect(user.role).toBe('member');
      expect((user as Record<string, unknown>).passwordHash).toBeUndefined();
      expect(typeof token).toBe('string');
    });

    it('issues a token whose claims resolve to the new user', async () => {
      const { user, token } = await registerUser(valid);
      const claims = verifyToken(token);
      expect(claims.userId).toBe(user.id);
      expect(claims.role).toBe('member');
    });

    it('rejects an email without an @', async () => {
      await expect(registerUser({ ...valid, email: 'nope' })).rejects.toThrow('invalid email');
    });

    it('rejects a password shorter than 8 characters', async () => {
      await expect(registerUser({ ...valid, password: 'short' })).rejects.toThrow(
        'password too short',
      );
    });

    it('rejects a duplicate email', async () => {
      await registerUser(valid);
      await expect(registerUser(valid)).rejects.toThrow('email already registered');
    });
  });

  describe('loginUser', () => {
    it('returns a user and token for correct credentials', async () => {
      await registerUser(valid);
      const { user, token } = await loginUser(valid.email, valid.password);
      expect(user.email).toBe(valid.email);
      expect(verifyToken(token).userId).toBe(user.id);
    });

    it('rejects a wrong password', async () => {
      await registerUser(valid);
      await expect(loginUser(valid.email, 'wrong-password')).rejects.toThrow(
        'invalid credentials',
      );
    });

    it('rejects an unknown email', async () => {
      await expect(loginUser('ghost@orbittasks.local', 'whatever8')).rejects.toThrow(
        'invalid credentials',
      );
    });
  });

  describe('verifyToken', () => {
    it('throws on a malformed token', () => {
      expect(() => verifyToken('not-a-jwt')).toThrow();
    });
  });

  describe('getUserById', () => {
    it('returns the user without the password hash', async () => {
      const { user } = await registerUser(valid);
      const found = getUserById(user.id);
      expect(found?.email).toBe(valid.email);
      expect((found as Record<string, unknown>).passwordHash).toBeUndefined();
    });

    it('returns undefined for an unknown id', () => {
      expect(getUserById(99999)).toBeUndefined();
    });
  });
});
