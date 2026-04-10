# Chrome Extension Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Chrome extension support alongside Safari extension, organized under a unified `src/` directory with shared logic, platform-specific implementations, and an automated build process for self-hosted distribution.

**Architecture:** Shared WebExtension code in `src/extension/`, browser-specific implementations in `src/safari/` and `src/chrome/`, simple Node.js build script to copy shared files and zip for distribution.

**Tech Stack:** Node.js (build script), WebExtensions API (Manifest v3), Chrome for testing.

---

### Task 1: Create `src/` directory structure

**Files:**
- Create: `src/` (directory)
- Create: `src/extension/` (directory)
- Create: `src/safari/` (directory)
- Create: `src/chrome/` (directory)
- Create: `build/` (directory, if not exists)

- [ ] **Step 1: Create the src directory structure**

```bash
mkdir -p src/extension src/safari src/chrome build
```

- [ ] **Step 2: Verify directories exist**

```bash
ls -la src/
# Expected output shows: extension, safari, chrome directories
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: create src directory structure"
```

---

### Task 2: Move Safari project to `src/safari/`

**Files:**
- Move: `SafariCookieExtractor/` → `src/safari/`

- [ ] **Step 1: Move the entire SafariCookieExtractor directory**

```bash
mv SafariCookieExtractor src/safari/
```

- [ ] **Step 2: Verify move was successful**

```bash
ls -la src/safari/
# Expected: SafariCookieExtractor.xcodeproj and SafariCookieExtractor directories present
ls -la SafariCookieExtractor 2>&1 | grep "No such file"
# Expected: No such file error (original gone)
```

- [ ] **Step 3: Update Xcode project file references (if needed)**

