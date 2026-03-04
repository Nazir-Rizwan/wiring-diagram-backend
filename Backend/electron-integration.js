/**
 * electron-integration.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Drop this logic into your Electron app's main process (main.js / main.ts).
 *
 * The app calls GET <STATUS_URL>/status on every launch.
 *   { status: 'active' }   → window loads normally
 *   { status: 'inactive' } → warning dialog shown, then app exits
 *
 * No client/device IDs are sent or stored.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { app, BrowserWindow, dialog } = require('electron');
const https = require('https');
const http = require('http');

// ── Config ────────────────────────────────────────────────────────────────────
// Replace with your deployed backend URL (no trailing slash).
const STATUS_URL = 'https://your-deployed-backend.com';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Fetches the app status from the backend.
 * Returns 'active' or 'inactive'. Falls back to 'active' if the request fails
 * (optional: change to 'inactive' for strict mode).
 */
function fetchAppStatus() {
  return new Promise((resolve) => {
    const url = `${STATUS_URL}/status`;
    const client = url.startsWith('https') ? https : http;

    const req = client.get(url, { timeout: 8000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.status === 'inactive' ? 'inactive' : 'active');
        } catch {
          // Malformed response → treat as active (or change to 'inactive' for strict mode)
          resolve('active');
        }
      });
    });

    req.on('error', () => {
      // Network error → treat as active (or change to 'inactive' for strict mode)
      resolve('active');
    });

    req.on('timeout', () => {
      req.destroy();
      resolve('active');
    });
  });
}

// ── Main process ──────────────────────────────────────────────────────────────

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile('index.html'); // or loadURL for your renderer
}

app.whenReady().then(async () => {
  const status = await fetchAppStatus();

  if (status === 'inactive') {
    // Show warning and exit — no window is created
    await dialog.showMessageBox({
      type: 'warning',
      title: 'Application Disabled',
      message:
        'This application has been disabled by the administrator.\nPlease contact support.',
      buttons: ['OK'],
    });
    app.exit(0);
    return;
  }

  // Status is 'active' — proceed normally
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
