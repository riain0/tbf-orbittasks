import { db } from '../db/client';

export type Role = 'owner' | 'admin' | 'member' | 'viewer';

export interface Membership {
  workspaceId: number;
  userId: number;
  role: Role;
  joinedAt: number;
}

const ROLE_RANK: Record<Role, number> = {
  owner: 100,
  admin: 50,
  member: 10,
  viewer: 1,
};

export function addMember(workspaceId: number, userId: number, role: Role): Membership {
  const existing = db.find(
    'memberships',
    (r) => r.workspaceId === workspaceId && r.userId === userId,
  );
  if (existing) throw new Error('user already a member');
  return db.insert('memberships', {
    workspaceId,
    userId,
    role,
    joinedAt: Date.now(),
  }) as unknown as Membership;
}

export function removeMember(workspaceId: number, userId: number): boolean {
  const m = db.find(
    'memberships',
    (r) => r.workspaceId === workspaceId && r.userId === userId,
  );
  if (!m) return false;
  if ((m as unknown as Membership).role === 'owner') throw new Error('cannot remove owner');
  (m as { deletedAt?: number }).deletedAt = Date.now();
  return true;
}

export function roleOf(workspaceId: number, userId: number): Role | undefined {
  const m = db.find(
    'memberships',
    (r) =>
      r.workspaceId === workspaceId &&
      r.userId === userId &&
      !(r as { deletedAt?: number }).deletedAt,
  );
  return m ? (m as unknown as Membership).role : undefined;
}

export function canPerform(
  actorRole: Role | undefined,
  required: Role,
): boolean {
  if (!actorRole) return false;
  return ROLE_RANK[actorRole] >= ROLE_RANK[required];
}

export function listMembers(workspaceId: number): Membership[] {
  return db.list(
    'memberships',
    (r) =>
      r.workspaceId === workspaceId && !(r as { deletedAt?: number }).deletedAt,
  ) as unknown as Membership[];
}
