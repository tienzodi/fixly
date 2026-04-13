import { clipboard, systemPreferences, shell } from 'electron';
import { exec } from 'child_process';
import { processText } from './ai';
import { loadSettings } from './settings-store';
import { showToast } from './toast';

let isProcessing = false;

function checkAccessibility(): boolean {
  if (process.platform !== 'darwin') return true;
  const trusted = systemPreferences.isTrustedAccessibilityClient(false);
  console.log('[Fixly] Accessibility trusted:', trusted);
  if (!trusted) {
    shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility');
    showToast('Fixly', 'Grant Accessibility access in System Settings, then retry.', 'error', 8000);
  }
  return trusted;
}

function simulateKey(key: 'copy' | 'paste'): Promise<void> {
  return new Promise((resolve, reject) => {
    const isMac = process.platform === 'darwin';
    const isWin = process.platform === 'win32';
    // macOS key codes: c=8, v=9
    const keyCode = key === 'copy' ? 8 : 9;
    const letter = key === 'copy' ? 'c' : 'v';

    let cmd: string;
    if (isMac) {
      // Use CGEvent via JXA — only needs Accessibility, not Automation permission
      cmd = `osascript -l JavaScript -e '
        ObjC.import("CoreGraphics");
        var src = $.CGEventSourceCreate($.kCGEventSourceStateCombinedSessionState);
        var down = $.CGEventCreateKeyboardEvent(src, ${keyCode}, true);
        var up = $.CGEventCreateKeyboardEvent(src, ${keyCode}, false);
        $.CGEventSetFlags(down, $.kCGEventFlagMaskCommand);
        $.CGEventPost($.kCGAnnotatedSessionEventTap, down);
        $.CGEventPost($.kCGAnnotatedSessionEventTap, up);
      '`;
    } else if (isWin) {
      cmd = `powershell -command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('^${letter}')"`;
    } else {
      cmd = `xdotool key ctrl+${letter}`;
    }

    exec(cmd, (error, _stdout, stderr) => {
      if (error) {
        console.error(`simulateKey(${key}) failed:`, error.message, stderr);
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function handleSelectAndCorrect(): Promise<void> {
  if (isProcessing) return;
  isProcessing = true;

  if (!checkAccessibility()) {
    isProcessing = false;
    return;
  }

  const originalClipboard = clipboard.readText();

  try {
    clipboard.writeText('');
    console.log('[Fixly] Clipboard cleared, simulating copy...');

    await simulateKey('copy');
    console.log('[Fixly] Copy simulated, waiting...');

    await delay(500);

    const selectedText = clipboard.readText();
    console.log('[Fixly] Clipboard after copy:', JSON.stringify(selectedText.substring(0, 100)));

    if (!selectedText || selectedText.trim().length === 0) {
      showToast('Fixly', 'No text selected.', 'info');
      clipboard.writeText(originalClipboard);
      return;
    }

    const settings = loadSettings();
    showToast('Fixly', 'Correcting selected text...', 'info', 10000);

    const corrected = await processText(selectedText, settings, {
      mode: settings.activeMode,
      translationDirection: settings.translationDirection,
    });

    clipboard.writeText(corrected);
    await simulateKey('paste');

    await delay(200);
    clipboard.writeText(corrected);

    showToast('Fixly', 'Text corrected in place!', 'success');
  } catch (error) {
    clipboard.writeText(originalClipboard);
    showToast('Fixly Error', error instanceof Error ? error.message : 'Unknown error', 'error');
  } finally {
    isProcessing = false;
  }
}
