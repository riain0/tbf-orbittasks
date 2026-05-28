import { db } from '../src/db/client';

describe('workspaces', () => {
  beforeEach(() => {
    db.reset();
  });

  it('creates a workspace', () => {
    const ws = db.insert('workspaces', { name: 'Acme', ownerId: 1 });
    expect(ws.id).toBe(1);
  });

  it('lists workspaces for an owner', () => {
    db.insert('workspaces', { name: 'A', ownerId: 1 });
    db.insert('workspaces', { name: 'B', ownerId: 1 });
    db.insert('workspaces', { name: 'C', ownerId: 2 });
    const owned = db.list('workspaces', (r) => r.ownerId === 1);
    expect(owned).toHaveLength(2);
  });

  it('finds a workspace by id', () => {
    db.insert('workspaces', { name: 'X', ownerId: 1 });
    const ws = db.find('workspaces', (r) => r.name === 'X');
    expect(ws).toBeDefined();
  });
});
