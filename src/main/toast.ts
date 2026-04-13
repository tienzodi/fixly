import { BrowserWindow, screen } from 'electron';

let toastWindow: BrowserWindow | null = null;
let hideTimer: NodeJS.Timeout | null = null;

/**
 * Show a custom toast notification as a small floating window.
 * Works reliably without macOS notification permissions.
 */
export function showToast(
  title: string,
  body: string,
  type: 'success' | 'error' | 'info' = 'info',
  durationMs = 3000,
): void {
  // Close any existing toast
  if (toastWindow && !toastWindow.isDestroyed()) {
    toastWindow.destroy();
  }
  if (hideTimer) {
    clearTimeout(hideTimer);
  }

  const display = screen.getPrimaryDisplay();
  const { width: screenW } = display.workAreaSize;

  const toastW = 320;
  const toastH = 72;
  const margin = 16;

  toastWindow = new BrowserWindow({
    width: toastW,
    height: toastH,
    x: screenW - toastW - margin,
    y: margin,
    frame: false,
    resizable: false,
    movable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: false,
    transparent: true,
    hasShadow: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const accentColor =
    type === 'success' ? '#34c759' : type === 'error' ? '#ff3b30' : '#0071e3';

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif;
    background: transparent;
    -webkit-app-region: no-drag;
    overflow: hidden;
  }
  .toast {
    background: rgba(40, 40, 40, 0.92);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 12px;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    border: 1px solid rgba(255,255,255,0.08);
    animation: slideIn 0.3s ease-out;
    height: 64px;
  }
  .icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: ${accentColor};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 16px;
    color: white;
    font-weight: 700;
  }
  .content {
    flex: 1;
    min-width: 0;
  }
  .title {
    font-size: 13px;
    font-weight: 600;
    color: #fff;
    line-height: 1.3;
  }
  .body {
    font-size: 12px;
    color: rgba(255,255,255,0.7);
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
</style>
</head>
<body>
  <div class="toast">
    <div class="icon">F✓</div>
    <div class="content">
      <div class="title">${title.replace(/</g, '&lt;')}</div>
      <div class="body">${body.replace(/</g, '&lt;')}</div>
    </div>
  </div>
</body>
</html>`;

  toastWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

  toastWindow.once('ready-to-show', () => {
    if (toastWindow && !toastWindow.isDestroyed()) {
      toastWindow.showInactive();
    }
  });

  hideTimer = setTimeout(() => {
    if (toastWindow && !toastWindow.isDestroyed()) {
      toastWindow.destroy();
      toastWindow = null;
    }
  }, durationMs);
}
