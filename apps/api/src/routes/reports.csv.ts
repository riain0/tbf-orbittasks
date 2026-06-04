// W5 step 1: pure helpers extracted from the reports.ts CSV "god function".
// No behavior change — the CSV output is byte-for-byte what the inline code
// produced. Splitting it out makes each concern (date range, completion rate,
// bucketing, timezone formatting, row building) nameable and unit-testable.

export interface ReportTask {
  id: number;
  title: string;
  description: string;
  status: 'todo' | 'doing' | 'done';
  assigneeId: number | null;
  dueDate: string | null;
}

export interface EnrichedTask extends ReportTask {
  assigneeName: string;
}

export function filterByDateRange(
  tasks: ReportTask[],
  startDate?: string,
  endDate?: string,
): ReportTask[] {
  let out = tasks;
  if (startDate) {
    const start = new Date(startDate).getTime();
    out = out.filter((t) => (t.dueDate ? new Date(t.dueDate).getTime() >= start : false));
  }
  if (endDate) {
    const end = new Date(endDate).getTime();
    out = out.filter((t) => (t.dueDate ? new Date(t.dueDate).getTime() <= end : false));
  }
  return out;
}

export function completionRate(tasks: { status: string }[]): number {
  const total = tasks.length;
  if (total === 0) return 0;
  const done = tasks.filter((t) => t.status === 'done').length;
  return Math.round((done / total) * 100);
}

export function bucketBy(
  tasks: EnrichedTask[],
  groupBy: string,
): Record<string, EnrichedTask[]> {
  const buckets: Record<string, EnrichedTask[]> = {};
  for (const t of tasks) {
    const key =
      groupBy === 'status' ? t.status : groupBy === 'assignee' ? t.assigneeName : 'all';
    (buckets[key] ??= []).push(t);
  }
  return buckets;
}

// Timezone handling is still naive (the W2 fishbone target) — preserved as-is.
export function formatDateInTz(iso: string | null, tz: string): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (tz === 'UTC') return d.toISOString().slice(0, 10);
    return d.toLocaleDateString('en-US', { timeZone: tz });
  } catch {
    return iso;
  }
}

export function buildCsvRows(
  project: { name: string },
  buckets: Record<string, EnrichedTask[]>,
  opts: { completionRate: number; total: number; generatedAt: string; tz: string },
): string[] {
  const rows: string[] = [];
  rows.push(`# Project Report: ${project.name}`);
  rows.push(`# Generated: ${opts.generatedAt}`);
  rows.push(`# Completion rate: ${opts.completionRate}%`);
  rows.push(`# Total tasks: ${opts.total}`);
  rows.push(``);
  rows.push(['Bucket', 'TaskId', 'Title', 'Status', 'Assignee', 'DueDate'].join(','));
  for (const [bucket, items] of Object.entries(buckets)) {
    for (const t of items) {
      rows.push(
        [
          bucket,
          String(t.id),
          `"${t.title.replace(/"/g, '""')}"`,
          t.status,
          `"${t.assigneeName}"`,
          formatDateInTz(t.dueDate, opts.tz),
        ].join(','),
      );
    }
  }
  return rows;
}
