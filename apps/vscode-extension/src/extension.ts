import * as vscode from 'vscode';
import * as path from 'path';
import { promises as fs } from 'fs';
import { ExtensionScanService } from './services/scanner.js';
import { ScanResult, ToolScanStatus, ToolDefinition } from '@toolguard/shared';

let statusBarItem: vscode.StatusBarItem;
let scanService: ExtensionScanService;
let latestScanResult: ScanResult | null = null;
let notifiedDrifts = new Set<string>();

export async function activate(context: vscode.ExtensionContext) {
  scanService = new ExtensionScanService();

  // Create Status Bar Item
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBarItem.command = 'toolguard.showStatus';
  context.subscriptions.push(statusBarItem);
  updateStatusBar('checking');

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
      const url = config.get<string>('dashboardUrl') || 'http://localhost:5173';
      vscode.env.openExternal(vscode.Uri.parse(url));
    }),

    vscode.commands.registerCommand('toolguard.showStatus', async () => {
      await showStatusMenu();
    }),

    vscode.commands.registerCommand('toolguard.explainDrift', async () => {
      await explainDriftCommand();
    }),

    vscode.commands.registerCommand('toolguard.refreshTools', async () => {
      await performScan(false);
      vscode.window.showInformationMessage('ToolGuard: Refreshed tool list.');
    })
  );

  // Initial Scan & First-Run check
  await checkFirstRunOrScan();

  // Watch for changes in workspace tool manifests
  const watcher = vscode.workspace.createFileSystemWatcher('**/{.toolguard,tools,.cursor}/**/*.{json,yaml}');
  watcher.onDidChange(async () => {
    const config = vscode.workspace.getConfiguration('toolguard');
    if (config.get<boolean>('scanOnSave', true)) {
      await performScan(false);
    }
  });
  context.subscriptions.push(watcher);
}

function updateStatusBar(state: 'safe' | 'drift' | 'unprotected' | 'checking') {
  statusBarItem.show();
  switch (state) {
    case 'safe':
      statusBarItem.text = '$(shield) ToolGuard $(check)';
      statusBarItem.tooltip = 'ToolGuard: All monitored tools match trusted baseline';
      statusBarItem.backgroundColor = undefined;
      break;
    case 'drift':
      statusBarItem.text = '$(warning) ToolGuard $(alert)';
      statusBarItem.tooltip = 'ToolGuard: Trust drift detected in workspace tools!';
      statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
      break;
    case 'unprotected':
      statusBarItem.text = '$(shield) ToolGuard $(circle-slash)';
      statusBarItem.tooltip = 'ToolGuard: No trusted baseline established';
      statusBarItem.backgroundColor = undefined;
      break;
    case 'checking':
      statusBarItem.text = '$(sync~spin) ToolGuard';
      statusBarItem.tooltip = 'ToolGuard: Checking tool configurations...';
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
    statusBarItem.hide();
    return;
  }

  const baseline = await scanService.loadBaseline(workspacePath);
  const tools = await scanService.discoverTools(workspacePath);

  if (!baseline) {
    updateStatusBar('unprotected');
    if (tools.length > 0) {
      const selection = await vscode.window.showInformationMessage(
        `ToolGuard discovered ${tools.length} tool(s) in this workspace. Create a trusted baseline to monitor for trust drift?`,
        'Create Baseline',
        'Dismiss'
      );
      if (selection === 'Create Baseline') {
        await createBaselineCommand();
      }
    }
  } else {
    await performScan(false);
  }
}

async function performScan(userInitiated: boolean) {
  const workspacePath = await getWorkspacePath();
  if (!workspacePath) return;

  updateStatusBar('checking');
  const baseline = await scanService.loadBaseline(workspacePath);

  if (!baseline) {
    updateStatusBar('unprotected');
    if (userInitiated) {
      const choice = await vscode.window.showWarningMessage(
        'No baseline found. Create one now?',
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
    updateStatusBar('safe');
    notifiedDrifts.clear();
    if (userInitiated) {
      vscode.window.showInformationMessage(`ToolGuard: All ${result.totalTools} tools match trusted baseline.`);
    }
  } else {
    updateStatusBar('drift');

    // Notify user about newly detected drifts (avoiding spam)
    const driftTools = result.tools.filter(t => t.driftDetected);
    for (const tool of driftTools) {
      const driftKey = `${tool.name}-${tool.fingerprint}`;
      if (!notifiedDrifts.has(driftKey)) {
        notifiedDrifts.add(driftKey);
        const topChange = tool.changes[0];
        const msg = `ToolGuard detected trust drift: "${tool.name}" changed (${topChange?.reason || 'capability modified'}).`;
        vscode.window.showWarningMessage(msg, 'Review Drift', 'Open Dashboard').then(action => {
          if (action === 'Review Drift') {
            vscode.commands.executeCommand('toolguard.explainDrift');
          } else if (action === 'Open Dashboard') {
            vscode.commands.executeCommand('toolguard.openDashboard');
          }
        });
      }
    }
  }
}

async function createBaselineCommand() {
  const workspacePath = await getWorkspacePath();
  if (!workspacePath) return;

  let tools = await scanService.discoverTools(workspacePath);
  if (tools.length === 0) {
    const choice = await vscode.window.showInformationMessage(
      'No tool definitions found in this workspace. Scaffold a starter .toolguard/tools/ definition now?',
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
    vscode.window.showInformationMessage('No trust drift detected in workspace tools.');
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
    placeHolder: 'Select a tool to inspect drift'
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
