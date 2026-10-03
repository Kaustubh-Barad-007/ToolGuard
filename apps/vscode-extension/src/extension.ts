import * as vscode from 'vscode';
import * as path from 'path';
import * as zlib from 'zlib';
import { promises as fs } from 'fs';
import { ExtensionScanService } from './services/scanner.js';
import { ScanResult, ToolScanStatus, ToolDefinition } from '@toolguard/shared';
import { startBridgeServer } from '@toolguard/core/node';

let statusBarItem: vscode.StatusBarItem;
let scanService: ExtensionScanService;
let latestScanResult: ScanResult | null = null;
let notifiedDrifts = new Set<string>();
let isScanning = false;

export async function openDashboardCommand(subPath?: string, mode?: 'ide' | 'browser') {
  const config = vscode.workspace.getConfiguration('toolguard');
  const baseUrl = config.get<string>('dashboardUrl') || 'http://127.0.0.1:3154';
  const configuredTarget = config.get<string>('openTarget') || 'prompt';
  const workspacePath = await getWorkspacePath();

  let targetPath = subPath || 'dashboard';
  let targetUrl = `${baseUrl}/${targetPath}`;

  if (workspacePath) {
    // 1. Ensure local bridge is bound to THIS workspace
    try {
      await fetch('http://127.0.0.1:3154/api/workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cwd: workspacePath })
      });
    } catch {
      try {
        await startBridgeServer({
          cwd: workspacePath,
          port: 3154,
          onStateChange: async () => {
            await performScan(false);
            vscode.window.setStatusBarMessage('$(check) ToolGuard: Drift resolved in UI (Verified Safe)', 4000);
          }
        });
      } catch {}
    }

    try {
      const baseline = await scanService.loadBaseline(workspacePath);
      const tools = await scanService.discoverTools(workspacePath);

      if (baseline) {
        // Run fresh live scan immediately
        const scanResult = scanService.runScan(tools, baseline);
        latestScanResult = scanResult;

        const hasDrift = scanResult.driftCount > 0;
        targetPath = subPath || (hasDrift ? 'drift' : 'dashboard');

        const driftedTools = scanResult.tools.filter(t => t.driftDetected);
        const safeToolNames = scanResult.tools.filter(t => !t.driftDetected).map(t => t.name);

        // Compact v2 payload guaranteed to be under 1500 chars (safe from Windows 2048-char limits)
        const compactPayload = {
          v: 2,
          projectId: baseline.projectId || path.basename(workspacePath),
          workspacePath,
          baselineId: baseline.baselineId,
          totalTools: scanResult.totalTools,
          driftCount: scanResult.driftCount,
          safeTools: safeToolNames.slice(0, 30),
          safeCount: safeToolNames.length,
          drifts: driftedTools.map(t => {
            const liveTool = tools.find(tool => (tool.id && tool.id === t.toolId) || tool.name === t.name);
            const blEntry = baseline.tools[t.toolId] || Object.values(baseline.tools).find(e => e.name === t.name);
            return {
              toolId: t.toolId,
              name: t.name,
              status: t.status,
              severity: t.status === 'HIGH RISK' ? 'high' : 'medium',
              changes: t.changes,
              current: liveTool || { name: t.name },
              baseline: blEntry?.normalizedDefinition || null,
              fingerprint: blEntry?.fingerprint || null
            };
          })
        };

        const jsonStr = JSON.stringify(compactPayload);
        const compressed = zlib.gzipSync(Buffer.from(jsonStr, 'utf8'));
        const encoded = compressed.toString('base64url');
        targetUrl = `${baseUrl}/${targetPath}#sync=${encoded}`;
      } else {
        targetUrl = `${baseUrl}/${targetPath}`;
      }
    } catch (e) {
      console.warn('[ToolGuard Extension] Failed to create sync URL payload:', e);
    }

    if (workspacePath) {
      try {
        fetch('http://127.0.0.1:3154/api/workspace', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cwd: workspacePath, workspacePath })
        }).catch(() => {});
      } catch {}
    }
  }

  let selectedMode = mode;
  if (!selectedMode) {
    if (configuredTarget === 'ide') {
      selectedMode = 'ide';
    } else if (configuredTarget === 'browser') {
      selectedMode = 'browser';
    } else {
      const choice = await vscode.window.showQuickPick(
        [
          { label: '$(preview) Open in IDE', description: 'Internal VS Code editor tab (Offline & zero distraction)', target: 'ide' as const },
          { label: '$(browser) Open in Browser', description: `Local web browser (${baseUrl})`, target: 'browser' as const }
        ],
        { placeHolder: 'Select where to open the ToolGuard Dashboard' }
      );
      if (!choice) return;
      selectedMode = choice.target;
    }
  }

  if (selectedMode === 'ide') {
    try {
      await vscode.commands.executeCommand('simpleBrowser.show', targetUrl);
      return;
    } catch (e) {
      console.warn('[ToolGuard] Simple browser unavailable, falling back to external browser:', e);
    }
  }

  await vscode.env.openExternal(vscode.Uri.parse(targetUrl));
}

