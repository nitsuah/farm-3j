#!/usr/bin/env node
const { execSync } = require('child_process');

try {
  const containerId = execSync('docker compose -f config/docker-compose.yml ps -q farm-app')
    .toString()
    .trim();
  if (!containerId) {
    console.log('\n[Farm RTS] Could not determine running port.\n');
  } else {
    const portMapping = execSync(`docker port ${containerId} 3000/tcp`)
      .toString()
      .trim()
      .split('\n')
      .find(Boolean);
    const port = portMapping?.split(':').pop();
    if (!port) {
      console.log('\n[Farm RTS] Could not determine running port.\n');
      process.exit(0);
    }
    console.log(
      `\n[Farm RTS] App is running at: http://localhost:${port}/rtsfarm\n`
    );
  }
} catch (e) {
  console.log('\n[Farm RTS] Error checking Docker port.\n');
}
