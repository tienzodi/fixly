import { clipboard } from 'electron';
import { processText } from './ai';
import { loadSettings, OperationMode } from './settings-store';
import { showToast } from './toast';

let isProcessing = false;

async function handleClipboardWithMode(mode: OperationMode): Promise<void> {
  if (isProcessing) return;
  isProcessing = true;

  try {
    const text = clipboard.readText();

    if (!text || text.trim().length === 0) {
      showToast('Fixly', 'Clipboard is empty.', 'info');
      return;
    }

    const settings = loadSettings();
    showToast('Fixly', mode === 'translate' ? 'Translating...' : 'Checking grammar...', 'info', 10000);
    const corrected = await processText(text, settings, { mode });
    clipboard.writeText(corrected);
    showToast('Fixly', mode === 'translate' ? 'Clipboard text translated!' : 'Clipboard text corrected!', 'success');
  } catch (error) {
    showToast('Fixly Error', error instanceof Error ? error.message : 'Unknown error', 'error');
  } finally {
    isProcessing = false;
  }
}

export async function handleClipboardCorrect(): Promise<void> {
  return handleClipboardWithMode('grammar');
}

export async function handleClipboardTranslate(): Promise<void> {
  return handleClipboardWithMode('translate');
}