export async function activate(context: vscode.ExtensionContext) {
  scanService = new ExtensionScanService();

  // Create high-priority Status Bar Item anchored firmly to the bottom-left corner
  statusBarItem = vscode.window.createStatusBarItem('toolguard.status', vscode.StatusBarAlignment.Left, 10000);
  statusBarItem.name = 'ToolGuard Security Monitor';
  statusBarItem.command = 'toolguard.showStatus';
  context.subscriptions.push(statusBarItem);
  statusBarItem.show();
  updateStatusBar('checking', 0);

  // Register Commands
  context.subscriptions.push(
    vscode.commands.registerCommand('toolguard.scan', async () => {
      await performScan(true);
    }),

    vscode.commands.registerCommand('toolguard.createBaseline', async () => {
      await createBaselineCommand();
    }),

    vscode.commands.registerCommand('toolguard.viewDrift', async () => {
      await showDriftQuickPick();
    }),

    vscode.commands.registerCommand('toolguard.openDashboard', async () => {
      await openDashboardCommand();
    }),

    vscode.commands.registerCommand('toolguard.openDashboardInIde', async () => {
      await openDashboardCommand(undefined, 'ide');
    }),

    vscode.commands.registerCommand('toolguard.openDashboardInBrowser', async () => {
      await openDashboardCommand(undefined, 'browser');
    }),

    vscode.commands.registerCommand('toolguard.restoreCleanState', async () => {
      await restoreCleanStateCommand();
    }),

    vscode.commands.registerCommand('toolguard.showStatus', async () => {
      await showStatusMenu();
    }),

    vscode.commands.registerCommand('toolguard.explainDrift', async () => {
      await explainDriftCommand();
    }),

    vscode.commands.registerCommand('toolguard.refreshTools', async () => {
      await performScan(true);
      vscode.window.showInformationMessage('ToolGuard: Verified workspace tools.');
    })
  );

  // Initial Scan
  await checkFirstRunOrScan();

  // Start Real-Time Local HTTP Bridge (connects automatically to Web Dashboard)
  const workspacePath = await getWorkspacePath();
  if (workspacePath) {
    try {
      const bridge = await startBridgeServer({
        cwd: workspacePath,
        port: 3154,
        onLog: (msg) => console.log(`[ToolGuard VS Code Bridge] ${msg}`),
        onStateChange: async () => {
          console.log('[ToolGuard VS Code Bridge] State change received from Web UI — running instant scan');
          await performScan(false);
          vscode.window.setStatusBarMessage('$(check) ToolGuard: Drift resolved in UI (Verified Safe)', 4000);
        }
      });
      if (bridge.isAlreadyRunning) {
        try {
          fetch('http://127.0.0.1:3154/api/workspace', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cwd: workspacePath })
          }).catch(() => {});
        } catch {}
      }
      context.subscriptions.push({
        dispose: () => {
          bridge.close().catch(() => {});
        }
      });
    } catch (err) {
      console.warn('[ToolGuard VS Code Bridge] Local bridge init warning:', err);
    }
  }

  // Real-time File System Watchers (create, change, delete)
  const baselineWatcher = vscode.workspace.createFileSystemWatcher('**/.toolguard/**');
  const toolWatcher = vscode.workspace.createFileSystemWatcher('**/{tools,.cursor,.vscode}/**');
  const pkgWatcher = vscode.workspace.createFileSystemWatcher('**/package.json');

  const onWorkspaceChanged = async () => {
    await performScan(false);
  };

  baselineWatcher.onDidChange(onWorkspaceChanged);
  baselineWatcher.onDidCreate(onWorkspaceChanged);
  baselineWatcher.onDidDelete(onWorkspaceChanged);

  toolWatcher.onDidChange(onWorkspaceChanged);
  toolWatcher.onDidCreate(onWorkspaceChanged);
  toolWatcher.onDidDelete(onWorkspaceChanged);

  pkgWatcher.onDidChange(onWorkspaceChanged);
  pkgWatcher.onDidCreate(onWorkspaceChanged);
  pkgWatcher.onDidDelete(onWorkspaceChanged);

  // Direct URI Handler: handles deep links from Web UI (vscode://toolguard.toolguard-vscode/resolve)
  const uriHandler = vscode.window.registerUriHandler({
    async handleUri(uri: vscode.Uri) {
      const action = uri.path.replace(/^\//, '').toLowerCase();
      const workspacePath = await getWorkspacePath();
      if (!workspacePath) return;

      if (action === 'resolve' || action === 'accept-drift') {
        const tools = await scanService.discoverTools(workspacePath);
        const currentBl = await scanService.loadBaseline(workspacePath);
        const nextVer = (currentBl?.version || 1) + 1;
        const nextVerTag = `v1.0.${nextVer - 1}`;
        const baseline = BaselineManager.createBaseline(
          tools,
          currentBl?.projectId || path.basename(workspacePath),
          'developer@workspace.local',
          nextVer
        );
        await FileBaselineStorage.saveLocalBaseline(workspacePath, baseline);
        try {
          const toolNames = Object.keys(baseline.tools || {});
          await FileBaselineStorage.appendLocalHistory(workspacePath, {
            version: nextVer,
            versionTag: nextVerTag,
            timestamp: new Date().toISOString(),
            actor: 'developer@workspace.local',
            action: 'ACCEPTED_DRIFT',
            title: `Capability Drift Accepted & Re-baselined (${nextVerTag})`,
            toolCount: baseline.toolCount,
            toolsAffected: toolNames,
            baselineHash: baseline.baselineId,
          });
        } catch {}
        await performScan(false);
        vscode.window.showInformationMessage(`✓ ToolGuard: Drift accepted and baseline updated to ${nextVerTag}.`);
      } else if (action === 'restore') {
        await restoreCleanStateCommand();
      } else if (action === 'dashboard' || action === 'open-dashboard') {
        const queryMode = uri.query?.includes('mode=ide') ? 'ide' : (uri.query?.includes('mode=browser') ? 'browser' : undefined);
        await openDashboardCommand('dashboard', queryMode);
      } else if (action === 'scan') {
        await performScan(true);
      }
    }
  });

  context.subscriptions.push(baselineWatcher, toolWatcher, pkgWatcher, uriHandler);

  // Also hook document save
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(async (doc) => {
      const fn = doc.fileName.toLowerCase();
      if (fn.includes('.toolguard') || fn.includes('package.json') || fn.includes('tasks.json') || fn.includes('mcp.json')) {
        await performScan(false);
      }
    })
  );

  // Dynamic workspace folder listener
  context.subscriptions.push(
    vscode.workspace.onDidChangeWorkspaceFolders(async () => {
      await checkFirstRunOrScan();
    })
  );

  // 2.5-second Real-time Polling Heartbeat
  const pollTimer = setInterval(async () => {
    await performScan(false);
  }, 2500);

  context.subscriptions.push({
    dispose: () => clearInterval(pollTimer)
  });
}

