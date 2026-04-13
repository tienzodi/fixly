import { app, Tray, Menu, nativeImage, MenuItemConstructorOptions } from 'electron';
import * as path from 'path';
import {
  Settings,
  OperationMode,
  ToneProfile,
  TranslationDirection,
  loadSettings,
  saveSettings,
} from './settings-store';

type OnSettingsChanged = (settings: Settings) => void;

let trayInstance: Tray | null = null;

const MODE_LABELS: Record<OperationMode, string> = {
  grammar: 'Grammar Fix',
  rewrite: 'Rewrite',
  shorten: 'Shorten',
  expand: 'Expand',
  'email-reply': 'Email Reply',
  translate: 'Translate',
  auto: 'Auto Detect',
};

const TONE_LABELS: Record<ToneProfile, string> = {
  friendly: '🤗 Friendly',
  normal: '✏️ Normal',
  professional: '💼 Professional',
};

function buildMenu(
  settings: Settings,
  onShowSettings: () => void,
  onQuit: () => void,
  onChanged: OnSettingsChanged,
): Menu {
  const modeItems: MenuItemConstructorOptions[] = (
    Object.keys(MODE_LABELS) as OperationMode[]
  ).map((mode) => ({
    label: MODE_LABELS[mode],
    type: 'radio' as const,
    checked: settings.activeMode === mode,
    click: () => {
      settings.activeMode = mode;
      saveSettings(settings);
      onChanged(settings);
      rebuildMenu(settings, onShowSettings, onQuit, onChanged);
    },
  }));

  const toneItems: MenuItemConstructorOptions[] = (
    Object.keys(TONE_LABELS) as ToneProfile[]
  ).map((tone) => ({
    label: TONE_LABELS[tone],
    type: 'radio' as const,
    checked: settings.toneProfile === tone,
    click: () => {
      settings.toneProfile = tone;
      saveSettings(settings);
      onChanged(settings);
      rebuildMenu(settings, onShowSettings, onQuit, onChanged);
    },
  }));

  const providerItems: MenuItemConstructorOptions[] = [
    {
      label: 'OpenAI',
      type: 'radio' as const,
      checked: settings.aiProvider === 'openai',
      click: () => {
        settings.aiProvider = 'openai';
        saveSettings(settings);
        onChanged(settings);
        rebuildMenu(settings, onShowSettings, onQuit, onChanged);
      },
    },
    {
      label: 'Gemini',
      type: 'radio' as const,
      checked: settings.aiProvider === 'gemini',
      click: () => {
        settings.aiProvider = 'gemini';
        saveSettings(settings);
        onChanged(settings);
        rebuildMenu(settings, onShowSettings, onQuit, onChanged);
      },
    },
  ];

  const dirItems: MenuItemConstructorOptions[] = [
    {
      label: '🇻🇳 → 🇬🇧 Vietnamese to English',
      type: 'radio' as const,
      checked: settings.translationDirection === 'vi-en',
      click: () => {
        settings.translationDirection = 'vi-en';
        saveSettings(settings);
        onChanged(settings);
        rebuildMenu(settings, onShowSettings, onQuit, onChanged);
      },
    },
    {
      label: '🇬🇧 → 🇻🇳 English to Vietnamese',
      type: 'radio' as const,
      checked: settings.translationDirection === 'en-vi',
      click: () => {
        settings.translationDirection = 'en-vi';
        saveSettings(settings);
        onChanged(settings);
        rebuildMenu(settings, onShowSettings, onQuit, onChanged);
      },
    },
  ];

  const shortcutInfo = settings.shortcuts;

  return Menu.buildFromTemplate([
    { label: 'Fixly', enabled: false },
    { type: 'separator' },
    { label: 'Mode', enabled: false },
    ...modeItems,
    { type: 'separator' },
    { label: 'Tone', enabled: false },
    ...toneItems,
    { type: 'separator' },
    { label: 'Provider', enabled: false },
    ...providerItems,
    { type: 'separator' },
    { label: 'Translation', enabled: false },
    ...dirItems,
    { type: 'separator' },
    {
      label: `${formatShortcut(shortcutInfo.togglePopup)}  Open Popup`,
      enabled: false,
    },
    {
      label: `${formatShortcut(shortcutInfo.clipboardCorrect)}  Fix Clipboard`,
      enabled: false,
    },
    {
      label: `${formatShortcut(shortcutInfo.clipboardTranslate)}  Translate Clipboard`,
      enabled: false,
    },
    { type: 'separator' },
    {
      label: 'Launch at Login',
      type: 'checkbox',
      checked: settings.launchAtLogin,
      click: (menuItem) => {
        settings.launchAtLogin = menuItem.checked;
        saveSettings(settings);
        onChanged(settings);
      },
    },
    { label: 'Settings...', click: onShowSettings },
    { type: 'separator' },
    { label: 'Quit', click: onQuit },
  ]);
}

function formatShortcut(accelerator: string): string {
  if (process.platform === 'darwin') {
    return accelerator
      .replace('CommandOrControl', '⌘')
      .replace('Shift', '⇧')
      .replace(/\+/g, '');
  }
  return accelerator
    .replace('CommandOrControl', 'Ctrl');
}

function rebuildMenu(
  settings: Settings,
  onShowSettings: () => void,
  onQuit: () => void,
  onChanged: OnSettingsChanged,
): void {
  if (!trayInstance) return;
  trayInstance.setContextMenu(
    buildMenu(settings, onShowSettings, onQuit, onChanged),
  );
}

export function createTray(
  onShowSettings: () => void,
  onQuit: () => void,
  onChanged: OnSettingsChanged,
): Tray {
  let iconPath: string;
  const isWin = process.platform === 'win32';
  const iconFile = isWin ? 'tray.ico' : 'trayIconTemplate.png';

  if (app.isPackaged) {
    // In packaged app, assets are copied into the Resources directory
    iconPath = path.join(process.resourcesPath, 'assets', iconFile);
  } else {
    // In dev mode, relative to .vite/build/
    iconPath = path.join(__dirname, '../../assets', iconFile);
  }
  const icon = nativeImage.createFromPath(iconPath);
  if (!isWin) {
    icon.setTemplateImage(true);
  }

  trayInstance = new Tray(icon);
  trayInstance.setToolTip('Fixly');

  const settings = loadSettings();
  trayInstance.setContextMenu(
    buildMenu(settings, onShowSettings, onQuit, onChanged),
  );

  return trayInstance;
}
