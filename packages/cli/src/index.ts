import { Command } from 'commander';
import * as path from 'path';
import { promises as fs } from 'fs';
import { exec } from 'child_process';
import {
  BaselineManager,
  formatDriftExplanation,
  discoverWorkspaceTools,
  FileBaselineStorage
} from '@toolguard/core/node';
import { ToolDefinition, ScanResult, RiskSeverity } from '@toolguard/shared';

const program = new Command();

program
  .name('toolguard')
  .description('ToolGuard — You trusted the tool. Did the tool stay the same?')
  .version('1.0.0');

// 1. COMMAND: init
program
  .command('init')
  .description('Initialize ToolGuard in the current workspace and create baseline')
  .option('-y, --yes', 'Automatically confirm baseline creation', false)
  .action(async (options) => {
    const cwd = process.cwd();
    console.log('\n🛡 ToolGuard\n');
    console.log('Scanning workspace with universal discovery...');

    try {
      const tools = await discoverWorkspaceTools(cwd);
      console.log(`✓ ${tools.length} tools discovered across workspace\n`);

      if (tools.length === 0) {
        console.log('No tool definitions found in workspace.');
        console.log('Scaffolding starter configuration at .toolguard/tools/dev-tools.json...');
        const toolsDir = path.join(cwd, '.toolguard', 'tools');
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
        tools.push(starterTool);
        console.log(`✓ Created starter tool: ${starterTool.name}\n`);
      }

      for (const t of tools) {
        console.log(`  - ${t.name.padEnd(24)} (${t.permissions?.join(', ') || 'no permissions'})`);
      }

      console.log('\nCreating trusted baseline...');
      const baseline = BaselineManager.createBaseline(tools, path.basename(cwd));
      await FileBaselineStorage.saveLocalBaseline(cwd, baseline);

      console.log(`✓ Trusted baseline created at .toolguard/baseline.json (${baseline.toolCount} tools recorded)`);
      console.log('Your workspace tools are now protected against trust drift.\n');
      process.exit(0);
    } catch (err) {
      console.error('Error during init:', err);
      process.exit(2);
    }
  });

// 2. COMMAND: scan
program
  .command('scan')
  .description('Scan current tools against the trusted baseline')
  .option('--ci', 'Run in CI mode with exit code enforcement', false)
  .option('--fail-on <severity>', 'Fail CI if severity matches or exceeds (low|medium|high)', 'high')
  .option('--json', 'Output results as JSON', false)
  .action(async (options) => {
    const cwd = process.cwd();

    try {
      const baseline = await FileBaselineStorage.loadLocalBaseline(cwd);
      if (!baseline) {
        console.error('No trusted baseline found. Run `toolguard init` first.');
        process.exit(2);
      }

      const tools = await discoverWorkspaceTools(cwd);
      const scanResult: ScanResult = BaselineManager.compare(tools, baseline);

      if (options.json) {
        console.log(JSON.stringify(scanResult, null, 2));
        if (scanResult.driftCount > 0) process.exit(1);
        process.exit(0);
      }

      console.log('\nToolGuard Security Scan');
      console.log('────────────────────────');

      for (const t of scanResult.tools) {
        const symbol = t.status === 'SAFE' ? '✓' : '⚠';
        const statusLabel = t.status === 'SAFE' ? 'unchanged' : 'changed';
        console.log(`${symbol} ${t.name.padEnd(20)} ${statusLabel}`);
      }

      console.log('');

      if (scanResult.driftCount === 0) {
        console.log('✓ All monitored tools match the trusted baseline. (SAFE)\n');
        process.exit(0);
      }

      console.log('Trust drift detected.\n');

      for (const t of scanResult.tools.filter(tool => tool.driftDetected)) {
        console.log(`${t.name}`);
        for (const ch of t.changes) {
          const beforeStr = JSON.stringify(ch.before) || 'none';
          const afterStr = JSON.stringify(ch.after) || 'none';
          console.log(`  ${ch.path}: ${beforeStr} → ${afterStr}`);
        }
        console.log(`  Risk: ${t.status}\n`);
      }

      const topDrift = scanResult.tools.find(t => t.driftDetected);
      if (topDrift) {
        console.log('Run:');
        console.log(`  toolguard explain ${topDrift.name}\n`);
      }

      // Check CI policy
      if (options.ci) {
        const severityOrder: Record<RiskSeverity, number> = { low: 1, medium: 2, high: 3 };
        const minThreshold = severityOrder[options.failOn.toLowerCase() as RiskSeverity] || 3;
        const highestDetected = scanResult.highestSeverity !== 'none'
          ? severityOrder[scanResult.highestSeverity]
          : 0;

        if (highestDetected >= minThreshold) {
          console.error(`CI failure: Detected drift severity [${scanResult.highestSeverity}] meets or exceeds --fail-on [${options.failOn}]`);
          process.exit(1);
        }
      }

      process.exit(1);
    } catch (err) {
      console.error('Scan execution error:', err);
      process.exit(2);
    }
  });

