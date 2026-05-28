import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { createTask, listTasks, updateStatus } from '../services/tasks.service';
import { db } from '../db/client';

export const tasksRouter = Router();

tasksRouter.use(requireAuth);

tasksRouter.get('/', (req, res) => {
  const projectId = Number(req.query.projectId);
  res.json(listTasks(projectId));
});

tasksRouter.post('/', (req, res) => {
  const task = createTask({
    title: req.body.title,
    description: req.body.description ?? '',
    status: req.body.status ?? 'todo',
    assigneeId: req.body.assigneeId ?? null,
    projectId: req.body.projectId,
    dueDate: req.body.dueDate ?? null,
  });
  res.status(201).json(task);
});

tasksRouter.patch('/:id/status', (req, res) => {
  try {
    const task = updateStatus(Number(req.params.id), req.body.status);
    // updateStatus mutates the row in place; persist it (no-op in memory).
    db.save();
    res.json(task);
  } catch (e) {
    res.status(404).json({ error: (e as Error).message });
  }
});
