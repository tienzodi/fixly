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
    // Open Accessibility settings pane directly
    shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility');
  }
  return trusted;
}

function simulateKey(key: 'copy' | 'paste'): Promise<void> {
  return new Promise((resolve, reject) => {
    const isMac = process.platform === 'darwin';
    const isWin = process.platform === 'win32';
    const letter = key === 'copy' ? 'c' : 'v';

    let cmd: string;
    if (isMac) {
      cmd = `osascript -e 'tell application "System Events" to keystroke "${letter}" using command down'`;
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

  // Check accessibility permissions on macOS
  if (!checkAccessibility()) {
    showToast(
      'Fixly',
      'Grant Accessibility access in System Settings > Privacy & Security > Accessibility, then retry.',
      'error',
      8000,
    );
    isProcessing = false;
    return;
  }

  const originalClipboard = clipboard.readText();

  try {
    // Clear clipboard so we can detect the new copy
    clipboard.writeText('');
    console.log('[Fixly] Clipboard cleared, simulating copy...');

    // Simulate Cmd+C / Ctrl+C to copy selected text
    await simulateKey('copy');
    console.log('[Fixly] Copy simulated, waiting...');

    // Wait for the clipboard to be populated
    await delay(500);

    const selectedText = clipboard.readText();
    console.log('[Fixly] Clipboard after copy:', JSON.stringify(selectedText));

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

    // Write corrected text to clipboard and paste it back
    clipboard.writeText(corrected);
    await simulateKey('paste');

    await delay(200);
    clipboard.writeText(corrected);

    showToast('Fixly', 'Text corrected in place!', 'success');
  } catch (error) {
    clipboard.writeText(originalClipboard);
    showToast(
      'Fixly Error',
      error instanceof Error ? error.message : 'Unknown error',
      'error',
    );
  } finally {
    isProcessing = false;
  }
}
