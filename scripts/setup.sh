#!/usr/bin/env bash
# Initial setup helper. This script is INTENTIONALLY BROKEN for Session 4.
# Students will discover the issues, fix them, and rewrite this into a
# reliable onboarding flow.

set -euo pipefail

echo "[setup] starting OrbitTasks setup ..."

# typo: should be 'logs' — this will fail on systems where logss already exists
mkdir -p logss

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "[setup] copied .env.example -> .env (you may need to edit this!)"
fi

# Note: the seed step is missing. New developers will not know they need it.

echo "[setup] installing dependencies (this may take a while) ..."
npm install

echo "[setup] done!"
