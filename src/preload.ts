import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  // Legacy alias
  correctGrammar: (text: string): Promise<string> =>
    ipcRenderer.invoke('process-text', text, {}),

  // New mode-aware API
  processText: (text: string, options: Record<string, string>): Promise<string> =>
    ipcRenderer.invoke('process-text', text, options),

  getSettings: (): Promise<unknown> =>
    ipcRenderer.invoke('get-settings'),

  saveSettings: (settings: unknown): Promise<void> =>
    ipcRenderer.invoke('save-settings', settings),
});
