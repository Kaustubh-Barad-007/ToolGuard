# ToolGuard Architecture

ToolGuard is engineered as a modular, production-ready developer security system designed to detect **Trust Drift** in AI and developer tool configurations. It operates with a **100% local-first, zero-telemetry architecture** — ensuring credentials, tool schemas, and source code never leave the developer's workstation.

```mermaid
flowchart TD
    subgraph IDE [Developer Environment]
        VSCode[VS Code Extension]
        CLI[ToolGuard CLI]
        Tools[Tool Manifests & MCP Servers]
    end

    subgraph Core [ToolGuard Core Security Engine]
        Disc[Discovery Adapters]
        Norm[Deterministic Normalizer]
        FP[SHA-256 Hasher]
        Diff[Deep Differ]
        Risk[Rule-Based Risk Engine]
        Redact[Secret Redaction]
    end

    subgraph Storage [Local Workspace Storage]
        BaselineFile[".toolguard/baseline.json<br/>(Cryptographic Baseline)"]
    end

    subgraph Web [Developer Dashboard]
        ReactApp[React 18 + Vite + MUI]
        DiffUI[Side-by-Side Diff Viewer]
        TimelineUI[Audit Timeline]
    end

    Tools --> Disc
    Disc --> Norm
    Norm --> Redact
    Redact --> FP
    FP --> Diff
    Diff --> Risk
    Risk --> VSCode
    Risk --> CLI
    FP --> BaselineFile
    BaselineFile -.-> ReactApp
```

## Core Modules

1. **`@toolguard/shared`**: Defines centralized Zod schemas, TypeScript types, risk rule enumerations, and error codes.
2. **`@toolguard/core`**: Independent, pure security engine containing:
   - Pluggable discovery adapters (`GenericJsonAdapter`, `McpToolAdapter`, `PackageJsonAdapter`, `VsCodeTasksAdapter`, `WorkflowAdapter`, `MakefileAdapter`, `PythonToolAdapter`).
   - Normalization with deterministic sorting for unordered permission sets.
   - SHA-256 canonical hashing.
   - Property-level AST differ.
   - Explainable, transparent rule-based risk evaluation.
   - Heuristic credential redaction (`[REDACTED]`).
   - Baseline lifecycle manager.
3. **`@toolguard/cli`**: Node.js/TypeScript command line executable (`init`, `scan`, `status`, `baseline`, `explain`, `remove`, `disconnect`, `dashboard`).
4. **`@toolguard/web`**: Material UI developer dashboard with side-by-side diff viewer, capability manifest, and baseline inspection.
5. **`apps/vscode-extension`**: Native VS Code status bar item, command palette actions, file watcher, and non-intrusive drift alerts.
