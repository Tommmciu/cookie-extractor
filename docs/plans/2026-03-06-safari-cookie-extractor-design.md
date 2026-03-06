# Safari Cookie Extractor — Design

**Date:** 2026-03-06
**Status:** Approved

## Overview

A Safari Web Extension that copies all cookies for the current page to the clipboard with a single toolbar button click. Targets Safari 14+ / macOS 11+.

## Problem

Developers frequently need to copy the full `Cookie` header value (e.g. for use in curl or Postman) and currently must open DevTools, navigate to the Network tab, find a request, and manually copy the header. This extension reduces that to a single click.

## Behavior

1. User clicks the extension icon in Safari's toolbar
2. The background service worker reads all cookies for the current tab's URL via `browser.cookies.getAll()`
3. Formats them as `name1=value1; name2=value2` (standard HTTP Cookie header value format)
4. Writes the string to clipboard via `navigator.clipboard.writeText()`
5. Sets a `"✓"` badge on the toolbar icon for 2 seconds, then clears it

No popup, no content script, no additional UI beyond the badge confirmation.

## Architecture

### Extension files

- **`manifest.json`** — Extension manifest (Manifest V2, as required by Safari)
  - Permissions: `cookies`, `activeTab`, `clipboardWrite`
  - Declares background script and browser action
- **`background.js`** — Single service worker handling all logic
  - Listens on `browser.browserAction.onClicked`
  - Fetches cookies with `browser.cookies.getAll({ url: tab.url })`
  - Formats as semicolon-separated `name=value` pairs
  - Writes to clipboard
  - Sets badge text `"✓"` then clears after 2 seconds

### Xcode wrapper app

Required by Apple for Safari extension distribution. A minimal Swift/SwiftUI app with a single screen instructing the user to enable the extension in Safari Settings > Extensions.

### Directory structure

```
safari-cookie-extractor/
  SafariCookieExtractor/           # Xcode project root
    SafariCookieExtractor/         # Swift wrapper app
    SafariCookieExtractorExtension/  # Extension target
      manifest.json
      background.js
      images/                      # Toolbar icons (16, 32, 48, 64, 128px)
  docs/
    plans/
      2026-03-06-safari-cookie-extractor-design.md
```

## Key Decisions

- **No popup:** Single-action button avoids unnecessary UI. The badge provides sufficient feedback.
- **`browser.cookies` API over `document.cookie`:** Captures `HttpOnly` cookies which are inaccessible from page scripts — these are typically the most security-sensitive and useful (session tokens, auth cookies).
- **Manifest V2:** Safari's WebExtensions API currently requires MV2 for background scripts; MV3 service workers have limited support in Safari at time of writing.
- **Format:** Standard `name=value; name2=value2` — directly pasteable as a curl `--cookie` argument or HTTP header value.
