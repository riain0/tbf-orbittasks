import {
  slugify,
  truncate,
  pluralize,
  titleCase,
  initials,
  isEmail,
  maskEmail,
  safeJsonParse,
  wordCount,
} from '../../src/lib/strings';

describe('strings lib', () => {
  describe('slugify', () => {
    it('lowercases and replaces spaces with dashes', () => {
      expect(slugify('Hello World')).toBe('hello-world');
    });

    it('strips punctuation', () => {
      expect(slugify('Q3 Launch!!')).toBe('q3-launch');
    });

    it('collapses repeated whitespace', () => {
      expect(slugify('  hello    world  ')).toBe('hello-world');
    });

    it('strips leading and trailing dashes', () => {
      expect(slugify('!!hello!!')).toBe('hello');
    });

    it('handles empty input', () => {
      expect(slugify('')).toBe('');
      expect(slugify('   ')).toBe('');
    });
  });

  describe('truncate', () => {
    it('does nothing when short enough', () => {
      expect(truncate('hi', 10)).toBe('hi');
    });

    it('truncates and appends ellipsis', () => {
      expect(truncate('hello world', 8)).toBe('hello w…');
    });

    it('respects custom suffix', () => {
      expect(truncate('hello world', 8, '...')).toBe('hello...');
    });
  });

  describe('pluralize', () => {
    it('uses singular for 1', () => {
      expect(pluralize(1, 'task')).toBe('1 task');
    });

    it('uses plural for not-1', () => {
      expect(pluralize(0, 'task')).toBe('0 tasks');
      expect(pluralize(2, 'task')).toBe('2 tasks');
    });

    it('respects an explicit plural', () => {
      expect(pluralize(2, 'person', 'people')).toBe('2 people');
    });
  });

  describe('titleCase', () => {
    it('capitalizes each word', () => {
      expect(titleCase('hello world')).toBe('Hello World');
    });

    it('handles mixed case input', () => {
      expect(titleCase('hELLO wORLD')).toBe('Hello World');
    });

    it('handles empty input', () => {
      expect(titleCase('')).toBe('');
    });
  });

  describe('initials', () => {
    it('returns first letters of first two words', () => {
      expect(initials('Riain Condon')).toBe('RC');
    });

    it('uppercases', () => {
      expect(initials('alice bob')).toBe('AB');
    });

    it('handles single word', () => {
      expect(initials('Cher')).toBe('C');
    });
  });

  describe('isEmail / maskEmail', () => {
    it('isEmail accepts standard format', () => {
      expect(isEmail('a@b.co')).toBe(true);
    });

    it('isEmail rejects missing @', () => {
      expect(isEmail('alice.example.com')).toBe(false);
    });

    it('maskEmail masks middle characters of local part', () => {
      expect(maskEmail('alice@example.com')).toMatch(/^a\*+e@/);
    });

    it('maskEmail short local part', () => {
      expect(maskEmail('a@b.co')).toBe('a@b.co');
    });
  });

  describe('safeJsonParse', () => {
    it('parses valid JSON', () => {
      expect(safeJsonParse<{ x: number }>('{"x":1}', { x: 0 })).toEqual({ x: 1 });
    });

    it('returns fallback on invalid JSON', () => {
      expect(safeJsonParse('not json', { x: 7 })).toEqual({ x: 7 });
    });
  });

  describe('wordCount', () => {
    it('counts whitespace-separated tokens', () => {
      expect(wordCount('hello world')).toBe(2);
      expect(wordCount('a b c d')).toBe(4);
    });

    it('returns 0 on empty', () => {
      expect(wordCount('')).toBe(0);
      expect(wordCount('   ')).toBe(0);
    });
  });
});
