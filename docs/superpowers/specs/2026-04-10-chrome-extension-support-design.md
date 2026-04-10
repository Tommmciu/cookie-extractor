# Chrome Extension Support Design

**Date:** 2026-04-10  
**Scope:** Add Chrome browser support (Windows + macOS) alongside existing Safari extension  
**Distribution:** Self-hosted (users load unpacked extension)  
**Success Criteria:** Basic functionality (cookies copied same as Safari), installation documentation, and release builds

---

## Overview

The Safari Cookie Extractor extension uses the WebExtensions API (Manifest v3), which is largely compatible with Chrome. This design adds Chrome support by organizing code under a unified `src/` directory with shared extension logic and browser-specific implementations, avoiding duplication while maintaining clear separation of concerns.

---

## Project Structure

All code moves under `src/`, organized by browser:

```
src/
├── extension/                    # Shared WebExtension code (both browsers)
│   ├── background.js             # Core cookie logic
│   ├── content.js                # Content script (if needed)
│   └── messages.json             # Localization strings
├── safari/                       # Safari-specific code
│   ├── SafariCookieExtractor.xcodeproj
│   ├── app/                      # Swift app source files
│   └── extension/                # Safari extension resources
│       ├── manifest.json         # Safari manifest (references shared code)
│       └── ... (other Safari extension files)
└── chrome/                       # Chrome-specific code
    ├── manifest.json             # Chrome manifest
    ├── popup.html                # Chrome popup UI
    ├── popup.js                  # Chrome popup logic
    ├── icons/                    # Extension icons (symlinked/copied)
    └── dist/                     # Build output (gitignored)
```

**Rationale:**
- Single `src/extension/` is the source of truth for cookie logic
- Shared code is never duplicated
- Browser-specific implementations (`safari/`, `chrome/`) are isolated and self-contained
- Clear ownership: changes to core logic go in `src/extension/`, platform concerns stay in their folders

---

## Shared Extension Code

The existing Safari extension's `background.js` is already WebExtension-compatible (uses `browser.*` APIs). Migration:

1. Move `SafariCookieExtractor/SafariCookieExtractor Extension/Resources/background.js` → `src/extension/background.js` (unchanged)
2. Move `content.js` if present
3. Both Safari and Chrome reference this shared file during build

**No code changes required** — the logic is identical for both browsers. Chrome and Safari use the same WebExtensions API for cookies, permissions, and scripting.

---

## Chrome Manifest & Configuration

**File:** `src/chrome/manifest.json`

Differences from Safari:
- Both use Manifest v3, `"action"` for toolbar icon, and the same permissions
- Chrome requires `"icons"` section for extension list/store pages
- Content identical otherwise

**Chrome popup UI (new files):**
- `src/chrome/popup.html` — simple HTML interface for the popup (Safari uses native UI; Chrome needs HTML)
- `src/chrome/popup.js` — minimal popup logic to interact with background script
- `src/chrome/icons/` — icons copied/symlinked from design assets (48px, 96px, 128px, 256px, 512px)

**Permissions (identical to Safari):**
- `cookies` — read cookies for the current tab
- `activeTab` — identify the current tab
- `scripting` — inject clipboard-write script
- `<all_urls>` — access cookies across all domains

---

## Build Process

**File:** `build/build-chrome-extension.js` (new)

Simple Node.js script that:
1. Copies `src/extension/*` files to `src/chrome/dist/`
2. Copies icons to `src/chrome/dist/icons/`
3. Zips the entire `src/chrome/dist/` directory as `chrome-extension-release.zip`

**Run:** `npm run build:chrome`

**Output:** `chrome-extension-release.zip` in project root, ready for self-hosted distribution.

**Scope:** No minification, versioning, or code transformation — straightforward file copy and zip.

---

## Documentation

**Update README.md:**
- Add "Chrome Installation" section with instructions for Windows and macOS
- Link to `docs/CHROME_SETUP.md` for detailed steps

**New file:** `docs/CHROME_SETUP.md`

Step-by-step guide for users:
1. Download `chrome-extension-release.zip` from releases
2. Unzip to a permanent location (e.g., `~/Documents/cookie-extractor/`)
3. Open `chrome://extensions` in Chrome
4. Enable "Developer mode"
5. Click "Load unpacked" and select the unzipped folder
6. Grant permissions when prompted

Include:
- Screenshots of each step
- Platform-specific paths (Windows vs. macOS)
- Troubleshooting: permissions issues, paths that don't work

---

## Success Criteria

✅ **Functional:**
- Extension works on Chrome (Windows + macOS)
- Copies cookies in the same format as Safari version
- Badge feedback (✓, ✗, 0) same as Safari

✅ **Distribution:**
- `chrome-extension-release.zip` contains complete, ready-to-load extension
- Users can extract and load via `chrome://extensions`

✅ **Documentation:**
- README updated with Chrome instructions
- `CHROME_SETUP.md` provides clear installation steps for both platforms

---

## Next Steps

1. Reorganize repo structure: move Safari project and existing extension files to `src/`
2. Extract shared logic to `src/extension/`
3. Create Chrome manifest and popup UI in `src/chrome/`
4. Write build script in `build/`
5. Update documentation
6. Test on Windows and macOS
7. Generate release zip and verify it loads unpacked
