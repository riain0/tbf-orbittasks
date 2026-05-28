import {
  attach,
  listForTask,
  totalSizeForWorkspace,
  humanReadableSize,
} from '../../src/services/files.service';
import { db } from '../../src/db/client';

describe('files service', () => {
  beforeEach(() => db.reset());

  it('attaches a file', () => {
    const f = attach({
      taskId: 1,
      uploaderId: 1,
      filename: 'note.txt',
      mimeType: 'text/plain',
      sizeBytes: 100,
    });
    expect(f.storageKey).toContain('tasks/1/');
    expect(f.storageKey).toContain('note.txt');
  });

  it('rejects empty file', () => {
    expect(() =>
      attach({
        taskId: 1,
        uploaderId: 1,
        filename: 'x',
        mimeType: 'text/plain',
        sizeBytes: 0,
      }),
    ).toThrow('empty');
  });

  it('rejects file over size limit', () => {
    expect(() =>
      attach({
        taskId: 1,
        uploaderId: 1,
        filename: 'big',
        mimeType: 'text/plain',
        sizeBytes: 100 * 1024 * 1024,
      }),
    ).toThrow('too large');
  });

  it('rejects unsupported mime type', () => {
    expect(() =>
      attach({
        taskId: 1,
        uploaderId: 1,
        filename: 'script.sh',
        mimeType: 'application/x-sh',
        sizeBytes: 100,
      }),
    ).toThrow('unsupported');
  });

  it('lists files for a task', () => {
    attach({ taskId: 1, uploaderId: 1, filename: 'a.txt', mimeType: 'text/plain', sizeBytes: 1 });
    attach({ taskId: 1, uploaderId: 1, filename: 'b.txt', mimeType: 'text/plain', sizeBytes: 2 });
    attach({ taskId: 2, uploaderId: 1, filename: 'c.txt', mimeType: 'text/plain', sizeBytes: 3 });
    expect(listForTask(1)).toHaveLength(2);
  });

  it('sums total size for a workspace', () => {
    db.insert('tasks', { id: 1, workspaceId: 7, status: 'todo' });
    db.insert('tasks', { id: 2, workspaceId: 7, status: 'todo' });
    attach({ taskId: 1, uploaderId: 1, filename: 'a.txt', mimeType: 'text/plain', sizeBytes: 1000 });
    attach({ taskId: 2, uploaderId: 1, filename: 'b.txt', mimeType: 'text/plain', sizeBytes: 2000 });
    expect(totalSizeForWorkspace(7)).toBe(3000);
  });

  describe('humanReadableSize', () => {
    it('handles bytes', () => {
      expect(humanReadableSize(500)).toBe('500 B');
    });

    it('handles kilobytes', () => {
      expect(humanReadableSize(2048)).toBe('2.0 KB');
    });

    it('handles megabytes', () => {
      expect(humanReadableSize(5 * 1024 * 1024)).toBe('5.0 MB');
    });

    it('handles gigabytes', () => {
      expect(humanReadableSize(2 * 1024 * 1024 * 1024)).toBe('2.00 GB');
    });
  });
});
