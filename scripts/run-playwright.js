#!/usr/bin/env node
const { spawn } = require('child_process');
const http = require('http');

const PREVIEW_PORT = process.env.PREVIEW_PORT || 5173;
const PREVIEW_URL = `http://localhost:${PREVIEW_PORT}/`;
const START_TIMEOUT = parseInt(process.env.START_TIMEOUT || '30000', 10);

function waitFor(url, timeout) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    (function poll() {
      http.get(url, (res) => {
        resolve();
      }).on('error', (err) => {
        if (Date.now() - start > timeout) return reject(new Error('timeout'));
        setTimeout(poll, 200);
      });
    })();
  });
}

async function main() {
  console.log(`Starting preview server on port ${PREVIEW_PORT}...`);
  const serverProc = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'preview', '--', '--port', String(PREVIEW_PORT)], {
    stdio: ['ignore', 'inherit', 'inherit']
  });

  let killed = false;
  function cleanup() {
    if (serverProc && !serverProc.killed) {
      try { serverProc.kill(); } catch (e) {}
    }
    killed = true;
  }

  process.on('SIGINT', () => { cleanup(); process.exit(1); });
  process.on('SIGTERM', () => { cleanup(); process.exit(1); });

  try {
    await waitFor(PREVIEW_URL, START_TIMEOUT);
    console.log('Preview server is up — running Playwright tests');
  } catch (err) {
    console.error('Preview server did not start in time');
    cleanup();
    process.exit(2);
  }

  const runner = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['playwright', 'test', '--config=playwright.config.ts'], { stdio: 'inherit' });
  runner.on('close', (code) => {
    // ensure server is killed
    cleanup();
    process.exit(code);
  });
}

main();
