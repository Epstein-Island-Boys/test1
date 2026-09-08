#!/usr/bin/env bash
set -euo pipefail

# Render build:
# 1. Install workspace dependencies.
# 2. Build the WASM rewriter.
# 3. Build Scramjet core.
# 4. Build controller, utils, and demo.

pnpm install --frozen-lockfile

pushd packages/core >/dev/null
pnpm rewriter:build
pnpm build
popd >/dev/null

pnpm --filter @mercuryworkshop/scramjet-controller build
pnpm --filter @mercuryworkshop/scramjet-utils build
pnpm --filter @mercuryworkshop/scramjet-demo build
