# Safari Cookie Extractor

A Safari Web Extension for macOS that copies all cookies for the current tab to your clipboard in `Cookie` header format — one click, ready to paste into curl, Postman, or any HTTP client.

## How it works

Click the toolbar icon on any HTTP/HTTPS tab. The extension reads all cookies for that URL and copies them as a single `Cookie: name=value; name2=value2` string to your clipboard. A badge confirms the result:

- **✓** (green) — cookies copied successfully
- **✗** (red) — error or unsupported page
- **0** (grey) — page has no cookies

## Installation

### Option A: Download the DMG (recommended)

1. Download `SafariCookieExtractor-1.0.dmg` from the [latest release](https://github.com/Tommmciu/safari-cookie-extractor/releases/latest)
2. Open the DMG and drag **SafariCookieExtractor** to your Applications folder
3. Launch the app — it will guide you to enable the extension in Safari

### Option B: Build from source

Requirements: macOS 13+, Xcode 15+

```bash
git clone git@github.com:Tommmciu/safari-cookie-extractor.git
cd safari-cookie-extractor
open SafariCookieExtractor/SafariCookieExtractor.xcodeproj
```

Build and run the `SafariCookieExtractor` scheme in Xcode.

## Enabling the extension

1. Open **Safari → Settings → Extensions**
2. Find **SafariCookieExtractor** and check the checkbox to enable it
3. Grant access to websites when prompted (required to read cookies)

The companion app also shows the current extension state and has a button to jump straight to Safari extension settings.

## Usage

1. Navigate to any website in Safari
2. Click the **SafariCookieExtractor** icon in the toolbar
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
| `<all_urls>` | Required by Safari to access cookies across domains |

## Requirements

- macOS 13 (Ventura) or later
- Safari 16 or later

## License

MIT
