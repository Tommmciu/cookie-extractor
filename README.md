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
