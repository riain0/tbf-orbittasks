#!/usr/bin/env bash
# Baseline timing helper.
#
# Runs each pipeline stage in sequence on a clean state and emits a timing
# log. Students use the output to fill in their measurement template in
# Workshop 1, then compare against the optimized run later.
#
# IMPORTANT: this script intentionally does NOT do anything clever. It runs
# the same npm scripts the team would run, in the same order. Optimizing
# the *pipeline* is the lesson — not optimizing this measurement script.

set -uo pipefail

LOG="${PWD}/baseline.log"
: > "$LOG"

log() {
  printf '[%s] %s\n' "$(date +%H:%M:%S)" "$1" | tee -a "$LOG"
}

stage() {
  local name="$1"; shift
  local start end dur
  start=$(date +%s)
  log "--- START $name ---"
  if "$@"; then
    end=$(date +%s)
    dur=$((end - start))
    log "--- END   $name (${dur}s) PASS ---"
    return 0
  else
    local exit_code=$?
    end=$(date +%s)
    dur=$((end - start))
    log "--- END   $name (${dur}s) FAIL (exit=${exit_code}) ---"
    return 0  # don't abort the whole pipeline; we want to see all stages
  fi
}

OVERALL_START=$(date +%s)
log "OrbitTasks baseline run starting"
log "node $(node --version 2>&1), npm $(npm --version 2>&1)"

# Stage 1: clean install (no cache)
stage "install"      bash -lc "rm -rf node_modules && npm install --no-audit --no-fund"

# Stage 2: lint everything
stage "lint"         bash -lc "npm run lint"

# Stage 3: typecheck everything (no incremental)
stage "typecheck"    bash -lc "npm run typecheck"

# Stage 4: unit tests (api) — slow because maxWorkers=1, coverage on
stage "test:api"     bash -lc "npm run test --workspace=apps/api"

# Stage 5: unit tests (web)
stage "test:web"     bash -lc "npm run test --workspace=apps/web"

# Stage 6: build api
stage "build:api"    bash -lc "npm run build --workspace=apps/api"

# Stage 7: build web
stage "build:web"    bash -lc "npm run build --workspace=apps/web"

# Stage 8: simulated deploy
stage "deploy"       bash -lc "npm run deploy"

OVERALL_END=$(date +%s)
TOTAL=$((OVERALL_END - OVERALL_START))
log "OrbitTasks baseline run finished — total ${TOTAL}s ($(( TOTAL / 60 ))m $(( TOTAL % 60 ))s)"
log "Full log written to $LOG"

echo
echo "===================================================="
echo " Baseline complete. Total elapsed: ${TOTAL}s"
echo "   (~$(( TOTAL / 60 )) minutes $(( TOTAL % 60 )) seconds)"
echo " Copy timings from $LOG into your measurement"
echo " template (workshops/01-baseline/handout.md)."
echo "===================================================="
