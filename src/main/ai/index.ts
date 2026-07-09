import { correctWithOpenAI } from './openai';
import { correctWithGemini } from './gemini';
import { correctWithGLM } from './glm';
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

  const keys: Record<string, string> = {
    openai: settings.openaiApiKey,
    gemini: settings.geminiApiKey,
    glm: settings.glmApiKey,
  };
  console.log(
    `[Fixly] processText provider=${settings.aiProvider} mode=${mode} dir=${dir} ` +
      `key=${keys[settings.aiProvider] ? 'set' : 'MISSING'} input=${text.length} chars`,
  );

  if (settings.aiProvider === 'gemini') {
    return correctWithGemini(text, settings.geminiApiKey, prompt);
  }
  if (settings.aiProvider === 'glm') {
    return correctWithGLM(text, settings.glmApiKey, prompt);
  }
  if (settings.aiProvider !== 'openai') {
    console.warn(`[Fixly] unknown provider "${settings.aiProvider}", falling back to OpenAI`);
  }
  return correctWithOpenAI(text, settings.openaiApiKey, prompt);
}

/**
 * Backward-compatible alias for existing callers.
 */
export async function correctGrammar(text: string, settings: Settings): Promise<string> {
  return processText(text, settings, { mode: 'grammar' });
}
