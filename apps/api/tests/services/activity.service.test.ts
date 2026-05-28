import {
  record,
  recentForWorkspace,
  recentForActor,
  countByType,
} from '../../src/services/activity.service';
import { db } from '../../src/db/client';

describe('activity service', () => {
  beforeEach(() => db.reset());

  it('records an event with timestamp', () => {
    const r = record({
      workspaceId: 1,
      actorId: 2,
      type: 'task.created',
      resourceId: 100,
    });
    expect(r.at).toBeGreaterThan(0);
    expect(r.type).toBe('task.created');
  });

  it('returns events newest first for a workspace', () => {
    record({ workspaceId: 1, actorId: 1, type: 'task.created', resourceId: 1 });
    record({ workspaceId: 1, actorId: 1, type: 'task.completed', resourceId: 2 });
    const list = recentForWorkspace(1);
    expect(list).toHaveLength(2);
    expect(list[0].at).toBeGreaterThanOrEqual(list[1].at);
  });

  it('respects the limit', () => {
    for (let i = 0; i < 10; i++) {
      record({ workspaceId: 1, actorId: 1, type: 'task.created', resourceId: i });
    }
    expect(recentForWorkspace(1, 3)).toHaveLength(3);
  });

  it('lists per actor', () => {
    record({ workspaceId: 1, actorId: 1, type: 'task.created', resourceId: 1 });
    record({ workspaceId: 1, actorId: 2, type: 'task.created', resourceId: 2 });
    expect(recentForActor(1)).toHaveLength(1);
    expect(recentForActor(2)).toHaveLength(1);
  });

  it('counts events by type since a time', () => {
    const cutoff = Date.now() - 1000;
    record({ workspaceId: 1, actorId: 1, type: 'task.created', resourceId: 1 });
    record({ workspaceId: 1, actorId: 1, type: 'task.created', resourceId: 2 });
    record({ workspaceId: 1, actorId: 1, type: 'task.completed', resourceId: 3 });
    const out = countByType(1, cutoff);
    expect(out['task.created']).toBe(2);
    expect(out['task.completed']).toBe(1);
  });
});
