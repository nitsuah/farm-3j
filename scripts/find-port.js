#!/usr/bin/env node
const detect = require('detect-port');
const { spawn } = require('child_process');

const DEFAULT_PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

(async () => {
  let port = DEFAULT_PORT;
  let found = false;
  for (let i = 0; i < 20; i++) {
    const _port = await detect(port);
    if (_port === port) {
      found = true;
      break;
    }
    port++;
  }
  if (!found) {
    console.error('No available port found in range 3000-3019.');
    process.exit(1);
  }
  process.env.PORT = port;
  console.log(`\n[Farm RTS] Starting on port ${port}...`);
  const child = spawn('pnpm', ['run', 'dev'], {
    stdio: 'inherit',
    env: process.env,
    shell: true,
  });
  child.on('exit', code => process.exit(code));
})();