Open `src/safari/SafariCookieExtractor.xcodeproj` in Xcode and check if any file references need updating. The project should auto-adjust relative paths. If build fails, we'll fix path references in a follow-up task.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: move SafariCookieExtractor to src/safari"
```

---

### Task 3: Extract shared extension logic to `src/extension/`

**Files:**
- Move: `src/safari/SafariCookieExtractor Extension/Resources/background.js` → `src/extension/background.js`
- Move: `src/safari/SafariCookieExtractor Extension/Resources/content.js` → `src/extension/content.js`
- Move: `src/safari/SafariCookieExtractor Extension/Resources/_locales/en/messages.json` → `src/extension/messages.json`

- [ ] **Step 1: Copy background.js to shared location**

```bash
cp src/safari/SafariCookieExtractor\ Extension/Resources/background.js src/extension/background.js
```

- [ ] **Step 2: Copy content.js to shared location**

```bash
cp src/safari/SafariCookieExtractor\ Extension/Resources/content.js src/extension/content.js
```

- [ ] **Step 3: Copy messages.json to shared location**

```bash
cp src/safari/SafariCookieExtractor\ Extension/Resources/_locales/en/messages.json src/extension/messages.json
```

- [ ] **Step 4: Verify files are in `src/extension/`**

```bash
ls -la src/extension/
# Expected: background.js, content.js, messages.json
```

- [ ] **Step 5: Remove duplicates from Safari extension folder**

```bash
rm src/safari/SafariCookieExtractor\ Extension/Resources/background.js
rm src/safari/SafariCookieExtractor\ Extension/Resources/content.js
rm src/safari/SafariCookieExtractor\ Extension/Resources/_locales/en/messages.json
```

- [ ] **Step 6: Update Safari manifest to reference shared files**

Open `src/safari/SafariCookieExtractor Extension/Resources/manifest.json` and update it to use relative paths to shared code. Since the shared code will be copied during the build process for Safari (or referenced at runtime), add a comment noting this is shared with Chrome.

Edit the manifest to add at the top:
```json
{
    "manifest_version": 3,
    "default_locale": "en",
    "_comment": "This extension shares background.js, content.js, and messages.json with the Chrome extension in src/extension/",
    ...
}
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: extract shared extension code to src/extension"
```

---

### Task 4: Create Chrome manifest

**Files:**
- Create: `src/chrome/manifest.json`

- [ ] **Step 1: Create Chrome manifest**

```bash
cat > src/chrome/manifest.json << 'EOF'
{
    "manifest_version": 3,
    "default_locale": "en",

    "name": "__MSG_extension_name__",
    "description": "__MSG_extension_description__",
    "version": "1.0",

    "icons": {
        "48": "icons/icon-48.png",
        "96": "icons/icon-96.png",
        "128": "icons/icon-128.png",
        "256": "icons/icon-256.png",
        "512": "icons/icon-512.png"
    },

    "background": {
        "service_worker": "background.js",
        "type": "module"
    },

    "action": {
        "default_icon": "icons/icon-48.png",
        "default_title": "Copy Cookies",
        "default_popup": "popup.html"
    },

    "permissions": [ "cookies", "activeTab", "scripting" ],
    "host_permissions": [ "<all_urls>" ]
}
EOF
```

- [ ] **Step 2: Verify manifest was created**

```bash
cat src/chrome/manifest.json | head -20
# Expected: Valid JSON starting with manifest_version
```

- [ ] **Step 3: Commit**

```bash
git add src/chrome/manifest.json
git commit -m "feat: create Chrome extension manifest"
```

---

### Task 5: Create Chrome popup HTML and JS

**Files:**
- Create: `src/chrome/popup.html`
- Create: `src/chrome/popup.js`

- [ ] **Step 1: Create Chrome popup.html**

```bash
cat > src/chrome/popup.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cookie Extractor</title>
    <style>
        body {
            width: 300px;
            padding: 12px;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 14px;
            margin: 0;
        }
        .status {
            padding: 8px;
            border-radius: 4px;
            text-align: center;
            margin-bottom: 8px;
        }
        .success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .info {
            background: #e2e3e5;
            color: #383d41;
            border: 1px solid #d6d8db;
        }
        button {
            width: 100%;
            padding: 8px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        button:hover {
            background: #0056b3;
        }
    </style>
</head>
<body>
    <div id="status" class="status info">Click "Copy Cookies" to extract cookies for this page</div>
    <button id="copyButton">Copy Cookies</button>
    <script src="popup.js"></script>
</body>
</html>
EOF
```

- [ ] **Step 2: Create Chrome popup.js**

```bash
cat > src/chrome/popup.js << 'EOF'
document.getElementById("copyButton").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.runtime.sendMessage({ action: "copyCookies", tabId: tab.id }, (response) => {
        const statusEl = document.getElementById("status");
        if (response && response.success) {
            statusEl.textContent = "✓ Cookies copied to clipboard!";
            statusEl.className = "status success";
        } else {
            statusEl.textContent = "✗ Failed to copy cookies";
            statusEl.className = "status error";
        }
    });
});
EOF
```

- [ ] **Step 3: Verify both files were created**

```bash
ls -la src/chrome/popup.*
# Expected: popup.html and popup.js present
```

- [ ] **Step 4: Commit**

```bash
git add src/chrome/popup.html src/chrome/popup.js
git commit -m "feat: create Chrome popup UI and script"
```

---

### Task 6: Update Chrome background.js to support popup messaging

**Files:**
- Modify: `src/extension/background.js`

- [ ] **Step 1: Read the current background.js**

```bash
cat src/extension/background.js
```

- [ ] **Step 2: Update background.js to support popup messaging**

The current `background.js` listens for `browser.action.onClicked`. Chrome popups need to send messages instead. Update the file to handle both:

```bash
cat > src/extension/background.js << 'EOF'
function showBadge(tabId, text, color) {
    chrome.action.setBadgeText({ text: text, tabId: tabId });
    chrome.action.setBadgeBackgroundColor({ color: color, tabId: tabId });
    setTimeout(() => { chrome.action.setBadgeText({ text: "", tabId: tabId }); }, 2000);
}

