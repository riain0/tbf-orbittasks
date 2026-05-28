import {
  createTag,
  listTags,
  attachTagToTask,
  detachTag,
  tagsForTask,
} from '../../src/services/tags.service';
import { db } from '../../src/db/client';

describe('tags service', () => {
  beforeEach(() => db.reset());

  it('creates a tag', () => {
    const t = createTag(1, 'urgent', '#FF0000');
    expect(t.name).toBe('urgent');
    expect(t.color).toBe('#FF0000');
  });

  it('rejects duplicate within project', () => {
    createTag(1, 'urgent', '#FF0000');
    expect(() => createTag(1, 'urgent', '#FF0001')).toThrow('already exists');
  });

  it('allows same name in different project', () => {
    createTag(1, 'urgent', '#FF0000');
    expect(() => createTag(2, 'urgent', '#FF0001')).not.toThrow();
  });

  it('rejects bad color', () => {
    expect(() => createTag(1, 'x', 'red')).toThrow('must be #RRGGBB');
  });

  it('rejects overlong name', () => {
    expect(() => createTag(1, 'x'.repeat(40), '#FF0000')).toThrow('too long');
  });

  it('lists tags for a project', () => {
    createTag(1, 'a', '#000000');
    createTag(1, 'b', '#111111');
    createTag(2, 'c', '#222222');
    expect(listTags(1)).toHaveLength(2);
  });

  it('attaches and lists tag for a task', () => {
    const tag = createTag(1, 'review', '#00FF00');
    attachTagToTask(42, tag.id);
    expect(tagsForTask(42).map((t) => t.name)).toEqual(['review']);
  });

  it('attaching twice is a no-op', () => {
    const tag = createTag(1, 'x', '#00FF00');
    attachTagToTask(42, tag.id);
    attachTagToTask(42, tag.id);
    expect(tagsForTask(42)).toHaveLength(1);
  });

  it('detaches a tag from a task', () => {
    const tag = createTag(1, 'x', '#00FF00');
    attachTagToTask(42, tag.id);
    expect(detachTag(42, tag.id)).toBe(true);
    expect(tagsForTask(42)).toHaveLength(0);
  });
});
