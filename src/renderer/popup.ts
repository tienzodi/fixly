const input = document.getElementById('input') as HTMLTextAreaElement;
const fixBtn = document.getElementById('fix-btn') as HTMLButtonElement;
const resultContainer = document.getElementById('result-container')!;
const result = document.getElementById('result')!;
const copyBtn = document.getElementById('copy-btn')!;
const loading = document.getElementById('loading')!;
const errorDiv = document.getElementById('error')!;
const diffToggle = document.getElementById('diff-toggle') as HTMLButtonElement;
const translateBar = document.getElementById('translate-bar')!;
const dirToggle = document.getElementById('dir-toggle') as HTMLButtonElement;
const modePills = document.querySelectorAll<HTMLButtonElement>('.mode-pill');

// ── Preload bridge check ──
// window.api is exposed by src/preload.ts. If it is missing, the preload script
// did not attach and every call below fails with "reading 'processText' of undefined".
const api = (window as any).api;
console.log('[Fixly][popup] window.api =', api ? Object.keys(api) : 'UNDEFINED — preload did not load');
if (!api) {
  console.error(
    '[Fixly][popup] Preload bridge missing. Usually a stale dev instance or a ' +
      'renderer served by a different Vite server than the running main process.',
  );
}

// ── State ──
let currentMode = 'grammar';
let translationDir = 'vi-en';
let originalText = '';
let correctedText = '';
let showDiff = false;

// ── Mode selector ──
const MODE_LABELS: Record<string, string> = {
  grammar: 'Fix Grammar',
  rewrite: 'Rewrite',
  shorten: 'Shorten',
  expand: 'Expand',
  'email-reply': 'Generate Reply',
  translate: 'Translate',
  auto: 'Process',
};

modePills.forEach((pill) => {
  pill.addEventListener('click', () => {
    modePills.forEach((p) => p.classList.remove('active'));
    pill.classList.add('active');
    currentMode = pill.dataset.mode || 'grammar';
    fixBtn.textContent = MODE_LABELS[currentMode] || 'Process';

    // Show/hide translation direction bar
    if (currentMode === 'translate') {
      translateBar.classList.remove('hidden');
    } else {
      translateBar.classList.add('hidden');
    }
  });
});

// ── Translation direction toggle ──
dirToggle.addEventListener('click', () => {
  if (translationDir === 'vi-en') {
    translationDir = 'en-vi';
    dirToggle.textContent = '🇬🇧 → 🇻🇳';
    dirToggle.dataset.dir = 'en-vi';
  } else {
    translationDir = 'vi-en';
    dirToggle.textContent = '🇻🇳 → 🇬🇧';
    dirToggle.dataset.dir = 'vi-en';
  }
});

// ── Diff algorithm (word-level LCS) ──
function computeWordDiff(original: string, corrected: string): string {
  const oldWords = original.split(/(\s+)/);
  const newWords = corrected.split(/(\s+)/);

  // LCS table
  const m = oldWords.length;
  const n = newWords.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldWords[i - 1] === newWords[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to build diff
  const parts: string[] = [];
  let i = m, j = n;

  const stack: string[] = [];
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldWords[i - 1] === newWords[j - 1]) {
      stack.push(escapeHtml(oldWords[i - 1]));
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      stack.push(`<span class="diff-ins">${escapeHtml(newWords[j - 1])}</span>`);
      j--;
    } else {
      stack.push(`<span class="diff-del">${escapeHtml(oldWords[i - 1])}</span>`);
      i--;
    }
  }

  stack.reverse();
  return stack.join('');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ── Render result ──
function renderResult() {
  if (showDiff && currentMode !== 'translate' && currentMode !== 'auto') {
    result.innerHTML = computeWordDiff(originalText, correctedText);
  } else {
    result.textContent = correctedText;
  }
}

// ── Diff toggle ──
diffToggle.addEventListener('click', () => {
  showDiff = !showDiff;
  diffToggle.classList.toggle('active', showDiff);
  renderResult();
});

// ── Fix / Process button ──
fixBtn.addEventListener('click', async () => {
  const text = input.value.trim();
  if (!text) return;

  originalText = text;
  fixBtn.disabled = true;
  loading.classList.remove('hidden');
  resultContainer.classList.add('hidden');
  errorDiv.classList.add('hidden');

  try {
    if (!api) {
      throw new Error('Preload bridge not loaded (window.api is undefined). Restart the app.');
    }
    console.log(`[Fixly][popup] processText mode=${currentMode} dir=${translationDir}`);
    const t0 = Date.now();
    correctedText = await api.processText(text, {
      mode: currentMode,
      translationDirection: translationDir,
    });
    console.log(`[Fixly][popup] got result in ${Date.now() - t0}ms`);
    renderResult();
    resultContainer.classList.remove('hidden');
  } catch (err: any) {
    console.error('[Fixly][popup] processText failed:', err);
    errorDiv.textContent = err.message || 'An error occurred';
    errorDiv.classList.remove('hidden');
  } finally {
    loading.classList.add('hidden');
    fixBtn.disabled = false;
  }
});

// ── Copy button ──
copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(correctedText);
  copyBtn.textContent = 'Copied!';
  setTimeout(() => {
    copyBtn.textContent = 'Copy to Clipboard';
  }, 1500);
});

// ── Cmd+Enter to submit ──
input.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    fixBtn.click();
  }
});

// ── Load initial settings ──
async function loadInitialState() {
  try {
    const settings = await (window as any).api.getSettings();
    currentMode = settings.activeMode || 'grammar';
    translationDir = settings.translationDirection || 'vi-en';

    // Update mode pill
    modePills.forEach((p) => {
      p.classList.toggle('active', p.dataset.mode === currentMode);
    });
    fixBtn.textContent = MODE_LABELS[currentMode] || 'Process';

    // Update translation bar
    if (currentMode === 'translate') {
      translateBar.classList.remove('hidden');
    }
    if (translationDir === 'en-vi') {
      dirToggle.textContent = '🇬🇧 → 🇻🇳';
      dirToggle.dataset.dir = 'en-vi';
    }
  } catch {
    // Settings load failed, use defaults
  }
}

loadInitialState();