async function extractAndCopyCookies(tabId, url) {
    if (!url || !/^https?:\/\//.test(url)) {
        showBadge(tabId, "✗", "#dc3545");
        return false;
    }

    try {
        await chrome.permissions.request({ origins: ["<all_urls>"] });

        // Chrome uses multiple cookie stores; find the one for this tab
        const stores = await chrome.cookies.getAllCookieStores();
        const tabStore = stores.find(s => s.tabIds && s.tabIds.includes(tabId));
        const storeId = tabStore?.id;
        console.log("[CookieExtractor] storeId:", storeId);

        const cookies = await chrome.cookies.getAll({ url: url, storeId });
        console.log("[CookieExtractor] cookies count:", cookies.length);

        if (cookies.length === 0) {
            showBadge(tabId, "0", "#6c757d");
            return false;
        }

        const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join("; ");
        console.log("[CookieExtractor] injecting clipboard script, length:", cookieHeader.length);

        // Use execCommand('copy') via injected script
        const results = await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: (text) => {
                const el = document.createElement("textarea");
                el.value = text;
                el.style.cssText = "position:fixed;opacity:0;pointer-events:none;";
                document.body.appendChild(el);
                el.focus();
                el.select();
                const ok = document.execCommand("copy");
                document.body.removeChild(el);
                return ok;
            },
            args: [cookieHeader]
        });

        console.log("[CookieExtractor] execCommand result:", results);
        const success = results?.[0]?.result === true;
        showBadge(tabId, success ? "✓" : "✗", success ? "#28a745" : "#dc3545");
        return success;
    } catch (error) {
        console.log("[CookieExtractor] caught error:", error?.message, error);
        showBadge(tabId, "✗", "#dc3545");
        return false;
    }
}

// Chrome: Handle clicks from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "copyCookies") {
        chrome.tabs.get(message.tabId, async (tab) => {
            const success = await extractAndCopyCookies(tab.id, tab.url);
            sendResponse({ success: success });
        });
        return true; // Keep channel open for async response
    }
});

