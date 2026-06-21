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
  // spawn vite preview directly via npx so the child process is the server and is killable
  // spawn vite preview via npx and detach so we can kill the whole process group reliably
  // run the dev server (not preview) so Playwright can interact with HMR content during development
  const serverProc = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['vite', 'dev', '--port', String(PREVIEW_PORT)], {
    stdio: ['ignore', 'inherit', 'inherit'],
    detached: true
  });
  // allow parent to exit independently when we explicitly kill the child group
  try { serverProc.unref(); } catch (e) {}

  let killed = false;
  function cleanup() {
    if (!serverProc) return;
    try {
      if (process.platform === 'win32') {
        // on Windows, kill the process directly
        serverProc.kill();
      } else {
        // kill the entire process group started by the detached child
        process.kill(-serverProc.pid);
      }
    } catch (e) {
      try { serverProc.kill(); } catch (e2) {}
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
    // give a short moment for cleanup then exit
    setTimeout(() => process.exit(code ?? 0), 100);
  });
  runner.on('error', (err) => {
    console.error('Playwright runner failed:', err);
    cleanup();
    process.exit(3);
  });
  // safety: if this parent exits unexpectedly, ensure child is killed
  process.on('exit', () => { cleanup(); });
}

main();
