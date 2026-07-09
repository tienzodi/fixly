"use strict";const a=require("electron"),R=require("path"),q=require("fs"),W=require("child_process");function L(e){const t=Object.create(null,{[Symbol.toStringTag]:{value:"Module"}});if(e){for(const o in e)if(o!=="default"){const r=Object.getOwnPropertyDescriptor(e,o);Object.defineProperty(t,o,r.get?r:{enumerable:!0,get:()=>e[o]})}}return t.default=e,Object.freeze(t)}const g=L(R),D=L(q);async function Y(e,t,o){if(!t)throw new Error("OpenAI API key not set. Open Settings to configure.");const r=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},body:JSON.stringify({model:"gpt-4o-mini",messages:[{role:"system",content:o},{role:"user",content:e}],temperature:.3})});if(!r.ok){const i=await r.text();throw new Error(`OpenAI error (${r.status}): ${i}`)}return(await r.json()).choices[0].message.content.trim()}async function z(e,t,o){if(!t)throw new Error("Gemini API key not set. Open Settings to configure.");const r=`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${t}`,n=await fetch(r,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({systemInstruction:{parts:[{text:o}]},contents:[{parts:[{text:e}]}]})});if(!n.ok){const d=await n.text();throw new Error(`Gemini error (${n.status}): ${d}`)}return(await n.json()).candidates[0].content.parts[0].text.trim()}async function U(e,t,o){if(!t)throw new Error("GLM API key not set. Open Settings to configure.");const r=await fetch("https://api.z.ai/api/paas/v4/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},body:JSON.stringify({model:"glm-5.2",messages:[{role:"system",content:o},{role:"user",content:e}],temperature:.3,thinking:{type:"disabled"}})});if(!r.ok){const i=await r.text();throw new Error(`GLM error (${r.status}): ${i}`)}return(await r.json()).choices[0].message.content.trim()}const B={friendly:"You are a friendly grammar correction assistant. Correct the grammar of the following text while keeping a warm, casual, and approachable tone. Return ONLY the corrected text with no explanations, no quotes, no extra formatting.",normal:"You are a grammar correction assistant. Correct the grammar of the following text. Return ONLY the corrected text with no explanations, no quotes, no extra formatting.",professional:"You are a professional grammar correction assistant. Correct the grammar of the following text using formal, polished, and business-appropriate language. Return ONLY the corrected text with no explanations, no quotes, no extra formatting."},K={grammar:"Correct the grammar of the following text. Return ONLY the corrected text with no explanations, no quotes, no extra formatting.",rewrite:"Rephrase the following text for better clarity and readability while preserving the original meaning. Return ONLY the rewritten text with no explanations, no quotes, no extra formatting.",shorten:"Condense the following text to be more concise while preserving the key meaning. Return ONLY the shortened text with no explanations, no quotes, no extra formatting.",expand:"Elaborate on the following text with more detail, examples, or context while preserving the original meaning. Return ONLY the expanded text with no explanations, no quotes, no extra formatting.","email-reply":"Draft a professional email reply to the following message. The reply should be polite, clear, and appropriate for a business context. Return ONLY the reply text with no explanations, no quotes, no extra formatting.",translate:e=>e==="vi-en"?"Translate the following Vietnamese text to English. Return ONLY the translated text with no explanations, no quotes, no extra formatting.":"Translate the following English text to Vietnamese. Return ONLY the translated text with no explanations, no quotes, no extra formatting.",auto:"Detect the language of the following text. If it is Vietnamese, translate it to English. If it is English, correct its grammar. Return ONLY the result with no explanations, no quotes, no extra formatting. On the very first line, output exactly one label: [Translated] or [Grammar Fixed], then the result on the next line."},C={aiProvider:"openai",openaiApiKey:"",geminiApiKey:"",glmApiKey:"",toneProfile:"normal",activeMode:"grammar",translationDirection:"vi-en",launchAtLogin:!1,shortcuts:{togglePopup:"CommandOrControl+Shift+G",clipboardCorrect:"CommandOrControl+Shift+F",clipboardTranslate:"CommandOrControl+Shift+T",selectAndCorrect:"CommandOrControl+Shift+;"}},M=g.join(a.app.getPath("userData"),"settings.json");function w(){try{const e=D.readFileSync(M,"utf-8"),t=JSON.parse(e);return{...C,...t,shortcuts:{...C.shortcuts,...t.shortcuts||{}}}}catch{return{...C}}}function u(e){D.writeFileSync(M,JSON.stringify(e,null,2))}function J(e,t,o){const r=K[e],n=typeof r=="function"?r(o):r;return e==="grammar"?B[t]:(t==="friendly"?"Use a warm, casual, and approachable tone. ":t==="professional"?"Use formal, polished, and business-appropriate language. ":"")+n}async function O(e,t,o){const r=(o==null?void 0:o.mode)||t.activeMode,n=(o==null?void 0:o.translationDirection)||t.translationDirection,i=J(r,t.toneProfile,n);return t.aiProvider==="gemini"?z(e,t.geminiApiKey,i):t.aiProvider==="glm"?U(e,t.glmApiKey,i):Y(e,t.openaiApiKey,i)}let l=null,P=null;function p(e,t,o="info",r=3e3){l&&!l.isDestroyed()&&l.destroy(),P&&clearTimeout(P);const n=a.screen.getPrimaryDisplay(),{width:i}=n.workAreaSize,d=320,m=72,s=16;l=new a.BrowserWindow({width:d,height:m,x:i-d-s,y:s,frame:!1,resizable:!1,movable:!1,alwaysOnTop:!0,skipTaskbar:!0,focusable:!1,transparent:!0,hasShadow:!0,show:!1,webPreferences:{contextIsolation:!0,nodeIntegration:!1}});const k=`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif;
    background: transparent;
    -webkit-app-region: no-drag;
    overflow: hidden;
  }
  .toast {
    background: rgba(40, 40, 40, 0.92);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 12px;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    border: 1px solid rgba(255,255,255,0.08);
    animation: slideIn 0.3s ease-out;
    height: 64px;
  }
  .icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: ${o==="success"?"#34c759":o==="error"?"#ff3b30":"#0071e3"};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 16px;
    color: white;
    font-weight: 700;
  }
  .content {
    flex: 1;
    min-width: 0;
  }
  .title {
    font-size: 13px;
    font-weight: 600;
    color: #fff;
    line-height: 1.3;
  }
  .body {
    font-size: 12px;
    color: rgba(255,255,255,0.7);
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
</style>
</head>
<body>
  <div class="toast">
    <div class="icon">F✓</div>
    <div class="content">
      <div class="title">${e.replace(/</g,"&lt;")}</div>
      <div class="body">${t.replace(/</g,"&lt;")}</div>
    </div>
  </div>
</body>
</html>`;l.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(k)}`),l.once("ready-to-show",()=>{l&&!l.isDestroyed()&&l.showInactive()}),P=setTimeout(()=>{l&&!l.isDestroyed()&&(l.destroy(),l=null)},r)}let S=!1;async function N(e){if(!S){S=!0;try{const t=a.clipboard.readText();if(!t||t.trim().length===0){p("Fixly","Clipboard is empty.","info");return}const o=w();p("Fixly",e==="translate"?"Translating...":"Checking grammar...","info",1e4);const r=await O(t,o,{mode:e});a.clipboard.writeText(r),p("Fixly",e==="translate"?"Clipboard text translated!":"Clipboard text corrected!","success")}catch(t){p("Fixly Error",t instanceof Error?t.message:"Unknown error","error")}finally{S=!1}}}async function V(){return N("grammar")}async function H(){return N("translate")}let v=!1;function X(){if(process.platform!=="darwin")return!0;const e=a.systemPreferences.isTrustedAccessibilityClient(!1);return console.log("[Fixly] Accessibility trusted:",e),e||(a.shell.openExternal("x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility"),p("Fixly","Grant Accessibility access in System Settings, then retry.","error",8e3)),e}function F(e){return new Promise((t,o)=>{const r=process.platform==="darwin",n=process.platform==="win32",i=e==="copy"?8:9,d=e==="copy"?"c":"v";let m;r?m=`osascript -l JavaScript -e '
        ObjC.import("CoreGraphics");
        var src = $.CGEventSourceCreate($.kCGEventSourceStateCombinedSessionState);
        var down = $.CGEventCreateKeyboardEvent(src, ${i}, true);
        var up = $.CGEventCreateKeyboardEvent(src, ${i}, false);
        $.CGEventSetFlags(down, $.kCGEventFlagMaskCommand);
        $.CGEventPost($.kCGAnnotatedSessionEventTap, down);
        $.CGEventPost($.kCGAnnotatedSessionEventTap, up);
      '`:n?m=`powershell -command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('^${d}')"`:m=`xdotool key ctrl+${d}`,W.exec(m,(s,c,k)=>{s?(console.error(`simulateKey(${e}) failed:`,s.message,k),o(s)):t()})})}function E(e){return new Promise(t=>setTimeout(t,e))}async function Z(){if(v)return;if(v=!0,!X()){v=!1;return}const e=a.clipboard.readText();try{a.clipboard.writeText(""),console.log("[Fixly] Clipboard cleared, simulating copy..."),await F("copy"),console.log("[Fixly] Copy simulated, waiting..."),await E(500);const t=a.clipboard.readText();if(console.log("[Fixly] Clipboard after copy:",JSON.stringify(t.substring(0,100))),!t||t.trim().length===0){p("Fixly","No text selected.","info"),a.clipboard.writeText(e);return}const o=w();p("Fixly","Correcting selected text...","info",1e4);const r=await O(t,o,{mode:o.activeMode,translationDirection:o.translationDirection});a.clipboard.writeText(r),await F("paste"),await E(200),a.clipboard.writeText(r),p("Fixly","Text corrected in place!","success")}catch(t){a.clipboard.writeText(e),p("Fixly Error",t instanceof Error?t.message:"Unknown error","error")}finally{v=!1}}let y=null;function Q(e,t,o,r,n){y={onPopupTrigger:e,onClipboardCorrect:t,onClipboardTranslate:o,onSelectAndCorrect:r},_(n)}function ee(e){y&&(a.globalShortcut.unregisterAll(),_(e))}function _(e){if(y){try{a.globalShortcut.register(e.togglePopup,y.onPopupTrigger)}catch(t){console.error(`Failed to register popup shortcut "${e.togglePopup}":`,t)}try{a.globalShortcut.register(e.clipboardCorrect,y.onClipboardCorrect)}catch(t){console.error(`Failed to register clipboard correct shortcut "${e.clipboardCorrect}":`,t)}try{a.globalShortcut.register(e.clipboardTranslate,y.onClipboardTranslate)}catch(t){console.error(`Failed to register clipboard translate shortcut "${e.clipboardTranslate}":`,t)}try{a.globalShortcut.register(e.selectAndCorrect,y.onSelectAndCorrect)}catch(t){console.error(`Failed to register select-and-correct shortcut "${e.selectAndCorrect}":`,t)}}}function te(){a.globalShortcut.unregisterAll()}let x=null;const $={grammar:"Grammar Fix",rewrite:"Rewrite",shorten:"Shorten",expand:"Expand","email-reply":"Email Reply",translate:"Translate",auto:"Auto Detect"},I={friendly:"🤗 Friendly",normal:"✏️ Normal",professional:"💼 Professional"};function G(e,t,o,r){const n=Object.keys($).map(c=>({label:$[c],type:"radio",checked:e.activeMode===c,click:()=>{e.activeMode=c,u(e),r(e),h(e,t,o,r)}})),i=Object.keys(I).map(c=>({label:I[c],type:"radio",checked:e.toneProfile===c,click:()=>{e.toneProfile=c,u(e),r(e),h(e,t,o,r)}})),d=[{label:"OpenAI",type:"radio",checked:e.aiProvider==="openai",click:()=>{e.aiProvider="openai",u(e),r(e),h(e,t,o,r)}},{label:"Gemini",type:"radio",checked:e.aiProvider==="gemini",click:()=>{e.aiProvider="gemini",u(e),r(e),h(e,t,o,r)}},{label:"GLM (Z.ai)",type:"radio",checked:e.aiProvider==="glm",click:()=>{e.aiProvider="glm",u(e),r(e),h(e,t,o,r)}}],m=[{label:"🇻🇳 → 🇬🇧 Vietnamese to English",type:"radio",checked:e.translationDirection==="vi-en",click:()=>{e.translationDirection="vi-en",u(e),r(e),h(e,t,o,r)}},{label:"🇬🇧 → 🇻🇳 English to Vietnamese",type:"radio",checked:e.translationDirection==="en-vi",click:()=>{e.translationDirection="en-vi",u(e),r(e),h(e,t,o,r)}}],s=e.shortcuts;return a.Menu.buildFromTemplate([{label:"Fixly",enabled:!1},{type:"separator"},{label:"Mode",enabled:!1},...n,{type:"separator"},{label:"Tone",enabled:!1},...i,{type:"separator"},{label:"Provider",enabled:!1},...d,{type:"separator"},{label:"Translation",enabled:!1},...m,{type:"separator"},{label:`${T(s.togglePopup)}  Open Popup`,enabled:!1},{label:`${T(s.clipboardCorrect)}  Fix Clipboard`,enabled:!1},{label:`${T(s.clipboardTranslate)}  Translate Clipboard`,enabled:!1},{label:`${T(s.selectAndCorrect)}  Fix Selected Text`,enabled:!1},{type:"separator"},{label:"Launch at Login",type:"checkbox",checked:e.launchAtLogin,click:c=>{e.launchAtLogin=c.checked,u(e),r(e)}},{label:"Settings...",click:t},{label:"Enable Notifications...",click:()=>{a.shell.openExternal("x-apple.systempreferences:com.apple.Notifications-Settings")}},{type:"separator"},{label:"Quit",click:o}])}function T(e){return e.replace("CommandOrControl","⌘").replace("Shift","⇧").replace("+","")}function h(e,t,o,r){x&&x.setContextMenu(G(e,t,o,r))}function re(e,t,o){let r;a.app.isPackaged?r=g.join(process.resourcesPath,"assets","trayIconTemplate.png"):r=g.join(__dirname,"../../assets/trayIconTemplate.png");const n=a.nativeImage.createFromPath(r);n.setTemplateImage(!0),x=new a.Tray(n),x.setToolTip("Fixly");const i=w();return x.setContextMenu(G(i,e,t,o)),x}const oe=a.app.requestSingleInstanceLock();oe||a.app.quit();let f=null,b=null;function j(){const e=new a.BrowserWindow({width:480,height:520,show:!1,frame:!1,resizable:!1,alwaysOnTop:!0,skipTaskbar:!0,transparent:!1,vibrancy:"popover",webPreferences:{preload:g.join(__dirname,"preload.js"),contextIsolation:!0,nodeIntegration:!1}});return e.loadFile(g.join(__dirname,"../renderer/main_window/index.html")),e.on("blur",()=>{e.hide()}),e}function ae(){if(b&&!b.isDestroyed())return b.focus(),b;const e=new a.BrowserWindow({width:460,height:580,show:!1,resizable:!1,title:"Fixly Settings",webPreferences:{preload:g.join(__dirname,"preload.js"),contextIsolation:!0,nodeIntegration:!1}});return e.loadFile(g.join(__dirname,"../renderer/main_window/settings.html")),e.once("ready-to-show",()=>e.show()),e.on("closed",()=>{b=null}),b=e,e}function ne(){(!f||f.isDestroyed())&&(f=j()),f.isVisible()?f.hide():(f.center(),f.show(),f.focus())}function ie(e){A(e.launchAtLogin)}function A(e){a.app.setLoginItemSettings({openAtLogin:e,openAsHidden:!0})}function le(){a.ipcMain.handle("process-text",async(e,t,o)=>{const r=w();return O(t,r,{mode:(o==null?void 0:o.mode)||r.activeMode,translationDirection:(o==null?void 0:o.translationDirection)||r.translationDirection})}),a.ipcMain.handle("get-settings",()=>w()),a.ipcMain.handle("save-settings",(e,t)=>{u(t),t.shortcuts&&ee(t.shortcuts),A(!!t.launchAtLogin)})}a.app.whenReady().then(()=>{a.app.setName("Fixly"),a.app.dock&&a.app.dock.hide(),le(),f=j();const e=process.platform==="darwin"?"⌘⇧G":"Ctrl+Shift+G";p("Fixly",`Fixly is running! Use ${e} to open.`,"info");const t=w();A(t.launchAtLogin),re(()=>ae(),()=>a.app.quit(),ie),Q(ne,V,H,Z,t.shortcuts)});a.app.on("will-quit",()=>{te()});a.app.on("window-all-closed",()=>{});
