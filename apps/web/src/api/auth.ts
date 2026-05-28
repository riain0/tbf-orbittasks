import { request, setToken } from './client';

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'member' | 'admin';
}

export interface AuthResponse {
  user: User;
  token: string;
}

export async function login(email: string, password: string): Promise<User> {
  const { user, token } = await request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  setToken(token);
  return user;
}

export async function register(input: { email: string; name: string; password: string }): Promise<User> {
  const { user, token } = await request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: input,
  });
  setToken(token);
  return user;
}

export function logout(): void {
  setToken(null);
}
