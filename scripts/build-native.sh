#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

API_DIR="src/app/api"
BACKUP="/tmp/ahmed-api-backup-$$"

restore_api() {
  if [ -d "$BACKUP" ] && [ ! -d "$API_DIR" ]; then
    mv "$BACKUP" "$API_DIR"
  fi
}
trap restore_api EXIT

if [ -d "$API_DIR" ]; then
  rm -rf "$BACKUP"
  mv "$API_DIR" "$BACKUP"
fi

export NATIVE=1
npx next build
npx cap sync
restore_api
trap - EXIT