// Safari: Handle direct toolbar clicks (if Safari still uses onClicked)
// Check if this is Safari and has onClicked support
if (chrome.action && chrome.action.onClicked) {
    chrome.action.onClicked.addListener(async (tab) => {
        await extractAndCopyCookies(tab.id, tab.url);
    });
}
EOF
```

- [ ] **Step 3: Verify the updated background.js**

```bash
cat src/extension/background.js | head -20
# Expected: Valid JavaScript with chrome.action and message handling
```

- [ ] **Step 4: Commit**

```bash
git add src/extension/background.js
git commit -m "feat: update background.js to support Chrome popup messaging"
```

---

### Task 7: Create icons directory in Chrome extension

**Files:**
- Create: `src/chrome/icons/` (directory)
- Copy: Icons from Safari assets

- [ ] **Step 1: Create icons directory**

```bash
mkdir -p src/chrome/icons
```

- [ ] **Step 2: Copy icons from Safari assets**

Find the actual icon files in the Safari project. Based on the manifest reference to images/, copy them:

```bash
# Find icon files in Safari extension
find src/safari/SafariCookieExtractor\ Extension/Resources -name "*.png" -o -name "*.svg" | head -10
```

If icons exist in a specific location (e.g., images/ folder), copy them:

```bash
cp -r src/safari/SafariCookieExtractor\ Extension/Resources/images/* src/chrome/icons/ 2>/dev/null || echo "Images folder not found, will create placeholder"
```

- [ ] **Step 3: If no icons exist, create simple placeholder icons**

Since we may not have actual icons yet, create minimal placeholders so the manifest doesn't error:

```bash
# Create a simple 48x48 PNG placeholder (1x1 transparent PNG)
printf '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x30\x00\x00\x00\x30\x08\x06\x00\x00\x00V(\x0eK\x00\x00\x00\x1dIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\xf9\x19\xb4\xd4\x00\x00\x00\x00IEND\xaeB`\x82' > src/chrome/icons/icon-48.png
printf '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x60\x00\x00\x00\x60\x08\x06\x00\x00\x00V+\x0eV\x00\x00\x00\x1dIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\xf9\x19\xb4\xd4\x00\x00\x00\x00IEND\xaeB`\x82' > src/chrome/icons/icon-96.png
printf '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x80\x00\x00\x00\x80\x08\x06\x00\x00\x00\xc4\xfbK\x0e\x00\x00\x00\x1dIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\xf9\x19\xb4\xd4\x00\x00\x00\x00IEND\xaeB`\x82' > src/chrome/icons/icon-128.png
printf '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00V+)ü\x00\x00\x00\x1dIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\xf9\x19\xb4\xd4\x00\x00\x00\x00IEND\xaeB`\x82' > src/chrome/icons/icon-256.png
printf '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x02\x00\x00\x00\x02\x08\x06\x00\x00\x00V+\x0e\xa0\x00\x00\x00\x1dIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\xf9\x19\xb4\xd4\x00\x00\x00\x00IEND\xaeB`\x82' > src/chrome/icons/icon-512.png
```

- [ ] **Step 4: Verify icons directory has files**

```bash
ls -la src/chrome/icons/
# Expected: icon-48.png, icon-96.png, icon-128.png, icon-256.png, icon-512.png
```

- [ ] **Step 5: Commit**

```bash
git add src/chrome/icons/
git commit -m "chore: add placeholder icons for Chrome extension"
```

---

### Task 8: Create build script

**Files:**
- Create: `build/build-chrome-extension.js`

- [ ] **Step 1: Create build script**

```bash
cat > build/build-chrome-extension.js << 'EOF'
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BUILD_DIR = path.join(__dirname, '..', 'src', 'chrome', 'dist');
const CHROME_DIR = path.join(__dirname, '..', 'src', 'chrome');
const EXTENSION_DIR = path.join(__dirname, '..', 'src', 'extension');

// Clean build directory
if (fs.existsSync(BUILD_DIR)) {
    fs.rmSync(BUILD_DIR, { recursive: true });
}
fs.mkdirSync(BUILD_DIR, { recursive: true });

// Copy manifest
fs.copyFileSync(
    path.join(CHROME_DIR, 'manifest.json'),
    path.join(BUILD_DIR, 'manifest.json')
);
console.log('✓ Copied manifest.json');

// Copy background.js from shared extension code
fs.copyFileSync(
    path.join(EXTENSION_DIR, 'background.js'),
    path.join(BUILD_DIR, 'background.js')
);
console.log('✓ Copied background.js');

// Copy popup files
fs.copyFileSync(
    path.join(CHROME_DIR, 'popup.html'),
    path.join(BUILD_DIR, 'popup.html')
);
fs.copyFileSync(
    path.join(CHROME_DIR, 'popup.js'),
    path.join(BUILD_DIR, 'popup.js')
);
console.log('✓ Copied popup.html and popup.js');

// Copy icons directory
const iconsSourceDir = path.join(CHROME_DIR, 'icons');
const iconsDestDir = path.join(BUILD_DIR, 'icons');
if (fs.existsSync(iconsSourceDir)) {
    fs.mkdirSync(iconsDestDir, { recursive: true });
    const iconFiles = fs.readdirSync(iconsSourceDir);
    iconFiles.forEach(file => {
        fs.copyFileSync(
            path.join(iconsSourceDir, file),
            path.join(iconsDestDir, file)
        );
    });
    console.log(`✓ Copied ${iconFiles.length} icon files`);
}

// Copy messages.json if it exists
const messagesSource = path.join(EXTENSION_DIR, 'messages.json');
if (fs.existsSync(messagesSource)) {
    fs.mkdirSync(path.join(BUILD_DIR, '_locales', 'en'), { recursive: true });
    fs.copyFileSync(
        messagesSource,
        path.join(BUILD_DIR, '_locales', 'en', 'messages.json')
    );
    console.log('✓ Copied messages.json');
}

// Create zip file
const zipPath = path.join(__dirname, '..', 'chrome-extension-release.zip');
try {
    execSync(`cd ${BUILD_DIR} && zip -r ${zipPath} . > /dev/null 2>&1`);
    console.log(`✓ Created ${zipPath}`);
} catch (e) {
    console.error('Error creating zip. Ensure zip utility is installed.');
    process.exit(1);
}

console.log('\n✓ Build complete! Extension ready at: ' + zipPath);
EOF
```

- [ ] **Step 2: Make build script executable**

```bash
chmod +x build/build-chrome-extension.js
```

- [ ] **Step 3: Verify script was created**

```bash
head -5 build/build-chrome-extension.js
# Expected: #!/usr/bin/env node at top
```

- [ ] **Step 4: Commit**

```bash
git add build/build-chrome-extension.js
git commit -m "feat: add build script for Chrome extension"
```

---

### Task 9: Add npm script and update .gitignore

**Files:**
- Modify: `package.json` (if exists, or create it)
- Modify: `.gitignore`

- [ ] **Step 1: Check if package.json exists**

```bash
ls package.json 2>/dev/null || echo "No package.json found"
```

- [ ] **Step 2: Create or update package.json**

If no `package.json` exists:

```bash
cat > package.json << 'EOF'
{
  "name": "safari-cookie-extractor",
  "version": "1.0.0",
  "description": "Cookie extractor for Safari and Chrome",
  "scripts": {
    "build:chrome": "node build/build-chrome-extension.js"
  }
}
EOF
```

If it exists, add the script to the existing `scripts` section. Read it first:

```bash
cat package.json
```

Then update it to include the build script (you'll need to edit it appropriately).

- [ ] **Step 3: Update .gitignore**

```bash
cat >> .gitignore << 'EOF'

# Chrome extension build output
src/chrome/dist/
chrome-extension-release.zip
EOF
```

- [ ] **Step 4: Verify .gitignore was updated**

```bash
tail -5 .gitignore
# Expected: src/chrome/dist/ and chrome-extension-release.zip listed
```

- [ ] **Step 5: Commit**

```bash
git add package.json .gitignore
git commit -m "chore: add build script to npm and update gitignore"
```

---

### Task 10: Update README.md with Chrome installation instructions

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Read current README**

```bash
cat README.md
```

- [ ] **Step 2: Update README to add Chrome section**

Add a new section after the Safari installation instructions. Replace the README with updated content:

```bash
cat > README.md << 'EOF'
# Safari Cookie Extractor

A Web Extension for macOS/Windows browsers that copies all cookies for the current tab to your clipboard in `Cookie` header format — one click, ready to paste into curl, Postman, or any HTTP client.

## How it works

Click the toolbar icon on any HTTP/HTTPS tab. The extension reads all cookies for that URL and copies them as a single `Cookie: name=value; name2=value2` string to your clipboard. A badge confirms the result:

- **✓** (green) — cookies copied successfully
- **✗** (red) — error or unsupported page
- **0** (grey) — page has no cookies

## Installation

### Safari (macOS)

#### Option A: Download the DMG (recommended)

1. Download `SafariCookieExtractor-1.0.dmg` from the [latest release](https://github.com/Tommmciu/safari-cookie-extractor/releases/latest)
2. Open the DMG and drag **SafariCookieExtractor** to your Applications folder
3. Launch the app — it will guide you to enable the extension in Safari

#### Option B: Build from source

Requirements: macOS 13+, Xcode 15+

```bash
git clone git@github.com:Tommmciu/safari-cookie-extractor.git
cd safari-cookie-extractor
open src/safari/SafariCookieExtractor/SafariCookieExtractor.xcodeproj
```

Build and run the `SafariCookieExtractor` scheme in Xcode.

#### Enabling the Safari extension

1. Open **Safari → Settings → Extensions**
2. Find **SafariCookieExtractor** and check the checkbox to enable it
3. Grant access to websites when prompted (required to read cookies)

The companion app also shows the current extension state and has a button to jump straight to Safari extension settings.

### Chrome (Windows & macOS)

1. Download `chrome-extension-release.zip` from the [latest release](https://github.com/Tommmciu/safari-cookie-extractor/releases/latest)
2. Extract the zip to a permanent location (e.g., `~/Documents/cookie-extractor/` on macOS or `C:\Users\YourUser\Documents\cookie-extractor\` on Windows)
3. Open `chrome://extensions` in Chrome
4. Enable **Developer mode** (toggle in top right)
5. Click **Load unpacked** and select the extracted folder
6. Grant permissions when prompted

For detailed step-by-step instructions with screenshots, see [Chrome Setup Guide](docs/CHROME_SETUP.md).

## Usage

1. Navigate to any website in your browser
2. Click the **Cookie Extractor** icon in the toolbar
3. Your clipboard now contains all cookies for that site, e.g.:
   ```
   session_id=abc123; _ga=GA1.2.xxx; auth_token=yyy
   ```
4. Paste directly into curl:
   ```bash
   curl -H "Cookie: session_id=abc123; _ga=GA1.2.xxx" https://example.com/api
   ```

## Permissions

The extension requests:

| Permission | Reason |
|---|---|
| `cookies` | Read cookies for the current tab |
| `activeTab` | Identify the current tab and its URL |
| `scripting` | Inject clipboard-write script into the page |
| `<all_urls>` | Required to access cookies across domains |

## Requirements

- **Safari**: macOS 13 (Ventura) or later, Safari 16 or later
- **Chrome**: Windows 10+ or macOS 10.15+, Chrome 90+

## Building the Chrome Extension

To build the Chrome extension from source:

```bash
npm run build:chrome
```

This creates `chrome-extension-release.zip` in the project root, ready for self-hosted distribution.

## License

MIT
EOF
```

- [ ] **Step 3: Verify README was updated**

```bash
grep -A 5 "Chrome (Windows & macOS)" README.md
# Expected: Chrome installation section visible
```

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: add Chrome installation instructions to README"
```

---

### Task 11: Create CHROME_SETUP.md documentation

**Files:**
- Create: `docs/CHROME_SETUP.md`

- [ ] **Step 1: Create CHROME_SETUP.md**

```bash
mkdir -p docs
cat > docs/CHROME_SETUP.md << 'EOF'
# Chrome Extension Setup Guide

This guide walks you through installing the Cookie Extractor Chrome extension on Windows or macOS.

## Prerequisites

- Chrome browser (version 90 or later)
- `chrome-extension-release.zip` file (download from [releases](https://github.com/Tommmciu/safari-cookie-extractor/releases))

## Installation Steps

### Step 1: Download and Extract

1. Download `chrome-extension-release.zip` from the latest release
2. Extract it to a permanent location:
   - **macOS**: `~/Documents/cookie-extractor/` or any preferred folder
   - **Windows**: `C:\Users\YourUsername\Documents\cookie-extractor\` or any preferred folder

**Important:** Choose a location you won't delete later, as Chrome references this folder.

### Step 2: Open Chrome Extensions Page

1. Open Chrome
2. Type `chrome://extensions` in the address bar and press Enter
3. You should see the Extensions page with a list of installed extensions

### Step 3: Enable Developer Mode

In the top-right corner of the Extensions page, toggle **Developer mode** to ON.

You should now see additional buttons like "Load unpacked".

### Step 4: Load the Extension

1. Click the **Load unpacked** button
2. Navigate to the folder where you extracted the extension
3. Click the folder to select it, then click **Open** (or **Select Folder** on macOS)

Chrome will load the extension and show it in your extensions list.

### Step 5: Grant Permissions

1. You may see a permissions prompt asking to allow access to cookies
2. Click **Allow** to grant the extension necessary permissions

The extension is now installed!

## Using the Extension

1. Navigate to any website
2. Click the **Cookie Extractor** icon in your Chrome toolbar
3. A popup will appear with a "Copy Cookies" button
4. Click the button — your clipboard now contains all cookies for that site
5. Paste into curl, Postman, or any HTTP client

## Troubleshooting

### Extension doesn't appear in toolbar

- **Check if it's installed:** Go to `chrome://extensions` and search for "Cookie Extractor"
- **Unhide the icon:** If you see it in the extensions list but not in the toolbar, click the puzzle icon in the top-right corner and pin it

### Permissions not granted

- Go to `chrome://extensions/`
- Find "Cookie Extractor"
- Under **Permissions**, verify "Cookies" and "Sites" are listed and enabled
- If not, click the extension and grant permissions when prompted

### "Load unpacked" button missing

- Make sure **Developer mode** is enabled (toggle in top-right of `chrome://extensions`)

### Extension folder was moved/deleted

- Chrome will show an error for the extension
- Re-extract the zip file to a new permanent location
- Click the three dots next to the extension and select "Remove"
- Follow "Step 4" above to reload from the new location

### Still having issues?

- Check that the folder contains `manifest.json`, `background.js`, `popup.html`, and an `icons/` subdirectory
- Try removing the extension and reloading it following the steps above
- Ensure Chrome is up to date: Chrome menu → About Google Chrome (auto-checks for updates)

## Updating the Extension

When a new version is released:

1. Download the new `chrome-extension-release.zip`
2. Extract it over your previous installation (or to a new folder)
3. Go to `chrome://extensions`
4. If you used a new folder, remove the old extension and load the new one
5. If you extracted over the old folder, just refresh the extension (click the refresh icon)

## Privacy & Permissions

This extension:
- Only reads cookies from the current tab when you click the icon
- Never stores, transmits, or logs cookie data
- Never sends data to any server
- Only needs `cookies` and `activeTab` permissions to function
- Requires `<all_urls>` to access cookies across domains (a Chrome requirement)

EOF
```

- [ ] **Step 2: Verify CHROME_SETUP.md was created**

```bash
head -20 docs/CHROME_SETUP.md
# Expected: Markdown header and setup instructions visible
```

- [ ] **Step 3: Commit**

```bash
git add docs/CHROME_SETUP.md
git commit -m "docs: add Chrome setup and installation guide"
```

---

### Task 12: Test the build script

**Files:**
- Test: `build/build-chrome-extension.js`

- [ ] **Step 1: Run the build script**

```bash
npm run build:chrome
```

- [ ] **Step 2: Verify build output**

```bash
ls -lh chrome-extension-release.zip
# Expected: File exists and has reasonable size (> 5KB)
```

- [ ] **Step 3: Verify zip contents**

```bash
unzip -l chrome-extension-release.zip | head -20
# Expected: manifest.json, background.js, popup.html, popup.js, icons/* listed
```

- [ ] **Step 4: Extract and verify structure**

```bash
mkdir -p /tmp/chrome-test
unzip -q chrome-extension-release.zip -d /tmp/chrome-test
ls -la /tmp/chrome-test/
# Expected: manifest.json, background.js, popup.html, popup.js, icons directory
```

- [ ] **Step 5: Validate manifest JSON**

```bash
cat /tmp/chrome-test/manifest.json | grep -E "manifest_version|name|version"
# Expected: Valid JSON with manifest_version, name, version fields
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "test: verify build script creates valid Chrome extension"
```

---

### Task 13: Final structure verification

**Files:**
- Verify: Entire `src/` structure

- [ ] **Step 1: Verify complete src/ structure**

```bash
tree src/ -I dist -L 2
# Or if tree is not available:
find src -type f -name "*.js" -o -name "*.json" -o -name "*.html" | sort
```

Expected output should include:
- `src/extension/background.js`
- `src/extension/content.js`
- `src/extension/messages.json`
- `src/safari/SafariCookieExtractor.xcodeproj`
- `src/chrome/manifest.json`
- `src/chrome/popup.html`
- `src/chrome/popup.js`
- `src/chrome/icons/icon-*.png`

- [ ] **Step 2: Verify Safari still builds**

```bash
# Open the Xcode project to verify it still references sources correctly
open src/safari/SafariCookieExtractor/SafariCookieExtractor.xcodeproj
```

In Xcode, verify that the build target references files correctly. Check one source file to ensure the path is valid. If paths show errors, update them to point to `src/` locations.

- [ ] **Step 3: Create summary of changes**

```bash
git log --oneline -15
# Verify all commits from this task are present
```

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: complete Chrome extension support implementation"
```

---

## Plan Summary

This plan:
1. **Reorganizes the repo** under `src/` with browser-specific folders
2. **Extracts shared code** (`background.js`, `content.js`, `messages.json`) to avoid duplication
3. **Creates Chrome-specific files** (manifest, popup UI, icons)
4. **Implements a build process** via npm script
5. **Documents installation** for end users
6. **Tests and verifies** the complete setup

All code is DRY, commits are frequent and focused, and the extension is ready for self-hosted distribution.