// 3. COMMAND: status
program
  .command('status')
  .description('Show current ToolGuard protection status')
  .action(async () => {
    const cwd = process.cwd();
    const baseline = await FileBaselineStorage.loadLocalBaseline(cwd);

    console.log('\nToolGuard Workspace Status');
    console.log('──────────────────────────');

    if (!baseline) {
      console.log('Status:           UNPROTECTED (No baseline found)');
      console.log('Action:           Run `toolguard init` to create baseline\n');
      process.exit(0);
    }

    const tools = await discoverWorkspaceTools(cwd);
    const scanResult = BaselineManager.compare(tools, baseline);

    console.log(`Protection:       ${scanResult.driftCount === 0 ? '● PROTECTED' : '● TRUST DRIFT'}`);
    console.log(`Baseline Version: v${baseline.version} (${new Date(baseline.createdAt).toLocaleString()})`);
    console.log(`Tools Monitored:  ${scanResult.totalTools}`);
    console.log(`Active Drift:     ${scanResult.driftCount} tool(s)\n`);
    process.exit(0);
  });

// 4. COMMAND: baseline
program
  .command('baseline')
  .description('View or update trusted baseline')
  .option('-c, --create', 'Force recreate baseline with current tools', false)
  .action(async (options) => {
    const cwd = process.cwd();

    if (options.create) {
      const tools = await discoverWorkspaceTools(cwd);
      const baseline = BaselineManager.createBaseline(tools, path.basename(cwd));
      await FileBaselineStorage.saveLocalBaseline(cwd, baseline);
      console.log(`✓ Re-created baseline for ${tools.length} tools.\n`);
      process.exit(0);
    }

    const baseline = await FileBaselineStorage.loadLocalBaseline(cwd);
    if (!baseline) {
      console.log('No baseline found. Run `toolguard init` or `toolguard baseline -c` to create one.\n');
      process.exit(0);
    }

    console.log(`\nActive Baseline: ${baseline.baselineId}`);
    console.log(`Created:         ${new Date(baseline.createdAt).toLocaleString()}`);
    console.log(`Algorithm:       ${baseline.algorithm}`);
    console.log(`Tools (${baseline.toolCount}):`);
    for (const [id, entry] of Object.entries(baseline.tools)) {
      console.log(`  - ${entry.name.padEnd(24)} [${entry.fingerprint.substring(0, 16)}...]`);
    }
    console.log('');
  });

// 5. COMMAND: explain
program
  .command('explain <toolName>')
  .description('Explain trust drift and security implications for a specific tool')
  .action(async (toolName) => {
    const cwd = process.cwd();
    const baseline = await FileBaselineStorage.loadLocalBaseline(cwd);
    if (!baseline) {
      console.error('No baseline found.');
      process.exit(2);
    }

    const tools = await discoverWorkspaceTools(cwd);
    const scanResult = BaselineManager.compare(tools, baseline);
    const target = scanResult.tools.find(t => t.name.toLowerCase() === toolName.toLowerCase());

    if (!target) {
      console.error(`Tool "${toolName}" not found in current scan.`);
      process.exit(2);
    }

    console.log('\n' + formatDriftExplanation(target.name, target.changes));
  });

