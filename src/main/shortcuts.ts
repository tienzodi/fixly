import { globalShortcut } from 'electron';
import { ShortcutBindings } from './settings-store';

let currentCallbacks: {
  onPopupTrigger: () => void;
  onClipboardCorrect: () => void;
  onClipboardTranslate: () => void;
  onSelectAndCorrect: () => void;
} | null = null;

export function registerShortcuts(
  onPopupTrigger: () => void,
  onClipboardCorrect: () => void,
  onClipboardTranslate: () => void,
  onSelectAndCorrect: () => void,
  bindings: ShortcutBindings,
): void {
  currentCallbacks = { onPopupTrigger, onClipboardCorrect, onClipboardTranslate, onSelectAndCorrect };
  applyBindings(bindings);
}

export function reRegisterShortcuts(bindings: ShortcutBindings): void {
  if (!currentCallbacks) return;
  globalShortcut.unregisterAll();
  applyBindings(bindings);
}

// globalShortcut.register() returns false when the accelerator is already taken
// by another app; it does not throw. Check the result, not just exceptions.
function registerOne(name: string, accelerator: string, callback: () => void): void {
  let ok = false;
  try {
    ok = globalShortcut.register(accelerator, () => {
      console.log(`[Fixly] shortcut fired: ${name} (${accelerator})`);
      callback();
    });
  } catch (e) {
    console.error(`[Fixly] register threw for ${name} "${accelerator}":`, e);
    return;
  }

  if (ok) {
    console.log(`[Fixly] registered ${name}: ${accelerator}`);
  } else {
    console.error(
      `[Fixly] FAILED to register ${name}: "${accelerator}" is already taken by another app`,
    );
  }
}

function applyBindings(bindings: ShortcutBindings): void {
  if (!currentCallbacks) return;
  console.log('[Fixly] applying shortcut bindings:', bindings);
  registerOne('togglePopup', bindings.togglePopup, currentCallbacks.onPopupTrigger);
  registerOne('clipboardCorrect', bindings.clipboardCorrect, currentCallbacks.onClipboardCorrect);
  registerOne('clipboardTranslate', bindings.clipboardTranslate, currentCallbacks.onClipboardTranslate);
  registerOne('selectAndCorrect', bindings.selectAndCorrect, currentCallbacks.onSelectAndCorrect);
}

export function unregisterAll(): void {
  globalShortcut.unregisterAll();
}
