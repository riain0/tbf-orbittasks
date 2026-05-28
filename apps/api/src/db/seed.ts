// Seed data for the OrbitTasks playground.
//
// Two ways this runs:
//   * `npm run seed` (local) — wipes and repopulates the file-backed store
//     so the app has something to show. This step is deliberately NOT
//     documented in the README/.env.example: discovering that a fresh
//     clone needs seeding is part of the Workshop 4 onboarding exercise.
//   * Automatically on server boot when SEED_ON_BOOT is set (we set it only
//     on Render, where the filesystem is ephemeral and an empty database
//     would otherwise greet every visitor). See src/index.ts.
//
// It lives under src/ (not scripts/) on purpose: it has to compile into
// dist/ so the deployed backend can import and run it.

import bcrypt from 'bcryptjs';
import { db } from './client';

const SALT_ROUNDS = 10;

// The demo login the Fellow hands out. Meets the app's password policy
// (8+ chars, an uppercase letter, a digit).
export const DEMO_LOGIN = {
  email: 'demo@orbittasks.local',
  password: 'Password123',
};

const DAY = 24 * 60 * 60 * 1000;

interface SeedOptions {
  /** Wipe existing data first. Defaults to true. */
  reset?: boolean;
}

export async function seedDatabase(opts: SeedOptions = {}): Promise<void> {
  const reset = opts.reset ?? true;
  if (reset) db.reset();

  const now = Date.now();
  const iso = (offsetDays: number) => new Date(now + offsetDays * DAY).toISOString();

  // ---- Users ---------------------------------------------------------------
  const password = await bcrypt.hash(DEMO_LOGIN.password, SALT_ROUNDS);
  const demo = db.insert('users', {
    email: DEMO_LOGIN.email,
    name: 'Demo User',
    passwordHash: password,
    role: 'admin',
  });
  const alex = db.insert('users', {
    email: 'alex@orbittasks.local',
    name: 'Alex Rivera',
    passwordHash: password,
    role: 'member',
  });
  const sam = db.insert('users', {
    email: 'sam@orbittasks.local',
    name: 'Sam Okafor',
    passwordHash: password,
    role: 'member',
  });
  const assignees = [Number(demo.id), Number(alex.id), Number(sam.id)];

  // ---- Workspace + projects ------------------------------------------------
  const workspace = db.insert('workspaces', {
    name: 'OrbitTasks HQ',
    ownerId: demo.id,
    memberIds: assignees,
  });

  const projectDefs = ['Website Relaunch', 'Mobile App', 'Q3 Marketing'];
  const projects = projectDefs.map((name) =>
    db.insert('projects', { name, workspaceId: workspace.id, archived: false }),
  );

  // ---- Tags ----------------------------------------------------------------
  const tagDefs: Array<{ name: string; color: string }> = [
    { name: 'bug', color: '#EF4444' },
    { name: 'feature', color: '#3B82F6' },
    { name: 'urgent', color: '#F59E0B' },
    { name: 'design', color: '#8B5CF6' },
  ];
  const tags = projects.flatMap((p) =>
    tagDefs.map((t) => db.insert('tags', { ...t, projectId: p.id })),
  );

  // ---- Tasks ---------------------------------------------------------------
  const statuses = ['todo', 'doing', 'done'] as const;
  const taskSeed: Record<string, Array<[string, string]>> = {
    'Website Relaunch': [
      ['Audit current marketing site', 'List every page and its owner.'],
      ['Design new landing hero', 'Two directions for the fold, dark and light.'],
      ['Migrate blog to MDX', 'Keep existing URLs; add redirects for the rest.'],
      ['Set up analytics events', 'Track signup funnel end to end.'],
      ['Accessibility pass', 'Keyboard nav and contrast on every page.'],
      ['Launch checklist', 'DNS, SSL, sitemap, social cards.'],
    ],
    'Mobile App': [
      ['Spike: offline sync', 'Evaluate a local queue vs. last-write-wins.'],
      ['Push notification opt-in', 'Soft prompt after the first completed task.'],
      ['Fix crash on cold start', 'Only on Android 13, intermittently.'],
      ['Dark mode', 'Respect the system setting.'],
      ['App Store screenshots', 'Five per device size.'],
    ],
    'Q3 Marketing': [
      ['Plan webinar series', 'Three sessions, one per persona.'],
      ['Refresh pricing page copy', 'Lead with outcomes, not features.'],
      ['Customer case study: Northwind', 'Interview booked for next week.'],
      ['SEO: top 10 keywords', 'Brief writers on intent for each.'],
    ],
  };

  let i = 0;
  for (const project of projects) {
    const rows = taskSeed[String(project.name)] ?? [];
    rows.forEach(([title, description], idx) => {
      const task = db.insert('tasks', {
        title,
        description,
        status: statuses[idx % statuses.length],
        assigneeId: assignees[idx % assignees.length],
        projectId: project.id,
        // Spread due dates from a week ago to three weeks out.
        dueDate: iso(idx * 4 - 6),
      });
      // A couple of comments on the first task of each project.
      if (idx === 0) {
        db.insert('comments', {
          taskId: task.id,
          authorId: alex.id,
          authorName: 'Alex Rivera',
          body: 'Starting on this today.',
          createdAt: iso(-1),
        });
        db.insert('comments', {
          taskId: task.id,
          authorId: sam.id,
          authorName: 'Sam Okafor',
          body: 'Pinged design for assets.',
          createdAt: iso(0),
        });
      }
      i++;
    });
  }

  console.log(
    `[seed] ${assignees.length} users, ${projects.length} projects, ` +
      `${tags.length} tags, ${i} tasks` +
      (db.persistent ? ' (written to disk)' : ' (in-memory)'),
  );
}

// CLI entry: `node --import tsx src/db/seed.ts`
if (require.main === module) {
  seedDatabase().catch((err) => {
    console.error('[seed] failed:', err);
    process.exit(1);
  });
}
