import { db } from '../db/client';

export type ActivityType =
  | 'task.created'
  | 'task.completed'
  | 'task.commented'
  | 'task.assigned'
  | 'project.created'
  | 'project.archived'
  | 'workspace.member_added';

export interface ActivityRecord {
  id: number;
  workspaceId: number;
  actorId: number;
  type: ActivityType;
  resourceId: number;
  at: number;
  meta?: Record<string, unknown>;
}

export function record(input: Omit<ActivityRecord, 'id' | 'at'>): ActivityRecord {
  return db.insert('activity', { ...input, at: Date.now() }) as unknown as ActivityRecord;
}

export function recentForWorkspace(workspaceId: number, limit = 50): ActivityRecord[] {
  const items = db.list(
    'activity',
    (r) => r.workspaceId === workspaceId,
  ) as unknown as ActivityRecord[];
  return items.sort((a, b) => b.at - a.at).slice(0, limit);
}

export function recentForActor(actorId: number, limit = 50): ActivityRecord[] {
  const items = db.list(
    'activity',
    (r) => r.actorId === actorId,
  ) as unknown as ActivityRecord[];
  return items.sort((a, b) => b.at - a.at).slice(0, limit);
}

export function countByType(
  workspaceId: number,
  since: number,
): Record<ActivityType, number> {
  const out: Record<string, number> = {};
  for (const item of db.list('activity', (r) => r.workspaceId === workspaceId && (r.at as number) >= since)) {
    const type = (item as unknown as ActivityRecord).type;
    out[type] = (out[type] ?? 0) + 1;
  }
  return out as Record<ActivityType, number>;
}
