#!/usr/bin/env bash
set -e
echo "Installing pnpm 10 to match project lockfile..."
npm install -g pnpm@10.26.1
echo "Running install without frozen lockfile..."
pnpm install --no-frozen-lockfile
echo "Pre-install complete."
