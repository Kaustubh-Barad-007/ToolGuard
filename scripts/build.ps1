<#
.SYNOPSIS
  ToolGuard Monorepo Build Script
.DESCRIPTION
  Builds packages, standalone CLI binary bundle, VS Code extension, and web dashboard.
#>

$ErrorActionPreference = "Stop"
Write-Host "Building ToolGuard Monorepo..." -ForegroundColor Cyan

# 1. Monorepo Build
pnpm build

# 2. Package standalone CLI CJS bundle
Write-Host "Bundling CLI standalone executable..." -ForegroundColor Cyan
node ./apps/vscode-extension/node_modules/esbuild/bin/esbuild packages/cli/src/index.ts `
  --bundle `
  --platform=node `
  --target=node18 `
  --format=cjs `
  --banner:js="#!/usr/bin/env node" `
  --outfile=packages/cli/dist/cli.cjs

Write-Host "✓ All components built successfully." -ForegroundColor Green
