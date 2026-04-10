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
