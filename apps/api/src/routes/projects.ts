import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { db } from '../db/client';

export const projectsRouter = Router();

projectsRouter.use(requireAuth);

projectsRouter.get('/', (_req, res) => {
  res.json(db.list('projects'));
});

projectsRouter.post('/', (req, res) => {
  const project = db.insert('projects', {
    name: req.body.name,
    workspaceId: req.body.workspaceId,
    archived: false,
  });
  res.status(201).json(project);
});
