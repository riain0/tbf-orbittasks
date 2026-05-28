import {
  extractFirstLine,
  stripMarkdown,
  previewOf,
  countMentions,
} from '../../src/lib/markdown';

describe('markdown lib', () => {
  describe('extractFirstLine', () => {
    it('returns the first non-heading line', () => {
      expect(extractFirstLine('# Title\nbody')).toBe('Title');
    });

    it('handles single-line input', () => {
      expect(extractFirstLine('hello')).toBe('hello');
    });

    it('strips heading markers', () => {
      expect(extractFirstLine('## Section')).toBe('Section');
    });
  });

  describe('stripMarkdown', () => {
    it('removes bold/italic markers', () => {
      expect(stripMarkdown('**bold** and _italic_')).toBe('bold and italic');
    });

    it('removes code fences', () => {
      expect(stripMarkdown('```js\ncode\n```\nrest')).toContain('rest');
      expect(stripMarkdown('```js\ncode\n```\nrest')).not.toContain('code');
    });

    it('replaces links with their text', () => {
      expect(stripMarkdown('[here](http://example.com)')).toBe('here');
    });

    it('removes blockquotes', () => {
      expect(stripMarkdown('> quoted')).toBe('quoted');
    });
  });

  describe('previewOf', () => {
    it('returns trimmed plain text', () => {
      const md = '# Hello\n\nThis is **bold** text.';
      expect(previewOf(md)).toContain('Hello');
      expect(previewOf(md)).toContain('bold');
    });

    it('respects max length', () => {
      const long = 'word '.repeat(200);
      expect(previewOf(long, 50).length).toBeLessThanOrEqual(50);
    });
  });

  describe('countMentions', () => {
    it('counts @-prefixed handles', () => {
      expect(countMentions('hi @alice and @bob')).toBe(2);
    });

    it('does not count emails', () => {
      expect(countMentions('contact alice@example.com')).toBe(0);
    });

    it('returns 0 for none', () => {
      expect(countMentions('plain text')).toBe(0);
    });
  });
});
