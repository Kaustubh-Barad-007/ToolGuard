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

# 2. Package standalone CLI and distribution tarballs
node ./scripts/bundle-cli.js

Write-Host "✓ All components built and packaged successfully." -ForegroundColor Green
