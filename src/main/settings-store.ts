import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

export type ToneProfile = 'friendly' | 'normal' | 'professional';
export type OperationMode = 'grammar' | 'rewrite' | 'shorten' | 'expand' | 'email-reply' | 'translate' | 'auto';
export type TranslationDirection = 'vi-en' | 'en-vi';

export const TONE_PROMPTS: Record<ToneProfile, string> = {
  friendly:
    'You are a friendly grammar correction assistant. Correct the grammar of the following text while keeping a warm, casual, and approachable tone. Return ONLY the corrected text with no explanations, no quotes, no extra formatting.',
  normal:
    'You are a grammar correction assistant. Correct the grammar of the following text. Return ONLY the corrected text with no explanations, no quotes, no extra formatting.',
  professional:
    'You are a professional grammar correction assistant. Correct the grammar of the following text using formal, polished, and business-appropriate language. Return ONLY the corrected text with no explanations, no quotes, no extra formatting.',
};

export const MODE_PROMPTS: Record<OperationMode, string | ((dir: TranslationDirection) => string)> = {
  grammar:
    'Correct the grammar of the following text. Return ONLY the corrected text with no explanations, no quotes, no extra formatting.',
  rewrite:
    'Rephrase the following text for better clarity and readability while preserving the original meaning. Return ONLY the rewritten text with no explanations, no quotes, no extra formatting.',
  shorten:
    'Condense the following text to be more concise while preserving the key meaning. Return ONLY the shortened text with no explanations, no quotes, no extra formatting.',
  expand:
    'Elaborate on the following text with more detail, examples, or context while preserving the original meaning. Return ONLY the expanded text with no explanations, no quotes, no extra formatting.',
  'email-reply':
    'Draft a professional email reply to the following message. The reply should be polite, clear, and appropriate for a business context. Return ONLY the reply text with no explanations, no quotes, no extra formatting.',
  translate: (dir: TranslationDirection) => {
    if (dir === 'vi-en') {
      return 'Translate the following Vietnamese text to English. Return ONLY the translated text with no explanations, no quotes, no extra formatting.';
    }
    return 'Translate the following English text to Vietnamese. Return ONLY the translated text with no explanations, no quotes, no extra formatting.';
  },
  auto:
    'Detect the language of the following text. If it is Vietnamese, translate it to English. If it is English, correct its grammar. Return ONLY the result with no explanations, no quotes, no extra formatting. On the very first line, output exactly one label: [Translated] or [Grammar Fixed], then the result on the next line.',
};

export interface ShortcutBindings {
  togglePopup: string;
  clipboardCorrect: string;
  clipboardTranslate: string;
}

export interface Settings {
  aiProvider: 'openai' | 'gemini';
  openaiApiKey: string;
  geminiApiKey: string;
  toneProfile: ToneProfile;
  activeMode: OperationMode;
  translationDirection: TranslationDirection;
  shortcuts: ShortcutBindings;
}

const DEFAULTS: Settings = {
  aiProvider: 'openai',
  openaiApiKey: '',
  geminiApiKey: '',
  toneProfile: 'normal',
  activeMode: 'grammar',
  translationDirection: 'vi-en',
  shortcuts: {
    togglePopup: 'CommandOrControl+Shift+G',
    clipboardCorrect: 'CommandOrControl+Shift+F',
    clipboardTranslate: 'CommandOrControl+Shift+T',
  },
};

const settingsPath = path.join(app.getPath('userData'), 'settings.json');

export function loadSettings(): Settings {
  try {
    const data = fs.readFileSync(settingsPath, 'utf-8');
    return { ...DEFAULTS, ...JSON.parse(data) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(settings: Settings): void {
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
}

/**
 * Build the final system prompt for a given mode + tone combination.
 */
export function buildSystemPrompt(
  mode: OperationMode,
  tone: ToneProfile,
  translationDirection: TranslationDirection,
): string {
  const modePrompt = MODE_PROMPTS[mode];
  const modeText = typeof modePrompt === 'function' ? modePrompt(translationDirection) : modePrompt;

  // For grammar mode, use the full tone-specific prompt
  if (mode === 'grammar') {
    return TONE_PROMPTS[tone];
  }

  // For other modes, prepend the tone context
  const tonePrefix =
    tone === 'friendly'
      ? 'Use a warm, casual, and approachable tone. '
      : tone === 'professional'
        ? 'Use formal, polished, and business-appropriate language. '
        : '';

  return tonePrefix + modeText;
}
