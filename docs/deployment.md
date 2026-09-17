# ToolGuard Deployment & Distribution Guide

ToolGuard is a 100% local-first security platform. The Web Dashboard is deployed as a static Single Page Application (SPA) on Vercel, serving both the web UI and binary distribution assets.

---

## 1. Web Dashboard & Binary Distribution (Vercel)

The Web Dashboard in `apps/web` is deployed directly to Vercel:

- **Production URL**: [https://toolguard-app.vercel.app](https://toolguard-app.vercel.app)
- **Framework Preset**: `Vite`
- **Output Directory**: `dist`
- **Build & Bundle Command**:
  ```bash
  pnpm run build:all
  ```

### Serving Standalone Binaries
The web app automatically hosts:
1. **Universal CLI Package**: `https://toolguard-app.vercel.app/toolguard.tgz`
2. **VS Code Extension**: `https://toolguard-app.vercel.app/toolguard-vscode-1.0.0.vsix`

Deploying to Vercel production:
```bash
npx vercel deploy apps/web/dist --prod --yes
npx vercel alias set <deployment-url> toolguard-app.vercel.app
```

---

## 2. Standalone CLI Bundling

ToolGuard bundles the CLI into a self-contained CommonJS executable without external runtime dependency friction:

```bash
# Bundles packages/cli and produces toolguard.tgz
pnpm run bundle:cli
```

Installed anywhere in 1 line:
```bash
npm install -g https://toolguard-app.vercel.app/toolguard.tgz
```

---

## 3. VS Code Extension Packaging

Package the extension with `@vscode/vsce`:

```bash
cd apps/vscode-extension
npx @vscode/vsce package
```

Install the resulting `.vsix` file:
```bash
code --install-extension toolguard-vscode-1.0.0.vsix
```

