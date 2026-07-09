import { app, BrowserWindow, ipcMain, Tray } from 'electron';
import * as path from 'path';
import { processText } from './ai';
import { handleClipboardCorrect, handleClipboardTranslate } from './clipboard-mode';
import { handleSelectAndCorrect } from './select-correct-mode';
import { loadSettings, saveSettings, Settings } from './settings-store';
import { registerShortcuts, reRegisterShortcuts, unregisterAll } from './shortcuts';
import { showToast } from './toast';
import { createTray } from './tray';

// Prevent multiple instances
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

let tray: Tray | null = null;
let popupWindow: BrowserWindow | null = null;
let settingsWindow: BrowserWindow | null = null;

function createPopupWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 480,
    height: 520,
    show: false,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    transparent: false,
    vibrancy: 'popover',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    win.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  win.on('blur', () => {
    win.hide();
  });

  return win;
}

function createSettingsWindow(): BrowserWindow {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus();
    return settingsWindow;
  }

  const win = new BrowserWindow({
    width: 460,
    height: 580,
    show: false,
    resizable: false,
    title: 'Fixly Settings',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    win.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}/settings.html`);
  } else {
    win.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/settings.html`),
    );
  }

  win.once('ready-to-show', () => win.show());
  win.on('closed', () => {
    settingsWindow = null;
  });

  settingsWindow = win;
  return win;
}

function togglePopup(): void {
  if (!popupWindow || popupWindow.isDestroyed()) {
    popupWindow = createPopupWindow();
  }

  if (popupWindow.isVisible()) {
    popupWindow.hide();
  } else {
    popupWindow.center();
    popupWindow.show();
    popupWindow.focus();
  }
}

// Called when tray quick-switch changes settings
function onSettingsChanged(settings: Settings): void {
  applyLoginItemSetting(settings.launchAtLogin);
}

function applyLoginItemSetting(enabled: boolean): void {
  app.setLoginItemSettings({
    openAtLogin: enabled,
    openAsHidden: true,
  });
}

// IPC handlers
function setupIPC(): void {
  ipcMain.handle('process-text', async (_event, text: string, options: Record<string, string>) => {
    console.log('[Fixly] IPC process-text received, options:', options);
    const settings = loadSettings();
    try {
      const result = await processText(text, settings, {
        mode: (options?.mode as any) || settings.activeMode,
        translationDirection: (options?.translationDirection as any) || settings.translationDirection,
      });
      console.log('[Fixly] IPC process-text OK:', JSON.stringify(result.slice(0, 80)));
      return result;
    } catch (e) {
      console.error('[Fixly] IPC process-text FAILED:', e);
      throw e;
    }
  });

  ipcMain.handle('get-settings', () => {
    return loadSettings();
  });

  ipcMain.handle('save-settings', (_event, newSettings) => {
    saveSettings(newSettings);
    // Re-register shortcuts if they changed
    if (newSettings.shortcuts) {
      reRegisterShortcuts(newSettings.shortcuts);
    }
    // Apply launch at login setting
    applyLoginItemSetting(!!newSettings.launchAtLogin);
  });
}

app.whenReady().then(() => {
  // Set app name for notifications and macOS identification
  app.setName('Fixly');

  // Hide dock icon (tray-only app)
  if (app.dock) {
    app.dock.hide();
  }

  setupIPC();

  popupWindow = createPopupWindow();

  // Show startup toast with platform-appropriate shortcut hint
  const shortcutHint = process.platform === 'darwin' ? '⌘⇧G' : 'Ctrl+Shift+G';
  showToast('Fixly', `Fixly is running! Use ${shortcutHint} to open.`, 'info');

  const settings = loadSettings();
  applyLoginItemSetting(settings.launchAtLogin);

  tray = createTray(
    () => createSettingsWindow(),
    () => app.quit(),
    onSettingsChanged,
  );

  registerShortcuts(
    togglePopup,
    handleClipboardCorrect,
    handleClipboardTranslate,
    handleSelectAndCorrect,
    settings.shortcuts,
  );
});

app.on('will-quit', () => {
  unregisterAll();
});

app.on('window-all-closed', () => {
  // Do not quit - tray app stays alive
});
