#!/usr/bin/env bash
# Simulated deploy script. In production this would push to a CDN /
# container registry. Here we rsync the build output one file at a
# time with deliberate pauses to model network upload latency.
#
# This script is intentionally slow — Session 3 students will optimize it.

set -euo pipefail

SRC_DIRS=("apps/api/dist" "apps/web/dist")
DEST="dist/"

mkdir -p "$DEST"

echo "[deploy] starting deploy to $DEST"
# W3 step 8: rsync both build dirs in one pass instead of copying file by
# file with a per-file sleep. One bulk transfer, not N round-trips.
rsync -a "${SRC_DIRS[@]}" "$DEST"

echo "[deploy] running smoke checks ..."
sleep 0.5
echo "[deploy] done"
