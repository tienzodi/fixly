import { clipboard, Notification } from 'electron';
import { processText } from './ai';
import { loadSettings, OperationMode } from './settings-store';

let isProcessing = false;

async function handleClipboardWithMode(mode: OperationMode): Promise<void> {
  if (isProcessing) return;
  isProcessing = true;

  try {
    const text = clipboard.readText();

    if (!text || text.trim().length === 0) {
      new Notification({ title: 'Fixly', body: 'Clipboard is empty.' }).show();
      return;
    }

    const settings = loadSettings();
    const corrected = await processText(text, settings, { mode });
    clipboard.writeText(corrected);
    new Notification({
      title: 'Fixly',
      body: mode === 'translate' ? 'Clipboard text translated!' : 'Clipboard text corrected!',
    }).show();
  } catch (error) {
    new Notification({
      title: 'Fixly Error',
      body: error instanceof Error ? error.message : 'Unknown error',
    }).show();
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
