import { escapeCell, buildCsv, parseCsv } from '../../src/lib/csv';

describe('csv lib', () => {
  describe('escapeCell', () => {
    it('returns plain string unchanged', () => {
      expect(escapeCell('hello')).toBe('hello');
    });

    it('quotes when value contains comma', () => {
      expect(escapeCell('a,b')).toBe('"a,b"');
    });

    it('escapes embedded quotes', () => {
      expect(escapeCell('he said "hi"')).toBe('"he said ""hi"""');
    });

    it('returns empty for null/undefined', () => {
      expect(escapeCell(null)).toBe('');
      expect(escapeCell(undefined)).toBe('');
    });

    it('quotes when value contains newline', () => {
      expect(escapeCell('a\nb')).toBe('"a\nb"');
    });
  });

  describe('buildCsv', () => {
    it('builds header + body', () => {
      const out = buildCsv([{ a: 1, b: 2 }, { a: 3, b: 4 }]);
      expect(out).toBe('a,b\n1,2\n3,4');
    });

    it('uses specified column order', () => {
      const out = buildCsv([{ a: 1, b: 2 }], ['b', 'a']);
      expect(out).toBe('b,a\n2,1');
    });

    it('returns empty for empty input', () => {
      expect(buildCsv([])).toBe('');
    });

    it('escapes values with commas in body', () => {
      const out = buildCsv([{ name: 'a,b' }]);
      expect(out).toContain('"a,b"');
    });
  });

  describe('parseCsv', () => {
    it('parses a simple file', () => {
      const rows = parseCsv('a,b\n1,2\n3,4');
      expect(rows).toEqual([
        { a: '1', b: '2' },
        { a: '3', b: '4' },
      ]);
    });

    it('handles quoted cells with commas', () => {
      const rows = parseCsv('a,b\n"x,y",z');
      expect(rows).toEqual([{ a: 'x,y', b: 'z' }]);
    });

    it('returns empty array for empty input', () => {
      expect(parseCsv('')).toEqual([]);
    });
  });
});
