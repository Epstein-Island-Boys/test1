#!/usr/bin/env bash
set -euo pipefail

# Render build: install workspace dependencies, build the WASM rewriter,
# then build Scramjet core/controller/utils and the production demo.

pnpm install --frozen-lockfile

pushd packages/core >/dev/null
pnpm rewriter:build
pnpm build
popd >/dev/null

pnpm --filter @mercuryworkshop/scramjet-controller build
pnpm --filter @mercuryworkshop/scramjet-utils build
pnpm --filter @mercuryworkshop/scramjet-demo build
