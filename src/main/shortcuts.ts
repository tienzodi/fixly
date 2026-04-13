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

function applyBindings(bindings: ShortcutBindings): void {
  if (!currentCallbacks) return;
  try {
    globalShortcut.register(bindings.togglePopup, currentCallbacks.onPopupTrigger);
  } catch (e) {
    console.error(`Failed to register popup shortcut "${bindings.togglePopup}":`, e);
  }
  try {
    globalShortcut.register(bindings.clipboardCorrect, currentCallbacks.onClipboardCorrect);
  } catch (e) {
    console.error(`Failed to register clipboard correct shortcut "${bindings.clipboardCorrect}":`, e);
  }
  try {
    globalShortcut.register(bindings.clipboardTranslate, currentCallbacks.onClipboardTranslate);
  } catch (e) {
    console.error(`Failed to register clipboard translate shortcut "${bindings.clipboardTranslate}":`, e);
  }
  try {
    globalShortcut.register(bindings.selectAndCorrect, currentCallbacks.onSelectAndCorrect);
  } catch (e) {
    console.error(`Failed to register select-and-correct shortcut "${bindings.selectAndCorrect}":`, e);
  }
}

export function unregisterAll(): void {
  globalShortcut.unregisterAll();
}
