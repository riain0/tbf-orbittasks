import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';

// Unmount anything rendered during a test. Vitest runs every file in a
// single fork here (see vite.config.ts), so without an explicit cleanup the
// rendered DOM accumulates across tests and `getBy*` queries start finding
// duplicate elements. Auto-cleanup is unreliable under this pool config, so
// we register it ourselves.
afterEach(() => {
  cleanup();
});

// Reset localStorage between every test so auth state doesn't leak.
beforeEach(() => {
  try {
    localStorage.clear();
  } catch {
    // ignore — happens in some jsdom configurations
  }
});

// Provide a fetch mock by default. Individual tests can override.
const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});
