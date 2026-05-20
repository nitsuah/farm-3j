#!/bin/sh
set -e
corepack enable
corepack pnpm install --frozen-lockfile
node scripts/find-port.js