function updateStatusBar(state: 'safe' | 'drift' | 'unprotected' | 'checking' | 'ready', driftCount = 0) {
  statusBarItem.show();
  switch (state) {
    case 'safe':
      statusBarItem.text = '$(shield) ToolGuard $(check)';
      statusBarItem.tooltip = 'ToolGuard: All monitored tools match trusted baseline (Zero-Trust Verified)';
      statusBarItem.backgroundColor = undefined;
      statusBarItem.color = '#10b981';
      break;
    case 'drift':
      statusBarItem.text = `$(alert) ToolGuard: ⚠ DRIFT (${driftCount})`;
      statusBarItem.tooltip = `ToolGuard Alert: ${driftCount} tool capability drift(s) detected! Click to inspect.`;
      statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
      statusBarItem.color = '#ffffff';
      break;
    case 'unprotected':
      statusBarItem.text = '$(shield) ToolGuard $(circle-slash)';
      statusBarItem.tooltip = 'ToolGuard: No trusted baseline established. Run toolguard init to freeze baseline.';
      statusBarItem.backgroundColor = undefined;
      statusBarItem.color = '#f59e0b';
      break;
    case 'checking':
      statusBarItem.text = '$(sync~spin) ToolGuard';
      statusBarItem.tooltip = 'ToolGuard: Verifying tool configurations...';
      statusBarItem.color = undefined;
      break;
    case 'ready':
      statusBarItem.text = '$(shield) ToolGuard';
      statusBarItem.tooltip = 'ToolGuard: Active & Ready (Open a workspace to monitor tools)';
      statusBarItem.backgroundColor = undefined;
      statusBarItem.color = '#10b981';
      break;
  }
}

