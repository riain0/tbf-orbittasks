# OrbitTasks Architecture

OrbitTasks is a TypeScript monorepo with two apps:

- `apps/api/`: Node.js + Express backend, file-backed JSON store (JSON file via `DATABASE_URL`; in-memory only under tests).
- `apps/web/`: React + Vite frontend.

External services are mocked in tests via `scripts/mock-server.js`.

For deeper detail see the per-app READMEs.
