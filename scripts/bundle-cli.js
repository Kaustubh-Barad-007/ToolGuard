#!/usr/bin/env node
/**
 * ToolGuard Standalone CLI Bundler & Packager
 * 
 * Bundles packages/cli into a self-contained single-file CommonJS binary (cli.cjs)
 * and packages it into universal npm tarballs (toolguard.tgz & toolguard-1.0.0.tgz)
 * for distribution via the web dashboard.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const esbuild = require('esbuild');

const rootDir = path.resolve(__dirname, '..');

console.log('\n📦 ToolGuard CLI Bundler\n──────────────────────────────');

// 1. Bundle CLI with esbuild
console.log('1. Bundling standalone executable (packages/cli/dist/cli.cjs)...');
const cliDistDir = path.join(rootDir, 'packages/cli/dist');
if (!fs.existsSync(cliDistDir)) {
  fs.mkdirSync(cliDistDir, { recursive: true });
}

esbuild.buildSync({
  entryPoints: [path.join(rootDir, 'packages/cli/src/index.ts')],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  banner: { js: '#!/usr/bin/env node' },
  outfile: path.join(cliDistDir, 'cli.cjs'),
});
console.log('   ✓ Bundled packages/cli/dist/cli.cjs');

// 2. Prepare packaging directory
console.log('2. Creating standalone npm package structure...');
const tempPackDir = path.join(rootDir, 'temp_pack');
if (fs.existsSync(tempPackDir)) {
  fs.rmSync(tempPackDir, { recursive: true, force: true });
}
fs.mkdirSync(path.join(tempPackDir, 'bin'), { recursive: true });

// Copy bundled executable and create launcher
fs.copyFileSync(
  path.join(cliDistDir, 'cli.cjs'),
  path.join(tempPackDir, 'bin', 'cli.cjs')
);
fs.writeFileSync(
  path.join(tempPackDir, 'bin', 'toolguard.js'),
  '#!/usr/bin/env node\nrequire("./cli.cjs");\n'
);

// Create package.json for standalone CLI distribution
fs.writeFileSync(
  path.join(tempPackDir, 'package.json'),
  JSON.stringify(
    {
      name: 'toolguard',
      version: '1.0.0',
      description: 'ToolGuard — Zero-trust capability verification for developer tools & AI agents',
      bin: {
        toolguard: './bin/toolguard.js',
      },
    },
    null,
    2
  )
);

// 3. Package tarball using npm pack
console.log('3. Running npm pack...');
execSync('npm pack', { cwd: tempPackDir, stdio: 'pipe' });

const packedTgz = path.join(tempPackDir, 'toolguard-1.0.0.tgz');
if (!fs.existsSync(packedTgz)) {
  throw new Error('Expected packed tarball not found at: ' + packedTgz);
}

const stats = fs.statSync(packedTgz);
const sizeKb = (stats.size / 1024).toFixed(1);

// 4. Copy to target destinations
console.log('4. Copying tarballs (' + sizeKb + ' KB) to web distribution targets...');

const webPublicDir = path.join(rootDir, 'apps/web/public');
fs.copyFileSync(packedTgz, path.join(webPublicDir, 'toolguard.tgz'));
fs.copyFileSync(packedTgz, path.join(webPublicDir, 'toolguard-1.0.0.tgz'));
console.log('   ✓ apps/web/public/toolguard.tgz');
console.log('   ✓ apps/web/public/toolguard-1.0.0.tgz');

const webDistDir = path.join(rootDir, 'apps/web/dist');
if (fs.existsSync(webDistDir)) {
  fs.copyFileSync(packedTgz, path.join(webDistDir, 'toolguard.tgz'));
  fs.copyFileSync(packedTgz, path.join(webDistDir, 'toolguard-1.0.0.tgz'));
  console.log('   ✓ apps/web/dist/toolguard.tgz');
  console.log('   ✓ apps/web/dist/toolguard-1.0.0.tgz');

  // Copy installer scripts and VSIX
  const copyIfPresent = (file) => {
    const src = path.join(webPublicDir, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(webDistDir, file));
      console.log(`   ✓ apps/web/dist/${file}`);
    }
  };
  copyIfPresent('install.ps1');
  copyIfPresent('install.sh');
  copyIfPresent('toolguard-vscode-1.0.0.vsix');
}

// 5. Clean up temporary directory
fs.rmSync(tempPackDir, { recursive: true, force: true });

console.log('\n✓ ToolGuard CLI successfully bundled and packaged!\n');
