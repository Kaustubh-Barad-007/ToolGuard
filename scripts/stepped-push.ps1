param(
  [int]$DelaySeconds = 600,
  [switch]$OnlyNext
)

$logFile = Join-Path $PSScriptRoot "..\deploy-progress.log"

function Write-Log {
  param([string]$Message)
  $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  $entry = "[$timestamp] $Message"
  Write-Host $entry -ForegroundColor Cyan
  Add-Content -Path $logFile -Value $entry
}

Write-Log "Starting ToolGuard Step-by-Step GitHub Deployment runner (Delay: $DelaySeconds sec)..."

$steps = @(
  @{
    Step = 2
    Message = "chore: setup monorepo workspace and root TypeScript configuration"
    Files = @(".env.example", "package.json", "pnpm-workspace.yaml", "pnpm-lock.yaml", "tsconfig.json")
  },
  @{
    Step = 3
    Message = "feat(core): implement trust drift security engine and SHA-256 fingerprinting"
    Files = @("packages/shared", "packages/core/package.json", "packages/core/tsconfig.json", "packages/core/src/types", "packages/core/src/fingerprint", "packages/core/src/engine", "packages/core/src/storage")
  },
  @{
    Step = 4
    Message = "feat(adapters): add multi-ecosystem tool discovery (npm, VS Code, Makefile, MCP, PyProject)"
    Files = @("packages/core/src/adapters", "packages/core/src/index.ts", ".toolguard")
  },
  @{
    Step = 5
    Message = "feat(vscode): implement ToolGuard VS Code extension with real-time trust drift guard"
    Files = @("apps/vscode-extension")
  },
  @{
    Step = 6
    Message = "feat(cli): build standalone terminal CLI security tool (toolguard init, scan, status)"
    Files = @("packages/cli")
  },
  @{
    Step = 7
    Message = "feat(web): modern DevSecOps dashboard with side-by-side diff viewer and 1-click demo"
    Files = @("apps/web", "firebase", "functions")
  },
  @{
    Step = 8
    Message = "test: add end-to-end Vitest test suite, CI/CD GitHub Actions security gate, and docs"
    Files = @("tests", ".github", "docs", "demo", "scripts", "README.md", "apps/web", "apps/vscode-extension")
  }
)

foreach ($s in $steps) {
  $stepNum = $s.Step
  $msg = $s.Message
  $files = $s.Files

  $status = git status --porcelain $files
  if (-not $status) {
    Write-Log "Step $stepNum already committed or no changes. Skipping."
    continue
  }

  Write-Log "=== Executing Step $stepNum / 8: $msg ==="
  foreach ($f in $files) {
    if (Test-Path $f) {
      git add $f
    }
  }

  git commit -m $msg
  git push origin main

  Write-Log ">>> Successfully pushed Step $stepNum to GitHub! <<<"

  if ($OnlyNext) {
    Write-Log "OnlyNext flag set. Stopping here."
    break
  }

  if ($stepNum -lt 8) {
    Write-Log "Sleeping for $DelaySeconds seconds (~$([math]::Round($DelaySeconds/60, 1)) mins) before next step..."
    Start-Sleep -Seconds $DelaySeconds
  }
}

Write-Log "ToolGuard Step-by-Step GitHub Deployment completed successfully!"
