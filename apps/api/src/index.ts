import express from 'express';
import { authRouter } from './routes/auth';
import { tasksRouter } from './routes/tasks';
import { projectsRouter } from './routes/projects';
import { workspacesRouter } from './routes/workspaces';
import { reportsRouter } from './routes/reports';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/workspaces', workspacesRouter);
app.use('/api/reports', reportsRouter);

const port = Number(process.env.PORT ?? 3001);

async function start(): Promise<void> {
  // On Render the filesystem is ephemeral, so an empty database would greet
  // every visitor. SEED_ON_BOOT (set only in the deployed environment) seeds
  // a fresh dataset on startup. Locally this stays off, so `npm run seed`
  // remains a required — and deliberately undocumented — onboarding step.
  if (process.env.SEED_ON_BOOT) {
    const { db } = await import('./db/client');
    if (db.list('users').length === 0) {
      const { seedDatabase } = await import('./db/seed');
      await seedDatabase();
    }
  }

  app.listen(port, () => {
    console.log(`OrbitTasks API listening on :${port}`);
  });
}

if (require.main === module) {
  void start();
}

export { app };
