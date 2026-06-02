#!/usr/bin/env bash
# Sobe backend (Go + SQLite) e frontend (Vite) em paralelo.
# Ctrl+C derruba ambos.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

pids=()

cleanup() {
  echo
  echo "→ Encerrando processos..."
  for pid in "${pids[@]}"; do
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
    fi
  done
  wait 2>/dev/null || true
  exit 0
}
trap cleanup INT TERM

echo "→ backend:  http://localhost:8080"
echo "→ frontend: http://localhost:5173"
echo

( cd "$ROOT/backend"  && go run ./cmd/server 2>&1 | sed 's/^/[backend]  /' ) &
pids+=($!)

( cd "$ROOT/frontend" && npm run dev          2>&1 | sed 's/^/[frontend] /' ) &
pids+=($!)

wait
