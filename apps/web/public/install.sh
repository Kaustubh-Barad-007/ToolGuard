#!/usr/bin/env bash
# ToolGuard Automated Installer for macOS & Linux
# Usage: curl -fsSL https://toolguard-app.vercel.app/install.sh | bash

set -e

echo ""
echo -e "\033[36m  🛡️   ToolGuard Installer\033[0m"
echo -e "\033[90m  ──────────────────────────────────────────\033[0m"
echo -e "\033[37m  Zero-Trust Capability Security for AI Tools\033[0m"
echo ""

# 1. Check Node.js
if ! command -v node >/dev/null 2>&1; then
    echo -e "\033[31m❌ Error: Node.js 18+ is required but not found in PATH.\033[0m"
    echo -e "\033[33m   Please install Node.js from https://nodejs.org or via brew:\033[0m"
    echo "   brew install node"
    echo ""
    exit 1
fi

NODE_VER=$(node -v)
echo -e "\033[32m✓ Node.js detected: $NODE_VER\033[0m"

# 2. Install ToolGuard CLI globally
TGZ_URL="https://toolguard-app.vercel.app/toolguard.tgz"
echo -e "\033[36m📦 Installing ToolGuard CLI globally...\033[0m"

if npm install -g "$TGZ_URL" --silent 2>/dev/null; then
    echo -e "\033[32m✓ ToolGuard CLI successfully installed globally!\033[0m"
else
    echo -e "\033[33m⚠️ Retrying install with sudo permissions...\033[0m"
    sudo npm install -g "$TGZ_URL"
fi

# 3. Check for VS Code / Cursor and install extension
VSIX_URL="https://toolguard-app.vercel.app/toolguard-vscode-1.0.0.vsix"
TEMP_VSIX="/tmp/toolguard-vscode-1.0.0.vsix"

if command -v code >/dev/null 2>&1; then
    echo -e "\033[36m🧩 Installing ToolGuard extension for VS Code...\033[0m"
    curl -fsSL "$VSIX_URL" -o "$TEMP_VSIX"
    code --install-extension "$TEMP_VSIX" --force >/dev/null 2>&1 || true
    echo -e "\033[32m✓ VS Code extension installed!\033[0m"
fi

if command -v cursor >/dev/null 2>&1; then
    echo -e "\033[36m🧩 Installing ToolGuard extension for Cursor AI...\033[0m"
    [ -f "$TEMP_VSIX" ] || curl -fsSL "$VSIX_URL" -o "$TEMP_VSIX"
    cursor --install-extension "$TEMP_VSIX" --force >/dev/null 2>&1 || true
    echo -e "\033[32m✓ Cursor AI extension installed!\033[0m"
fi

rm -f "$TEMP_VSIX"

echo ""
echo -e "\033[32m🎉 Installation Complete!\033[0m"
echo -e "\033[90m──────────────────────────────────────────────────────\033[0m"
echo -e "\033[36m🚀 Get Started in any project directory:\033[0m"
echo ""
echo -e "   \033[1mtoolguard init -y\033[0m     Auto-discover tools & freeze baseline (<1s)"
echo -e "   \033[1mtoolguard scan\033[0m        Verify capabilities against baseline"
echo -e "   \033[1mtoolguard dashboard\033[0m   Open real-time web console"
echo -e "\033[90m──────────────────────────────────────────────────────\033[0m"
echo ""
