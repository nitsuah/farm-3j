#!/bin/sh
set -e
npm install -g pnpm
pnpm install
pnpm add detect-port@^1.3.0
node scripts/find-port.js
