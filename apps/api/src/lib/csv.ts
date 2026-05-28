export function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildCsv(rows: Array<Record<string, unknown>>, columns?: string[]): string {
  if (rows.length === 0 && !columns) return '';
  const cols = columns ?? Object.keys(rows[0]);
  const header = cols.join(',');
  const body = rows
    .map((row) => cols.map((c) => escapeCell(row[c])).join(','))
    .join('\n');
  return body ? `${header}\n${body}` : header;
}

export function parseCsv(input: string): Array<Record<string, string>> {
  const lines = input.split(/\r?\n/).filter((l) => l.length > 0);
  if (lines.length === 0) return [];
  const headers = splitRow(lines[0]);
  return lines.slice(1).map((line) => {
    const cells = splitRow(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = cells[i] ?? ''));
    return row;
  });
}

function splitRow(line: string): string[] {
  const out: string[] = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ',') {
        out.push(cell);
        cell = '';
      } else cell += ch;
    }
  }
  out.push(cell);
  return out;
}
