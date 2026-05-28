#!/usr/bin/env node
/**
 * Fellow back door — boot the full OrbitTasks app with zero friction.
 *
 *   node scripts/playground.mjs
 *
 * This deliberately sidesteps the broken onboarding that students fix in
 * Workshop 4 (the misleading README, the half-broken setup.sh, the missing
 * .env keys, the undocumented seed step). It sets sane env defaults, seeds a
 * fresh dataset, and runs the API + web dev servers together so you can click
 * around the product immediately.
 *
 * NOT referenced from the README on purpose: students should still discover
 * the real onboarding gaps themselves. This is for Fellows and for demos.
 *
 * Log in with:
 *   email:    demo@orbittasks.local
 *   password: Password123
 */

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Env defaults the app needs but .env.example doesn't spell out (Workshop 4).
// Paths are relative to apps/api, which is where the workspace scripts run.
const env = {
  ...process.env,
  JWT_SECRET: process.env.JWT_SECRET || 'local-playground-secret',
  DATABASE_URL: process.env.DATABASE_URL || 'file:.data/orbittasks.json',
  PORT: process.env.PORT || '3001',
};

function run(label, args, opts = {}) {
  return spawn('npm', args, { cwd: root, env, stdio: 'inherit', ...opts });
}

function runToCompletion(label, args) {
  return new Promise((resolve, reject) => {
    const child = run(label, args);
    child.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`${label} exited with ${code}`)),
    );
  });
}

const children = [];
function shutdown() {
  for (const c of children) c.kill('SIGINT');
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

console.log('[playground] seeding a fresh dataset…');
await runToCompletion('seed', ['run', 'seed', '--workspace=apps/api']);

console.log('[playground] starting API (:3001) and web dev server…');
console.log('[playground] log in with demo@orbittasks.local / Password123');
children.push(run('api', ['run', 'dev', '--workspace=apps/api']));
children.push(run('web', ['run', 'dev', '--workspace=apps/web']));
