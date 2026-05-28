import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { db } from '../db/client';
import { sendNotification } from '../services/notification.service';

export const reportsRouter = Router();

reportsRouter.use(requireAuth);

// ============================================================================
// NOTE for fellows reviewing this file:
//
// The function below is intentionally a single 180-ish line "god function".
// In Session 5 students will use AI tools to refactor it into smaller pieces.
// Please do NOT clean it up before then. The smell is the lesson.
// ============================================================================
reportsRouter.get('/project/:projectId.csv', async (req, res) => {
  const projectId = Number(req.params.projectId);
  const tz = (req.query.tz as string) || 'UTC';
  const includeArchived = req.query.includeArchived === 'true';
  const groupBy = (req.query.groupBy as string) || 'status';
  const startDate = req.query.startDate as string | undefined;
  const endDate = req.query.endDate as string | undefined;

  // Step 1: fetch project
  const project = db.find('projects', (r) => r.id === projectId) as
    | { id: number; name: string; workspaceId: number; archived: boolean }
    | undefined;
  if (!project) {
    res.status(404).json({ error: 'project not found' });
    return;
  }
  if (project.archived && !includeArchived) {
    res.status(404).json({ error: 'project archived' });
    return;
  }

  // Step 2: fetch all tasks
  const allTasks = db.list('tasks', (r) => r.projectId === projectId) as Array<{
    id: number;
    title: string;
    description: string;
    status: 'todo' | 'doing' | 'done';
    assigneeId: number | null;
    dueDate: string | null;
  }>;

  // Step 3: filter by date range if provided
  let tasks = allTasks;
  if (startDate) {
    const start = new Date(startDate).getTime();
    tasks = tasks.filter((t) => {
      if (!t.dueDate) return false;
      return new Date(t.dueDate).getTime() >= start;
    });
  }
  if (endDate) {
    const end = new Date(endDate).getTime();
    tasks = tasks.filter((t) => {
      if (!t.dueDate) return false;
      return new Date(t.dueDate).getTime() <= end;
    });
  }

  // Step 4: hydrate assignee names
  const enriched = tasks.map((t) => {
    let assigneeName = 'unassigned';
    if (t.assigneeId !== null) {
      const u = db.find('users', (r) => r.id === t.assigneeId) as
        | { name: string }
        | undefined;
      if (u) assigneeName = u.name;
    }
    return { ...t, assigneeName };
  });

  // Step 5: calculate completion rate
  const total = enriched.length;
  const done = enriched.filter((t) => t.status === 'done').length;
  const completionRate = total === 0 ? 0 : Math.round((done / total) * 100);

  // Step 6: bucket by groupBy field
  const buckets: Record<string, typeof enriched> = {};
  for (const t of enriched) {
    const key =
      groupBy === 'status'
        ? t.status
        : groupBy === 'assignee'
          ? t.assigneeName
          : 'all';
    if (!buckets[key]) buckets[key] = [];
    buckets[key].push(t);
  }

  // Step 7: format dates in user timezone
  // (timezone handling is naive — Session 2 fishbone target)
  const formatDate = (iso: string | null): string => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      // pretending to handle tz
      if (tz === 'UTC') return d.toISOString().slice(0, 10);
      return d.toLocaleDateString('en-US', { timeZone: tz });
    } catch {
      return iso;
    }
  };

  // Step 8: build CSV rows
  const rows: string[] = [];
  rows.push(`# Project Report: ${project.name}`);
  rows.push(`# Generated: ${new Date().toISOString()}`);
  rows.push(`# Completion rate: ${completionRate}%`);
  rows.push(`# Total tasks: ${total}`);
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
          formatDate(t.dueDate),
        ].join(','),
      );
    }
  }

  // Step 9: emit a notification (side effect that shouldn't live here)
  sendNotification({
    to: 'reports@orbittasks.local',
    subject: `Report generated for ${project.name}`,
    body: `${total} tasks, ${completionRate}% complete`,
  });

  // Step 10: respond
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${project.name.replace(/\s+/g, '_')}.csv"`,
  );
  res.send(rows.join('\n'));
});
