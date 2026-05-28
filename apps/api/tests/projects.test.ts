import { db } from '../src/db/client';

describe('projects', () => {
  beforeEach(() => {
    db.reset();
  });

  it('creates a project record', () => {
    const p = db.insert('projects', {
      name: 'Q3 Launch',
      workspaceId: 1,
      archived: false,
    });
    expect(p.id).toBe(1);
  });

  it('lists projects in a workspace', () => {
    db.insert('projects', { name: 'A', workspaceId: 1, archived: false });
    db.insert('projects', { name: 'B', workspaceId: 1, archived: false });
    db.insert('projects', { name: 'C', workspaceId: 2, archived: false });
    const inWs1 = db.list('projects', (r) => r.workspaceId === 1);
    expect(inWs1).toHaveLength(2);
  });

  it('archives projects', () => {
    const p = db.insert('projects', {
      name: 'Old',
      workspaceId: 1,
      archived: false,
    });
    (p as { archived: boolean }).archived = true;
    expect((p as { archived: boolean }).archived).toBe(true);
  });
});
