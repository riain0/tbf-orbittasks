import { db } from '../db/client';

export interface Comment {
  id: number;
  taskId: number;
  authorId: number;
  body: string;
  createdAt: number;
  editedAt?: number;
}

export function addComment(taskId: number, authorId: number, body: string): Comment {
  if (!body || body.trim().length === 0) throw new Error('comment body is required');
  if (body.length > 5000) throw new Error('comment too long');
  return db.insert('comments', {
    taskId,
    authorId,
    body: body.trim(),
    createdAt: Date.now(),
  }) as unknown as Comment;
}

export function editComment(id: number, body: string): Comment {
  const c = db.find('comments', (r) => r.id === id) as Comment | undefined;
  if (!c) throw new Error('comment not found');
  if (!body || body.trim().length === 0) throw new Error('comment body is required');
  c.body = body.trim();
  c.editedAt = Date.now();
  return c;
}

export function deleteComment(id: number): boolean {
  const c = db.find('comments', (r) => r.id === id);
  if (!c) return false;
  (c as { deletedAt?: number }).deletedAt = Date.now();
  return true;
}

export function listForTask(taskId: number): Comment[] {
  return db.list(
    'comments',
    (r) => r.taskId === taskId && !(r as { deletedAt?: number }).deletedAt,
  ) as unknown as Comment[];
}

export function commentMentions(body: string): string[] {
  const re = /@([a-zA-Z0-9_.-]+)/g;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    out.push(m[1]);
  }
  return Array.from(new Set(out));
}
