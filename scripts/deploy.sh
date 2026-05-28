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

echo "[deploy] starting simulated deploy to $DEST"
for dir in "${SRC_DIRS[@]}"; do
  if [[ ! -d "$dir" ]]; then
    echo "[deploy] skipping $dir (not built)"
    continue
  fi
  echo "[deploy] uploading $dir ..."
  # walk file by file with a tiny sleep — simulates per-file upload overhead
  while IFS= read -r f; do
    rel="${f#$dir/}"
    mkdir -p "$DEST$(dirname "$rel")"
    cp "$f" "$DEST$rel"
    sleep 0.3
  done < <(find "$dir" -type f)
done

echo "[deploy] running smoke checks ..."
sleep 5
echo "[deploy] done"