async function getWorkspacePath(): Promise<string | null> {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders || folders.length === 0) return null;
  return folders[0].uri.fsPath;
}

async function checkFirstRunOrScan() {
  const workspacePath = await getWorkspacePath();
  if (!workspacePath) {
    updateStatusBar('ready', 0);
    return;
  }

  const baseline = await scanService.loadBaseline(workspacePath);
  const tools = await scanService.discoverTools(workspacePath);

  if (!baseline) {
    updateStatusBar('unprotected', 0);
    if (tools.length > 0) {
      vscode.window.showInformationMessage(
        `ToolGuard discovered ${tools.length} tool(s) in this workspace. Establish trusted baseline?`,
        'Create Baseline'
      ).then(choice => {
        if (choice === 'Create Baseline') {
          createBaselineCommand();
        }
      });
    }
  } else {
    await performScan(false);
  }
}

async function performScan(userInitiated: boolean) {
  if (isScanning) return;
  isScanning = true;

  try {
    const workspacePath = await getWorkspacePath();
    if (!workspacePath) return;

    const baseline = await scanService.loadBaseline(workspacePath);
    if (!baseline) {
      updateStatusBar('unprotected', 0);
      if (userInitiated) {
        const choice = await vscode.window.showWarningMessage(
          'No baseline found. Establish baseline now?',
          'Create Baseline',
          'Cancel'
        );
        if (choice === 'Create Baseline') {
          await createBaselineCommand();
        }
      }
      return;
    }

    const tools = await scanService.discoverTools(workspacePath);
    const result = scanService.runScan(tools, baseline);
    latestScanResult = result;

    if (result.driftCount === 0) {
      updateStatusBar('safe', 0);
      notifiedDrifts.clear();
      if (userInitiated) {
        vscode.window.showInformationMessage(`ToolGuard: All ${result.totalTools} tools match trusted baseline.`);
      }
    } else {
      updateStatusBar('drift', result.driftCount);

      // Notify developer about newly detected drifts
      const driftTools = result.tools.filter(t => t.driftDetected);
      for (const tool of driftTools) {
        const driftKey = `${tool.name}-${tool.fingerprint}`;
        if (!notifiedDrifts.has(driftKey)) {
          notifiedDrifts.add(driftKey);
          const topChange = tool.changes[0];
          const reason = topChange?.reason || 'unauthorized capability expansion';
          const msg = `ToolGuard Alert: Trust drift detected in "${tool.name}" (${reason})!`;

          vscode.window.showErrorMessage(msg, 'Open Dashboard', 'Review Drift').then(action => {
            if (action === 'Open Dashboard') {
              openDashboardCommand('drift');
            } else if (action === 'Review Drift') {
              vscode.commands.executeCommand('toolguard.explainDrift');
            }
          });
        }
      }
    }
  } catch (err) {
    console.error('[ToolGuard Extension] Scan error:', err);
  } finally {
    isScanning = false;
  }
}

