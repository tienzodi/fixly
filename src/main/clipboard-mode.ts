import { clipboard } from 'electron';
import { processText } from './ai';
import { loadSettings, OperationMode } from './settings-store';
import { showToast } from './toast';

let isProcessing = false;

async function handleClipboardWithMode(mode: OperationMode): Promise<void> {
  console.log(`[Fixly] clipboard handler start, mode=${mode}`);

  if (isProcessing) {
    console.warn('[Fixly] BUSY: previous run still in flight, ignoring this trigger');
    return;
  }
  isProcessing = true;

  try {
    const text = clipboard.readText();
    console.log(`[Fixly] clipboard read: ${text.length} chars`, JSON.stringify(text.slice(0, 80)));

    if (!text || text.trim().length === 0) {
      console.warn('[Fixly] clipboard empty, aborting');
      showToast('Fixly', 'Clipboard is empty.', 'info');
      return;
    }

    const settings = loadSettings();
    console.log(`[Fixly] provider=${settings.aiProvider} tone=${settings.toneProfile}`);

    showToast('Fixly', mode === 'translate' ? 'Translating...' : 'Checking grammar...', 'info', 10000);

    const t0 = Date.now();
    const corrected = await processText(text, settings, { mode });
    console.log(`[Fixly] AI replied in ${Date.now() - t0}ms:`, JSON.stringify(corrected.slice(0, 80)));

    clipboard.writeText(corrected);

    const readBack = clipboard.readText();
    console.log('[Fixly] clipboard write-back verified:', readBack === corrected);
    if (readBack !== corrected) {
      console.error('[Fixly] WRITE DID NOT STICK. clipboard now:', JSON.stringify(readBack.slice(0, 80)));
    }

    showToast('Fixly', mode === 'translate' ? 'Clipboard text translated!' : 'Clipboard text corrected!', 'success');
  } catch (error) {
    console.error('[Fixly] clipboard handler FAILED:', error);
    showToast('Fixly Error', error instanceof Error ? error.message : 'Unknown error', 'error');
  } finally {
    isProcessing = false;
    console.log('[Fixly] clipboard handler done');
  }
}

export async function handleClipboardCorrect(): Promise<void> {
  return handleClipboardWithMode('grammar');
}

export async function handleClipboardTranslate(): Promise<void> {
  return handleClipboardWithMode('translate');
}
