import { db } from '../db/client';

export interface Tag {
  id: number;
  projectId: number;
  name: string;
  color: string;
}

const HEX = /^#[0-9a-fA-F]{6}$/;

export function createTag(projectId: number, name: string, color: string): Tag {
  if (!name || name.length === 0) throw new Error('tag name required');
  if (name.length > 30) throw new Error('tag name too long');
  if (!HEX.test(color)) throw new Error('color must be #RRGGBB');
  const existing = db.find(
    'tags',
    (r) => r.projectId === projectId && r.name === name,
  );
  if (existing) throw new Error('tag already exists');
  return db.insert('tags', { projectId, name, color }) as unknown as Tag;
}

export function listTags(projectId: number): Tag[] {
  return db.list('tags', (r) => r.projectId === projectId) as unknown as Tag[];
}

export function attachTagToTask(taskId: number, tagId: number): void {
  // M:N relationship table
  const existing = db.find(
    'task_tags',
    (r) => r.taskId === taskId && r.tagId === tagId,
  );
  if (!existing) db.insert('task_tags', { taskId, tagId });
}

export function detachTag(taskId: number, tagId: number): boolean {
  const link = db.find(
    'task_tags',
    (r) => r.taskId === taskId && r.tagId === tagId,
  );
  if (!link) return false;
  (link as { deletedAt?: number }).deletedAt = Date.now();
  return true;
}

export function tagsForTask(taskId: number): Tag[] {
  const links = db.list(
    'task_tags',
    (r) => r.taskId === taskId && !(r as { deletedAt?: number }).deletedAt,
  );
  const tagIds = links.map((l) => (l as { tagId: number }).tagId);
  return db.list('tags', (r) => tagIds.includes(r.id as number)) as unknown as Tag[];
}