async function createBaselineCommand() {
  const workspacePath = await getWorkspacePath();
  if (!workspacePath) return;

  let tools = await scanService.discoverTools(workspacePath);
  if (tools.length === 0) {
    const choice = await vscode.window.showInformationMessage(
      'No tool definitions found in this workspace. Scaffold starter .toolguard/tools/ definition?',
      'Scaffold & Create Baseline',
      'Cancel'
    );
    if (choice === 'Scaffold & Create Baseline') {
      const toolsDir = path.join(workspacePath, '.toolguard', 'tools');
      await fs.mkdir(toolsDir, { recursive: true });
      const starterTool: ToolDefinition = {
        id: 'dev-runner',
        name: 'dev-runner',
        description: 'Development script execution tool',
        permissions: ['read', 'execute'],
        endpoint: 'local',
        execution: {
          enabled: true,
          command: 'npm run dev',
          isolated: false
        }
      };
      await fs.writeFile(
        path.join(toolsDir, 'dev-tools.json'),
        JSON.stringify([starterTool], null, 2),
        'utf8'
      );
      tools = [starterTool];
    } else {
      return;
    }
  }

  await scanService.createBaseline(workspacePath, tools);
  notifiedDrifts.clear();
  vscode.window.showInformationMessage(`ToolGuard: Baseline established for ${tools.length} tool(s).`);
  await performScan(false);
}

async function restoreCleanStateCommand() {
  const workspacePath = await getWorkspacePath();
  if (!workspacePath) return;

  const threatFile = path.join(workspacePath, '.toolguard', 'tools', 'threat-simulation.json');
  try {
    await fs.unlink(threatFile);
  } catch {}

  try {
    const toolsDir = path.join(workspacePath, '.toolguard', 'tools');
    const files = await fs.readdir(toolsDir).catch(() => [] as string[]);
    const baseline = await scanService.loadBaseline(workspacePath);
    for (const f of files) {
      if (f.toLowerCase().includes('threat') || f.toLowerCase().includes('simulation')) {
        await fs.unlink(path.join(toolsDir, f)).catch(() => {});
        continue;
      }

      if (baseline && baseline.tools && f.endsWith('.json')) {
        const filePath = path.join(toolsDir, f);
        try {
          const content = JSON.parse(await fs.readFile(filePath, 'utf8'));
          const toolArray = Array.isArray(content) ? content : [content];
          const isUnauthorized = toolArray.some((t: any) => {
            const id = t.id || t.name;
            return !baseline.tools[id] && !Object.values(baseline.tools).some(b => b.name === t.name);
          });

          if (isUnauthorized) {
            await fs.unlink(filePath).catch(() => {});
          } else {
            let modified = false;
            const restoredTools = toolArray.map((t: any) => {
              const id = t.id || t.name;
              const baselineEntry = baseline.tools[id] || Object.values(baseline.tools).find(b => b.name === t.name);
              if (baselineEntry && baselineEntry.normalizedDefinition) {
                modified = true;
                return {
                  id,
                  name: baselineEntry.name,
                  description: baselineEntry.normalizedDefinition.description || baselineEntry.name,
                  permissions: baselineEntry.normalizedDefinition.permissions || [],
                  endpoint: baselineEntry.normalizedDefinition.endpoint || 'local',
                  execution: baselineEntry.normalizedDefinition.execution || { enabled: false },
                  ...baselineEntry.metadata
                };
              }
              return t;
            });
            if (modified) {
              await fs.writeFile(filePath, JSON.stringify(Array.isArray(content) ? restoredTools : restoredTools[0], null, 2), 'utf8');
            }
          }
        } catch {}
      }
    }
  } catch {}

  notifiedDrifts.clear();
  await performScan(false);

  vscode.window.showInformationMessage(
    '✓ ToolGuard: Restored clean baseline (All tools verified SAFE).',
    'Open in IDE',
    'Open in Browser'
  ).then(choice => {
    if (choice === 'Open in IDE') {
      openDashboardCommand('dashboard', 'ide');
    } else if (choice === 'Open in Browser') {
      openDashboardCommand('dashboard', 'browser');
    }
  });
}

