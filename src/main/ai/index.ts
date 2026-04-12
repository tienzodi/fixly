import { correctWithOpenAI } from './openai';
import { correctWithGemini } from './gemini';
import {
  Settings,
  OperationMode,
  TranslationDirection,
  buildSystemPrompt,
} from '../settings-store';

export interface ProcessTextOptions {
  mode?: OperationMode;
  translationDirection?: TranslationDirection;
}

/**
 * Process text using the configured AI provider.
 * Supports all operation modes: grammar, rewrite, shorten, expand, email-reply, translate, auto.
 */
export async function processText(
  text: string,
  settings: Settings,
  options?: ProcessTextOptions,
): Promise<string> {
  const mode = options?.mode || settings.activeMode;
  const dir = options?.translationDirection || settings.translationDirection;
  const prompt = buildSystemPrompt(mode, settings.toneProfile, dir);

  if (settings.aiProvider === 'gemini') {
    return correctWithGemini(text, settings.geminiApiKey, prompt);
  }
  return correctWithOpenAI(text, settings.openaiApiKey, prompt);
}

/**
 * Backward-compatible alias for existing callers.
 */
export async function correctGrammar(text: string, settings: Settings): Promise<string> {
  return processText(text, settings, { mode: 'grammar' });
}
