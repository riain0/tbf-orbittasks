import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { db } from '../db/client';

export const workspacesRouter = Router();

workspacesRouter.use(requireAuth);

workspacesRouter.get('/', (req, res) => {
  res.json(db.list('workspaces', (r) => r.ownerId === req.userId));
});

workspacesRouter.post('/', (req, res) => {
  const ws = db.insert('workspaces', {
    name: req.body.name,
    ownerId: req.userId,
  });
  res.status(201).json(ws);
});