// 6. COMMAND: export
program
  .command('export')
  .description('Export the trusted baseline for import into Web Dashboard or CI')
  .option('-o, --output <file>', 'Save output to a specific JSON file')
  .action(async (options) => {
    const cwd = process.cwd();
    const baseline = await FileBaselineStorage.loadLocalBaseline(cwd);
    if (!baseline) {
      console.error('No baseline found. Run `toolguard init` first.');
      process.exit(2);
    }

    const json = JSON.stringify(baseline, null, 2);
    if (options.output) {
      await fs.writeFile(path.resolve(cwd, options.output), json, 'utf8');
      console.log(`✓ Exported baseline to ${options.output}`);
    } else {
      console.log(json);
    }
  });

// 7. COMMAND: sync
program
  .command('sync')
  .description('Check workspace sync and display dashboard link')
  .action(async () => {
    const cwd = process.cwd();
    const baseline = await FileBaselineStorage.loadLocalBaseline(cwd);
    const url = process.env.TOOLGUARD_DASHBOARD_URL || 'https://toolguard-app.vercel.app';

    console.log('\n🛡 ToolGuard Workspace Sync');
    console.log('───────────────────────────');

    if (!baseline) {
      console.log('Local status: UNPROTECTED');
      console.log('Run `toolguard init` to create a local baseline.');
      return;
    }

    const tools = await discoverWorkspaceTools(cwd);
    const scanResult = BaselineManager.compare(tools, baseline);

    console.log(`Project:         ${baseline.projectId || path.basename(cwd)}`);
    console.log(`Tools detected:  ${tools.length}`);
    console.log(`Baseline hash:   ${baseline.baselineId}`);
    console.log(`Integrity:       ${scanResult.driftCount === 0 ? '✓ IN SYNC (0 drift)' : `⚠ DRIFT DETECTED (${scanResult.driftCount} changed)`}`);
    console.log(`\nTo view on the web dashboard:`);
    console.log(`  1. Open ${url}`);
    console.log(`  2. Click "Import Baseline" and select .toolguard/baseline.json\n`);
  });

// 8. COMMAND: dashboard
program
  .command('dashboard')
  .description('Open the ToolGuard Web Dashboard in browser')
  .action(() => {
    const url = process.env.TOOLGUARD_DASHBOARD_URL || 'https://toolguard-app.vercel.app';
    console.log(`Opening ToolGuard Dashboard at ${url}...`);

    const platform = process.platform;
    const cmd = platform === 'win32'
      ? `start ${url}`
      : platform === 'darwin'
      ? `open ${url}`
      : `xdg-open ${url}`;

    exec(cmd, (err) => {
      if (err) {
        console.log(`Please open ${url} in your browser.`);
      }
    });
  });

// 9. COMMAND: disconnect / reset
program
  .command('disconnect')
  .alias('reset')
  .description('Disconnect ToolGuard from the current workspace and delete protection baselines')
  .action(async () => {
    const cwd = process.cwd();
    const toolguardDir = path.join(cwd, '.toolguard');

    console.log('\n🛡 ToolGuard Disconnect\n─────────────────────────');

    try {
      const exists = await fs.stat(toolguardDir).catch(() => null);
      if (!exists) {
        console.log('No .toolguard configuration found in this workspace.');
        console.log('Workspace is already disconnected.\n');
        return;
      }

      await fs.rm(toolguardDir, { recursive: true, force: true });
      console.log('✓ Successfully removed .toolguard/ directory and all cryptographic baselines.');
      console.log('✓ Workspace is now disconnected and unprotected.\n');
      console.log('To reconnect at any time: run `toolguard init -y`\n');
    } catch (err: any) {
      console.error(`Failed to disconnect: ${err.message}`);
      process.exit(1);
    }
  });

program.parse(process.argv);
