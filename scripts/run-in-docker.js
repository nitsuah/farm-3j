const { spawnSync } = require('node:child_process');
const path = require('node:path');

const packageJson = require('../package.json');

const requestedScript = process.argv[2];

if (!requestedScript) {
  console.error('Usage: node scripts/run-in-docker.js <script-name>');
  process.exit(1);
}

if (!packageJson.scripts[requestedScript]) {
  console.error(`Unknown package script: ${requestedScript}`);
  process.exit(1);
}

const workspacePath = path.resolve(process.cwd());
const workspaceName = path.basename(workspacePath).toLowerCase().replace(/[^a-z0-9]+/g, '-');
const nodeModulesVolume = `${workspaceName}-node-modules`;
const pnpmStoreVolume = `${workspaceName}-pnpm-store`;
const packageManager = packageJson.packageManager;

const dockerArgs = [
  'run',
  '--rm',
  '-v',
  `${workspacePath}:/app`,
  '-v',
  `${nodeModulesVolume}:/app/node_modules`,
  '-v',
  `${pnpmStoreVolume}:/pnpm/store`,
  '-w',
  '/app',
  'node:22-alpine',
  'sh',
  '-lc',
  `corepack enable && corepack prepare ${packageManager} --activate && pnpm config set store-dir /pnpm/store && pnpm install --frozen-lockfile --reporter=silent && pnpm run ${requestedScript}`,
];

const result = spawnSync('docker', dockerArgs, {
  stdio: 'inherit',
});

if (result.error) {
  console.error('Failed to start Docker. Ensure Docker is installed and running.');
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
