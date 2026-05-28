// NOTE: this service has zero tests. Students will use AI tools to
// generate a test suite in Session 5.
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/client';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-prod';
const JWT_TTL = '7d';

export interface User {
  id: number;
  email: string;
  name: string;
  passwordHash: string;
  role: 'member' | 'admin';
}

export async function registerUser(input: {
  email: string;
  name: string;
  password: string;
}): Promise<{ user: Omit<User, 'passwordHash'>; token: string }> {
  if (!input.email.includes('@')) throw new Error('invalid email');
  if (input.password.length < 8) throw new Error('password too short');

  const existing = db.find('users', (r) => r.email === input.email);
  if (existing) throw new Error('email already registered');

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = db.insert('users', {
    email: input.email,
    name: input.name,
    passwordHash,
    role: 'member',
  }) as unknown as User;

  return { user: stripHash(user), token: signToken(user) };
}

export async function loginUser(
  email: string,
  password: string,
): Promise<{ user: Omit<User, 'passwordHash'>; token: string }> {
  const user = db.find('users', (r) => r.email === email) as User | undefined;
  if (!user) throw new Error('invalid credentials');

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error('invalid credentials');

  return { user: stripHash(user), token: signToken(user) };
}

export function verifyToken(token: string): { userId: number; role: string } {
  const payload = jwt.verify(token, JWT_SECRET) as unknown as {
    sub: number;
    role: string;
  };
  return { userId: payload.sub, role: payload.role };
}

export function getUserById(id: number): Omit<User, 'passwordHash'> | undefined {
  const user = db.find('users', (r) => r.id === id) as User | undefined;
  return user ? stripHash(user) : undefined;
}

function signToken(user: User): string {
  return jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_TTL,
  });
}

function stripHash(user: User): Omit<User, 'passwordHash'> {
  const rest: Omit<User, 'passwordHash'> & { passwordHash?: string } = { ...user };
  delete rest.passwordHash;
  return rest;
}
