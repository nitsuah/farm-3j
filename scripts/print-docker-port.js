#!/usr/bin/env node
const { execSync } = require('child_process');
try {
  const output = execSync('docker ps --format "{{.Names}}: {{.Ports}}"').toString();
  const match = output.match(/farm-farm-app-1: ([^\s]+)/);
  if (match) {
    const port = match[1].split('->')[0].split(':').pop();
    console.log(`\n[Farm RTS] App is running at: http://localhost:${port}/rtsfarm\n`);
  } else {
    console.log('\n[Farm RTS] Could not determine running port.\n');
  }
} catch (e) {
  console.log('\n[Farm RTS] Error checking Docker port.\n');
}
