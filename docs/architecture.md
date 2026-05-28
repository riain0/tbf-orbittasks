# OrbitTasks Architecture

## Overview

OrbitTasks is a task management SaaS built on a Postgres + Node + React stack.

## Components

- **API**: Express + TypeScript, connected to Postgres via Prisma.
- **Web**: React frontend served from S3.
- **Workers**: Background job queue (BullMQ) for notifications.

## Local development

Run `docker-compose up` to start Postgres locally, then `npm run dev`.

## Deployment

Production runs on AWS ECS with Fargate. RDS for the database. CloudFront for the web app.

---

*TODO: update for the new SQLite-backed setup.*
*TODO: document the actual deploy process.*
*TODO: remove references to Prisma — we ripped it out.*
