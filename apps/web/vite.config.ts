/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// NOTE for fellows: the vitest config below is DELIBERATELY suboptimal.
//
// What's slow on purpose:
//   1. pool: 'forks' + singleFork: true forces every test file into a
//      single child process — no parallelism.
//   2. isolate: true means each test file gets a brand-new jsdom
//      environment (~50-100ms of setup overhead per file).
//   3. coverage.enabled: true means istanbul instrumentation runs on
//      every PR, not just nightly.
//
// Workshop 3 students improve each of these in the optimization recipe.
export default defineConfig({
  plugins: [react()],
  // Dev-only: proxy API calls to the local backend so the web client's
  // relative `/api` requests reach Express. In production the same `/api`
  // path is handled by a rewrite rule on the static-site host (Render).
  server: {
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],

    // W3 step 4: allow multiple forks (was singleFork: true). Flip BOTH
    // knobs — leaving isolate:true still re-creates jsdom per file.
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: false,
      },
    },

    // W3 step 4: keep per-file isolation (isolate:true). The parallelism win
    // comes from singleFork:false; flipping isolate:false too over-shares the
    // jsdom document across files in a fork and breaks queries here.
    isolate: true,

    // W3 step 3: coverage off the PR path; run it nightly instead.
    coverage: {
      enabled: false,
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
    },

    // SLOW: no cache dir configured.
  },
} as Parameters<typeof defineConfig>[0]);
