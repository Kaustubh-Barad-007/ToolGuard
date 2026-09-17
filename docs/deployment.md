# ToolGuard Deployment Guide

## 1. Web Dashboard (Vercel)

The Web Dashboard in `apps/web` can be deployed directly to Vercel:

1. Connect your repository to Vercel.
2. Set Root Directory to `apps/web`.
3. Set Framework Preset to `Vite`.
4. Configure environment variables:
   ```env
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```
5. Build Command: `pnpm run build`
6. Output Directory: `dist`

## 2. Firebase Backend

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```
2. Login and select your project:
   ```bash
   firebase login
   firebase use toolguard-prod
   ```
3. Deploy Firestore Security Rules & Indexes:
   ```bash
   firebase deploy --only firestore
   ```
4. Deploy Cloud Functions:
   ```bash
   firebase deploy --only functions
   ```

## 3. VS Code Extension

1. Package the extension:
   ```bash
   cd apps/vscode-extension
   npx @vscode/vsce package
   ```
2. Install the resulting `.vsix` file in VS Code:
   ```bash
   code --install-extension toolguard-vscode-1.0.0.vsix
   ```
