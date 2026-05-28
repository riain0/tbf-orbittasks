import {
  addMember,
  removeMember,
  roleOf,
  canPerform,
  listMembers,
} from '../../src/services/permissions.service';
import { db } from '../../src/db/client';

describe('permissions service', () => {
  beforeEach(() => db.reset());

  it('adds a member', () => {
    const m = addMember(1, 100, 'member');
    expect(m.role).toBe('member');
  });

  it('rejects duplicate member', () => {
    addMember(1, 100, 'member');
    expect(() => addMember(1, 100, 'admin')).toThrow('already a member');
  });

  it('returns role for an existing member', () => {
    addMember(1, 100, 'admin');
    expect(roleOf(1, 100)).toBe('admin');
  });

  it('returns undefined for a non-member', () => {
    expect(roleOf(1, 100)).toBeUndefined();
  });

  it('removes a non-owner member', () => {
    addMember(1, 100, 'member');
    expect(removeMember(1, 100)).toBe(true);
    expect(roleOf(1, 100)).toBeUndefined();
  });

  it('refuses to remove an owner', () => {
    addMember(1, 100, 'owner');
    expect(() => removeMember(1, 100)).toThrow('owner');
  });

  describe('canPerform', () => {
    it('owner can do everything', () => {
      expect(canPerform('owner', 'admin')).toBe(true);
      expect(canPerform('owner', 'viewer')).toBe(true);
    });

    it('viewer cannot do admin actions', () => {
      expect(canPerform('viewer', 'admin')).toBe(false);
    });

    it('member equal to required passes', () => {
      expect(canPerform('member', 'member')).toBe(true);
    });

    it('undefined role denies', () => {
      expect(canPerform(undefined, 'viewer')).toBe(false);
    });
  });

  it('lists all members in a workspace', () => {
    addMember(1, 100, 'owner');
    addMember(1, 101, 'member');
    addMember(1, 102, 'member');
    addMember(2, 200, 'owner');
    expect(listMembers(1)).toHaveLength(3);
    expect(listMembers(2)).toHaveLength(1);
  });
});
