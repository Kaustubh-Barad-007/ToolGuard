# ToolGuard Automated Installer for Windows (PowerShell)
# Usage: irm https://toolguard-app.vercel.app/install.ps1 | iex

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "  🛡️   ToolGuard Installer" -ForegroundColor Cyan
Write-Host "  ──────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "  Zero-Trust Capability Security for AI Tools" -ForegroundColor Gray
Write-Host ""

# 1. Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: Node.js 18+ is required but not found in PATH." -ForegroundColor Red
    Write-Host "   Please install Node.js from https://nodejs.org or run:" -ForegroundColor Yellow
    Write-Host "   winget install OpenJS.NodeJS" -ForegroundColor White
    Write-Host ""
    exit 1
}

$nodeVer = (node -v).Trim()
Write-Host "✓ Node.js detected: $nodeVer" -ForegroundColor Green

# 2. Install ToolGuard CLI globally from verified production tarball
Write-Host "📦 Installing ToolGuard CLI globally..." -ForegroundColor Cyan
$tgzUrl = "https://toolguard-app.vercel.app/toolguard.tgz"

try {
    npm install -g $tgzUrl --silent
    Write-Host "✓ ToolGuard CLI successfully installed globally!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Retrying npm install with verbose output..." -ForegroundColor Yellow
    npm install -g $tgzUrl
}

# 3. Check for VS Code / Cursor / Windsurf and install extension
$vsixUrl = "https://toolguard-app.vercel.app/toolguard-vscode-1.0.0.vsix"
$tempVsix = Join-Path ([System.IO.Path]::GetTempPath()) "toolguard-vscode-1.0.0.vsix"

$ideFound = $false

if (Get-Command code -ErrorAction SilentlyContinue) {
    try {
        Write-Host "🧩 Installing ToolGuard extension for VS Code..." -ForegroundColor Cyan
        Invoke-WebRequest -Uri $vsixUrl -OutFile $tempVsix -UseBasicParsing
        code --install-extension $tempVsix --force | Out-Null
        Write-Host "✓ VS Code extension installed!" -ForegroundColor Green
        $ideFound = $true
    } catch {
        Write-Host "⚠️ Could not auto-install VS Code extension: $_" -ForegroundColor Yellow
    }
}

if (Get-Command cursor -ErrorAction SilentlyContinue) {
    try {
        Write-Host "🧩 Installing ToolGuard extension for Cursor AI..." -ForegroundColor Cyan
        if (-not (Test-Path $tempVsix)) {
            Invoke-WebRequest -Uri $vsixUrl -OutFile $tempVsix -UseBasicParsing
        }
        cursor --install-extension $tempVsix --force | Out-Null
        Write-Host "✓ Cursor AI extension installed!" -ForegroundColor Green
        $ideFound = $true
    } catch {}
}

if (Get-Command windsurf -ErrorAction SilentlyContinue) {
    try {
        Write-Host "🧩 Installing ToolGuard extension for Windsurf..." -ForegroundColor Cyan
        if (-not (Test-Path $tempVsix)) {
            Invoke-WebRequest -Uri $vsixUrl -OutFile $tempVsix -UseBasicParsing
        }
        windsurf --install-extension $tempVsix --force | Out-Null
        Write-Host "✓ Windsurf extension installed!" -ForegroundColor Green
        $ideFound = $true
    } catch {}
}

if (Test-Path $tempVsix) {
    Remove-Item $tempVsix -Force -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "🎉 Installation Complete!" -ForegroundColor Green
Write-Host "──────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "🚀 Get Started in any project directory:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   toolguard init -y     " -ForegroundColor White -NoNewline
Write-Host "Auto-discover tools & freeze baseline (<1s)" -ForegroundColor Gray
Write-Host "   toolguard scan        " -ForegroundColor White -NoNewline
Write-Host "Verify capabilities against baseline" -ForegroundColor Gray
Write-Host "   toolguard dashboard   " -ForegroundColor White -NoNewline
Write-Host "Open real-time web console" -ForegroundColor Gray
Write-Host "──────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""
