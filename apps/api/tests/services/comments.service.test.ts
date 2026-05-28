import {
  addComment,
  editComment,
  deleteComment,
  listForTask,
  commentMentions,
} from '../../src/services/comments.service';
import { db } from '../../src/db/client';

describe('comments service', () => {
  beforeEach(() => db.reset());

  it('adds a comment with trimmed body', () => {
    const c = addComment(1, 1, '  hello  ');
    expect(c.body).toBe('hello');
    expect(c.taskId).toBe(1);
    expect(c.authorId).toBe(1);
  });

  it('rejects empty body', () => {
    expect(() => addComment(1, 1, '   ')).toThrow('body is required');
  });

  it('rejects overlong body', () => {
    expect(() => addComment(1, 1, 'x'.repeat(6000))).toThrow('too long');
  });

  it('edits an existing comment', () => {
    const c = addComment(1, 1, 'original');
    const updated = editComment(c.id, 'edited');
    expect(updated.body).toBe('edited');
    expect(updated.editedAt).toBeDefined();
  });

  it('throws when editing missing comment', () => {
    expect(() => editComment(99, 'x')).toThrow('not found');
  });

  it('soft-deletes a comment', () => {
    const c = addComment(1, 1, 'gone');
    expect(deleteComment(c.id)).toBe(true);
    expect(listForTask(1)).toHaveLength(0);
  });

  it('returns false when deleting missing comment', () => {
    expect(deleteComment(999)).toBe(false);
  });

  it('lists only comments for the given task', () => {
    addComment(1, 1, 'a');
    addComment(1, 2, 'b');
    addComment(2, 1, 'c');
    expect(listForTask(1)).toHaveLength(2);
    expect(listForTask(2)).toHaveLength(1);
  });

  it('extracts @mentions and dedupes', () => {
    expect(commentMentions('hi @alice and @bob and @alice')).toEqual(['alice', 'bob']);
  });

  it('returns empty array when no mentions', () => {
    expect(commentMentions('plain comment')).toEqual([]);
  });
});
