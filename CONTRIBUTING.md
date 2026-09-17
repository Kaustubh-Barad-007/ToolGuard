# Contributing to ToolGuard

Thank you for your interest in contributing to ToolGuard! We welcome contributions from the community.

## Development Setup

ToolGuard is a monorepo managed with [pnpm](https://pnpm.io/) and TypeScript.

### Prerequisites

- **Node.js**: `>= 20.0.0`
- **pnpm**: `>= 9.0.0`

### Getting Started

1. **Fork and clone the repository**:
   ```bash
   git clone https://github.com/Kaustubh-Barad-007/ToolGuard.git
   cd ToolGuard
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Run typecheck**:
   ```bash
   pnpm typecheck
   ```

4. **Run tests**:
   ```bash
   pnpm test
   ```

5. **Build all packages**:
   ```bash
   pnpm build
   ```

## Monorepo Architecture

- `packages/shared`: Shared TypeScript types, schemas, and constant definitions.
- `packages/core`: Core cryptographic hashing, normalization, deep diffing, and risk evaluation rules.
- `packages/cli`: Standalone developer terminal CLI (`toolguard init`, `toolguard scan`, `toolguard status`).
- `apps/vscode-extension`: VS Code / Cursor / Windsurf extension with real-time status bar guard.
- `apps/web`: Web dashboard with side-by-side diff viewer and project management.

## Pull Request Guidelines

1. Ensure all tests pass: `pnpm test`.
2. Ensure TypeScript compiles without errors: `pnpm typecheck`.
3. Keep PRs focused on a single feature or bug fix.
4. Provide a clear PR description detailing your changes.
