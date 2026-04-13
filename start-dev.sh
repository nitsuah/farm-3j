#!/bin/sh
set -e
npm install -g pnpm
pnpm install
exec pnpm run dev
