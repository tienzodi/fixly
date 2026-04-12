# ✏️ Fixly

> AI-powered grammar correction, translation & text rewriting — right from your menu bar.

A lightweight desktop app vibe by me that lives in your system tray and helps you write better English every day. Supports **OpenAI** and **Google Gemini** as AI backends.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Grammar Correction** | Fix grammar with a single shortcut — works on any text in your clipboard |
| **Translation** | Translate between Vietnamese ↔ English instantly |
| **Auto Detect** | Automatically detects language and corrects or translates accordingly |
| **Rewrite Modes** | Rewrite, Shorten, Expand, or draft an Email Reply |
| **Diff View** | See exactly what changed between your original and corrected text |
| **Tone Profiles** | Choose between Friendly, Normal, or Professional tone |
| **Menu Bar Quick-Switch** | Change mode, tone, provider, or translation direction from the tray menu |
| **Custom Shortcuts** | Configure your own keyboard shortcuts |

---

## 🚀 Quick Start

### Option 1: Download Pre-built App (Recommended)

1. Download the latest `.zip` from the **Releases** section (or ask the team for the file)
2. Unzip and move `Fixly.app` to your **Applications** folder
3. Open the app — it will appear as an icon in your **menu bar** (top-right of screen)
4. Right-click the tray icon → **Settings** → enter your API key

### Option 2: Build from Source

```bash
# Clone the repo
git clone <repo-url>
cd translate-tool

# Install dependencies
npm install

# Run in development mode
npm run start

# Build distributable
npm run make
# Output: out/make/zip/darwin/arm64/Fixly-darwin-arm64-1.0.0.zip
```

---

## ⚙️ Setup

### 1. Get an API Key

You need **one** of these (not both):

| Provider | How to get a key | Cost |
|---|---|---|
| **OpenAI** | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) | ~$0.15 per 1M tokens (gpt-4o-mini) |
| **Google Gemini** | [aistudio.google.com/apikey](https://aistudio.google.com/app/apikey) | Free tier available (gemini-2.0-flash) |

> 💡 **Recommended for the team:** Use Gemini — it has a generous free tier that's more than enough for daily use.

### 2. Configure the App

1. Right-click the **tray icon** in your menu bar
2. Click **Settings...**
3. Select your **AI Provider** (OpenAI or Gemini)
4. Paste your **API key**
5. Choose your preferred **Tone Profile**
6. Click **Save**

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `⌘ ⇧ G` | Open the popup window (type/paste text, select mode, see results) |
| `⌘ ⇧ F` | Fix grammar of text in your clipboard (copies corrected text back) |
| `⌘ ⇧ T` | Translate text in your clipboard (Vietnamese ↔ English) |

> All shortcuts are customizable in **Settings**.

---

## 📖 How to Use

### Method 1: Popup Window (`⌘⇧G`)

1. Press `⌘⇧G` to open the popup
2. Select a **mode** from the pill bar at the top:
   - **Grammar** — fix grammar only
   - **Rewrite** — rephrase for clarity
   - **Shorten** — make text more concise
   - **Expand** — add more detail
   - **Email Reply** — draft a professional reply
   - **Translate** — Vietnamese ↔ English (toggle direction with the 🇻🇳→🇬🇧 button)
   - **Auto** — detects language and acts accordingly
3. Type or paste your text
4. Click the action button (or press `⌘ Enter`)
5. Click **Copy to Clipboard** to use the result
6. Toggle **◑ Diff** to see what changed (available in Grammar/Rewrite modes)

### Method 2: Clipboard Shortcuts

This is the fastest way for everyday use:

1. **Copy** any text in any app (`⌘C`)
2. Press `⌘⇧F` to fix grammar — or `⌘⇧T` to translate
3. The corrected/translated text is now on your clipboard
4. **Paste** it wherever you need (`⌘V`)

### Method 3: Menu Bar Quick-Switch

Right-click the tray icon to quickly switch between:
- **Mode** — Grammar, Rewrite, Shorten, Expand, Email Reply, Translate, Auto
- **Tone** — Friendly, Normal, Professional
- **Provider** — OpenAI, Gemini
- **Translation Direction** — 🇻🇳→🇬🇧 or 🇬🇧→🇻🇳

---

## 🗂 Project Structure

```
translate-tool/
├── src/
│   ├── main/              # Electron main process
│   │   ├── index.ts       # App entry point, window management, IPC
│   │   ├── ai/            # AI provider integrations
│   │   │   ├── index.ts   # processText() router
│   │   │   ├── openai.ts  # OpenAI API (gpt-4o-mini)
│   │   │   └── gemini.ts  # Gemini API (gemini-2.0-flash)
│   │   ├── clipboard-mode.ts   # Clipboard shortcut handlers
│   │   ├── settings-store.ts   # Settings persistence & prompt builder
│   │   ├── shortcuts.ts        # Global keyboard shortcut registration
│   │   └── tray.ts             # Menu bar tray icon & quick-switch menu
│   ├── renderer/          # UI (popup & settings windows)
│   │   ├── popup.ts       # Popup logic, mode switching, diff algorithm
│   │   ├── popup.css      # Popup styles
│   │   ├── settings.ts    # Settings form, shortcut key recorder
│   │   └── settings.css   # Settings styles
│   └── preload.ts         # Secure IPC bridge
├── index.html             # Popup window HTML
├── settings.html          # Settings window HTML
├── assets/                # Tray icon assets
├── package.json
└── forge.config.ts        # Electron Forge build config
```

---

## 🛠 Development

```bash
# Start in dev mode (hot-reload)
npm run start

# Build production distributable
npm run make

# Lint
npm run lint
```

---

## ❓ Troubleshooting

| Problem | Solution |
|---|---|
| App doesn't appear | Look for the icon in your **menu bar** (top-right). The app has no dock icon by design. |
| "API key not set" error | Right-click tray icon → Settings → paste your API key → Save |
| Shortcut doesn't work | Another app may be using the same shortcut. Go to Settings and change it. |
| "Clipboard is empty" notification | Make sure you've copied text (`⌘C`) before pressing `⌘⇧F` or `⌘⇧T` |

---

## 👨‍💻 Author

Built with ❤️ by **Tien Pham** @ [Zodinet](https://zodinet.com)

---

## 📄 License

Free for internal use at Zodinet.
