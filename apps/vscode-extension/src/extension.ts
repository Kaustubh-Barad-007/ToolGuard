import * as vscode from 'vscode';
import * as path from 'path';
import { promises as fs } from 'fs';
import { ExtensionScanService } from './services/scanner.js';
import { ScanResult, ToolScanStatus, ToolDefinition } from '@toolguard/shared';

let statusBarItem: vscode.StatusBarItem;
let scanService: ExtensionScanService;
let latestScanResult: ScanResult | null = null;
let notifiedDrifts = new Set<string>();
let isScanning = false;

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

    vscode.commands.registerCommand('toolguard.openDashboard', () => {
      const config = vscode.workspace.getConfiguration('toolguard');
      const url = config.get<string>('dashboardUrl') || 'https://toolguard-app.vercel.app';
      vscode.env.openExternal(vscode.Uri.parse(url));
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

  // Real-time File System Watchers (create, change, delete)
  const toolWatcher = vscode.workspace.createFileSystemWatcher('**/{.toolguard,tools,.cursor,.vscode}/**/*.{json,yaml,yml}');
  const pkgWatcher = vscode.workspace.createFileSystemWatcher('**/package.json');

  const onWorkspaceChanged = async () => {
    await performScan(false);
  };

  toolWatcher.onDidChange(onWorkspaceChanged);
  toolWatcher.onDidCreate(onWorkspaceChanged);
  toolWatcher.onDidDelete(onWorkspaceChanged);

  pkgWatcher.onDidChange(onWorkspaceChanged);
  pkgWatcher.onDidCreate(onWorkspaceChanged);
  pkgWatcher.onDidDelete(onWorkspaceChanged);

  context.subscriptions.push(toolWatcher, pkgWatcher);

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

          vscode.window.showErrorMessage(msg, 'Review Drift', 'Open Dashboard').then(action => {
            if (action === 'Review Drift') {
              vscode.commands.executeCommand('toolguard.explainDrift');
            } else if (action === 'Open Dashboard') {
              vscode.commands.executeCommand('toolguard.openDashboard');
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
      label: '$(browser) Open Web Dashboard',
      description: 'Full visual dashboard with side-by-side diff'
    }
  ];

  const selection = await vscode.window.showQuickPick(items, {
    placeHolder: 'ToolGuard Actions'
  });

  if (!selection) return;

  if (selection.label.includes('Run Scan')) {
    await vscode.commands.executeCommand('toolguard.scan');
  } else if (selection.label.includes('Create / Update')) {
    await vscode.commands.executeCommand('toolguard.createBaseline');
  } else if (selection.label.includes('View Trust Drift')) {
    await vscode.commands.executeCommand('toolguard.explainDrift');
  } else if (selection.label.includes('Open Web Dashboard')) {
    await vscode.commands.executeCommand('toolguard.openDashboard');
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
      vscode.commands.executeCommand('toolguard.openDashboard');
    }
  }
}

async function explainDriftCommand() {
  await showDriftQuickPick();
}

export function deactivate() {}