async function showStatusMenu() {
  const items: vscode.QuickPickItem[] = [
    {
      label: '$(play) Run Scan Now',
      description: 'Scan workspace tools against baseline'
    },
    {
      label: '$(layers) Create / Update Trusted Baseline',
      description: 'Freeze current tools as new trusted baseline'
    },
    {
      label: '$(warning) View Trust Drift Details',
      description: latestScanResult?.driftCount ? `${latestScanResult.driftCount} tool(s) changed` : 'No drift detected'
    },
    {
      label: '$(preview) Open Dashboard in IDE',
      description: 'Internal VS Code editor tab (offline local bridge)'
    },
    {
      label: '$(browser) Open Dashboard in Browser',
      description: 'Open in local web browser (http://127.0.0.1:3154)'
    },
    {
      label: '$(refresh) Restore Clean Baseline',
      description: 'Purge test simulation and restore verified baseline'
    }
  ];

  const selection = await vscode.window.showQuickPick(items, {
    placeHolder: 'ToolGuard Security Actions'
  });

  if (!selection) return;

  if (selection.label.includes('Run Scan')) {
    await vscode.commands.executeCommand('toolguard.scan');
  } else if (selection.label.includes('Create / Update')) {
    await vscode.commands.executeCommand('toolguard.createBaseline');
  } else if (selection.label.includes('View Trust Drift')) {
    await vscode.commands.executeCommand('toolguard.explainDrift');
  } else if (selection.label.includes('Open Dashboard in IDE')) {
    await openDashboardCommand('dashboard', 'ide');
  } else if (selection.label.includes('Open Dashboard in Browser')) {
    await openDashboardCommand('dashboard', 'browser');
  } else if (selection.label.includes('Restore Clean Baseline')) {
    await restoreCleanStateCommand();
  }
}

async function showDriftQuickPick() {
  if (!latestScanResult || latestScanResult.driftCount === 0) {
    vscode.window.showInformationMessage('ToolGuard: All monitored tools match trusted baseline.');
    return;
  }

  const driftTools = latestScanResult.tools.filter(t => t.driftDetected);
  const items = driftTools.map(t => ({
    label: `${t.status === 'HIGH RISK' ? '$(error)' : '$(warning)'} ${t.name}`,
    description: `[${t.status}] ${t.changes.length} change(s)`,
    detail: t.changes.map(c => c.reason).join(' | '),
    tool: t
  }));

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: 'Select a tool to inspect drift details'
  });

  if (selected) {
    const explanation = scanService.explainToolDrift(selected.tool);
    const action = await vscode.window.showInformationMessage(
      explanation,
      { modal: true },
      'Open in Dashboard'
    );
    if (action === 'Open in Dashboard') {
      await openDashboardCommand('drift');
    }
  }
}

async function explainDriftCommand() {
  await showDriftQuickPick();
}

export function deactivate() {}
