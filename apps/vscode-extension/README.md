# ToolGuard for VS Code

**"You trusted the tool. Did the tool stay the same?"**

ToolGuard detects **trust drift** in developer and AI tool definitions, configurations, and MCP server setups.

## Features

- 🛡️ **Status Bar Indicator**: Real-time status indicator showing ToolGuard check when protected or ToolGuard alert when trust drift is detected.
- ⚡ **Scan on Save**: Automatically inspects tool configurations and MCP manifests whenever they are modified.
- 🔍 **Command Palette Integration**:
  - ToolGuard: Scan Project
  - ToolGuard: Create Trusted Baseline
  - ToolGuard: View Trust Drift
  - ToolGuard: Explain Drift
  - ToolGuard: Open Dashboard
- 🌐 **Connected to Web Dashboard**: Seamlessly opens diffs and detailed analysis in the ToolGuard Web Dashboard.

## Extension Settings

* toolguard.dashboardUrl: URL of the ToolGuard Web Dashboard (default: https://toolguard-app.vercel.app).
* toolguard.scanOnSave: Automatically run scan on save (default: true).

## License

MIT
