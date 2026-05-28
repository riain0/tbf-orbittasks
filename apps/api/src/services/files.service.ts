import { db } from '../db/client';

export interface FileAttachment {
  id: number;
  taskId: number;
  uploaderId: number;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  uploadedAt: number;
}

const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25 MB
const ALLOWED_MIME = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/json',
  'application/zip',
];

export function attach(input: {
  taskId: number;
  uploaderId: number;
  filename: string;
  mimeType: string;
  sizeBytes: number;
}): FileAttachment {
  if (input.sizeBytes <= 0) throw new Error('file is empty');
  if (input.sizeBytes > MAX_FILE_BYTES) throw new Error('file too large');
  if (!ALLOWED_MIME.includes(input.mimeType)) throw new Error('unsupported mime type');
  return db.insert('files', {
    ...input,
    storageKey: `tasks/${input.taskId}/${Date.now()}-${input.filename}`,
    uploadedAt: Date.now(),
  }) as unknown as FileAttachment;
}

export function listForTask(taskId: number): FileAttachment[] {
  return db.list('files', (r) => r.taskId === taskId) as unknown as FileAttachment[];
}

export function totalSizeForWorkspace(workspaceId: number): number {
  // Walk tasks → files. Realistic enough.
  const tasks = db.list('tasks', (t) => t.workspaceId === workspaceId);
  const taskIds = tasks.map((t) => (t as { id: number }).id);
  return db
    .list('files', (f) => taskIds.includes(f.taskId as number))
    .reduce((sum, f) => sum + ((f as { sizeBytes: number }).sizeBytes ?? 0), 0);
}

export function humanReadableSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}
