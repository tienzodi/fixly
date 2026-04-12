const providerRadios = document.querySelectorAll<HTMLInputElement>('input[name="provider"]');
const openaiKeyInput = document.getElementById('openai-key') as HTMLInputElement;
const geminiKeyInput = document.getElementById('gemini-key') as HTMLInputElement;
const toneProfileSelect = document.getElementById('tone-profile') as HTMLSelectElement;
const translationDirSelect = document.getElementById('translation-dir') as HTMLSelectElement;
const shortcutPopupInput = document.getElementById('shortcut-popup') as HTMLInputElement;
const shortcutCorrectInput = document.getElementById('shortcut-correct') as HTMLInputElement;
const shortcutTranslateInput = document.getElementById('shortcut-translate') as HTMLInputElement;
const launchLoginCheckbox = document.getElementById('launch-login') as HTMLInputElement;
const saveBtn = document.getElementById('save-btn') as HTMLButtonElement;
const status = document.getElementById('status')!;

// ── Shortcut key recorder ──
const KEY_MAP: Record<string, string> = {
  Control: 'Ctrl',
  Meta: 'Cmd',
  Alt: 'Alt',
  Shift: 'Shift',
};

function keyEventToAccelerator(e: KeyboardEvent): string | null {
  const parts: string[] = [];

  if (e.metaKey || e.ctrlKey) parts.push('CommandOrControl');
  if (e.altKey) parts.push('Alt');
  if (e.shiftKey) parts.push('Shift');

  // Ignore if only modifiers are pressed
  const key = e.key;
  if (['Control', 'Meta', 'Alt', 'Shift'].includes(key)) return null;

  // Map special keys
  const mappedKey = key.length === 1 ? key.toUpperCase() : key;
  parts.push(mappedKey);

  return parts.join('+');
}

function keyEventToDisplay(e: KeyboardEvent): string | null {
  const parts: string[] = [];

  if (e.metaKey) parts.push('⌘');
  if (e.ctrlKey) parts.push('⌃');
  if (e.altKey) parts.push('⌥');
  if (e.shiftKey) parts.push('⇧');

  const key = e.key;
  if (['Control', 'Meta', 'Alt', 'Shift'].includes(key)) return null;

  parts.push(key.length === 1 ? key.toUpperCase() : key);
  return parts.join('');
}

function acceleratorToDisplay(acc: string): string {
  return acc
    .replace('CommandOrControl', '⌘')
    .replace('Shift', '⇧')
    .replace('Alt', '⌥')
    .replace(/\+/g, '');
}

// Map each shortcut input to its accelerator value
const shortcutAccelerators: Record<string, string> = {
  'shortcut-popup': '',
  'shortcut-correct': '',
  'shortcut-translate': '',
};

function setupShortcutInput(input: HTMLInputElement, id: string) {
  input.addEventListener('focus', () => {
    input.classList.add('recording');
    input.value = 'Press keys...';
  });

  input.addEventListener('blur', () => {
    input.classList.remove('recording');
    // Restore display value
    if (shortcutAccelerators[id]) {
      input.value = acceleratorToDisplay(shortcutAccelerators[id]);
    } else {
      input.value = '';
    }
  });

  input.addEventListener('keydown', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const accelerator = keyEventToAccelerator(e);
    const display = keyEventToDisplay(e);
    if (accelerator && display) {
      shortcutAccelerators[id] = accelerator;
      input.value = display;
      input.classList.remove('recording');
      input.blur();
    }
  });
}

setupShortcutInput(shortcutPopupInput, 'shortcut-popup');
setupShortcutInput(shortcutCorrectInput, 'shortcut-correct');
setupShortcutInput(shortcutTranslateInput, 'shortcut-translate');

// ── Load settings ──
async function loadSettings() {
  const settings = await (window as any).api.getSettings();

  // Provider
  providerRadios.forEach((r) => {
    r.checked = r.value === settings.aiProvider;
  });

  // Keys
  openaiKeyInput.value = settings.openaiApiKey || '';
  geminiKeyInput.value = settings.geminiApiKey || '';

  // Tone & translation
  toneProfileSelect.value = settings.toneProfile || 'normal';
  translationDirSelect.value = settings.translationDirection || 'vi-en';

  // Shortcuts
  if (settings.shortcuts) {
    shortcutAccelerators['shortcut-popup'] = settings.shortcuts.togglePopup;
    shortcutAccelerators['shortcut-correct'] = settings.shortcuts.clipboardCorrect;
    shortcutAccelerators['shortcut-translate'] = settings.shortcuts.clipboardTranslate;

    shortcutPopupInput.value = acceleratorToDisplay(settings.shortcuts.togglePopup);
    shortcutCorrectInput.value = acceleratorToDisplay(settings.shortcuts.clipboardCorrect);
    shortcutTranslateInput.value = acceleratorToDisplay(settings.shortcuts.clipboardTranslate);
  }

  // Launch at login
  launchLoginCheckbox.checked = !!settings.launchAtLogin;
}

// ── Save settings ──
saveBtn.addEventListener('click', async () => {
  const provider = document.querySelector<HTMLInputElement>('input[name="provider"]:checked')?.value || 'openai';

  const settings = {
    aiProvider: provider,
    openaiApiKey: openaiKeyInput.value.trim(),
    geminiApiKey: geminiKeyInput.value.trim(),
    toneProfile: toneProfileSelect.value,
    translationDirection: translationDirSelect.value,
    shortcuts: {
      togglePopup: shortcutAccelerators['shortcut-popup'],
      clipboardCorrect: shortcutAccelerators['shortcut-correct'],
      clipboardTranslate: shortcutAccelerators['shortcut-translate'],
    },
    launchAtLogin: launchLoginCheckbox.checked,
  };

  await (window as any).api.saveSettings(settings);
  status.textContent = 'Settings saved!';
  status.classList.remove('hidden');
  setTimeout(() => status.classList.add('hidden'), 2000);
});

loadSettings();
