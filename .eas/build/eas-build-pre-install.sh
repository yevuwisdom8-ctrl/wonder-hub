#!/usr/bin/env bash
set -e
echo "Running pre-install: regenerating lockfile with current pnpm version..."
pnpm install --no-frozen-lockfile
echo "Lockfile updated successfully."
