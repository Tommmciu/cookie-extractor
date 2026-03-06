# Safari Cookie Extractor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Safari Web Extension that copies all cookies for the current tab to clipboard on toolbar button click, confirming with a ✓ badge for 2 seconds.

**Architecture:** A Safari Web Extension with a background script handling all logic (no popup, no content script). Packaged inside a minimal Xcode Swift app required for Safari extension distribution. The background script uses `browser.cookies.getAll()` (which captures HttpOnly cookies) and `navigator.clipboard.writeText()`.

**Tech Stack:** Swift/SwiftUI (wrapper app), JavaScript (extension logic), Xcode 14+, Safari 14+, macOS 11+

---

### Task 1: Create Xcode project with Safari Web Extension template

> No automated test for this task — it's project scaffolding.

**Step 1: Open Xcode and create a new project**

- Open Xcode
- File → New → Project
- Select **macOS** tab → **Safari Extension App**
- Click Next

**Step 2: Configure the project**

Fill in:
- Product Name: `SafariCookieExtractor`
- Team: your Apple developer team (or None for local testing)
- Organization Identifier: `com.yourname` (e.g. `com.dev`)
- Bundle Identifier (auto-filled): `com.yourname.SafariCookieExtractor`
- Language: Swift
- Uncheck "Include SwiftUI Previews" if present
- Uncheck any unit/UI test targets for now

Click Next, save to: `/Users/tomasz.jeniec/source/own/safari-cookie-extractor/`

**Step 3: Verify generated structure**

Xcode generates:
```
SafariCookieExtractor/
  SafariCookieExtractor/          # Swift wrapper app target
    AppDelegate.swift
    ViewController.swift
    Main.storyboard (or SwiftUI)
  SafariCookieExtractorExtension/ # Extension target
    manifest.json
    background.js (may be empty or missing)
    images/                       # toolbar icons
    _locales/
  SafariCookieExtractor.xcodeproj
```

**Step 4: Commit initial scaffold**

```bash
cd /Users/tomasz.jeniec/source/own/safari-cookie-extractor
git add SafariCookieExtractor.xcodeproj SafariCookieExtractor/
git commit -m "feat: scaffold Xcode Safari Web Extension project"
```

---

### Task 2: Configure manifest.json

**Files:**
- Modify: `SafariCookieExtractor/SafariCookieExtractorExtension/manifest.json`

**Step 1: Replace the generated manifest.json with this content**

```json
{
    "manifest_version": 2,
    "default_locale": "en",

    "name": "__MSG_extension_name__",
    "description": "__MSG_extension_description__",
    "version": "1.0",

    "background": {
        "scripts": ["background.js"],
        "persistent": false
    },

    "browser_action": {
        "default_icon": {
            "16":  "images/toolbar-icon-16.png",
            "32":  "images/toolbar-icon-32.png",
            "48":  "images/toolbar-icon-48.png",
            "64":  "images/toolbar-icon-64.png",
            "128": "images/toolbar-icon-128.png"
        },
        "default_title": "Copy Cookies"
    },

    "permissions": [
        "cookies",
        "activeTab",
        "clipboardWrite",
        "<all_urls>"
    ]
}
```

Note: `<all_urls>` is required alongside `cookies` for `browser.cookies.getAll()` to access cookies across all domains.

**Step 2: Verify the manifest is valid JSON**

```bash
cat SafariCookieExtractor/SafariCookieExtractorExtension/manifest.json | python3 -m json.tool
```

Expected: prints formatted JSON without errors.

**Step 3: Commit**

```bash
git add SafariCookieExtractor/SafariCookieExtractorExtension/manifest.json
git commit -m "feat: configure extension manifest with cookies and clipboard permissions"
```

---

### Task 3: Implement background.js

**Files:**
- Modify/Create: `SafariCookieExtractor/SafariCookieExtractorExtension/background.js`

**Step 1: Write the background script**

```javascript
browser.browserAction.onClicked.addListener(async (tab) => {
    try {
        const cookies = await browser.cookies.getAll({ url: tab.url });
        const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join("; ");

        await navigator.clipboard.writeText(cookieHeader);

        await browser.browserAction.setBadgeText({ text: "✓", tabId: tab.id });
        await browser.browserAction.setBadgeBackgroundColor({ color: "#28a745", tabId: tab.id });

        setTimeout(async () => {
            await browser.browserAction.setBadgeText({ text: "", tabId: tab.id });
        }, 2000);
    } catch (error) {
        await browser.browserAction.setBadgeText({ text: "✗", tabId: tab.id });
        await browser.browserAction.setBadgeBackgroundColor({ color: "#dc3545", tabId: tab.id });

        setTimeout(async () => {
            await browser.browserAction.setBadgeText({ text: "", tabId: tab.id });
        }, 2000);
    }
});
```

**Step 2: Verify the file is syntactically valid**

```bash
node --check SafariCookieExtractor/SafariCookieExtractorExtension/background.js
```

Expected: no output (no syntax errors).

**Step 3: Commit**

```bash
git add SafariCookieExtractor/SafariCookieExtractorExtension/background.js
git commit -m "feat: implement cookie copy with badge confirmation in background script"
```

---

### Task 4: Create toolbar icons

**Files:**
- Create: `SafariCookieExtractor/SafariCookieExtractorExtension/images/toolbar-icon-{16,32,48,64,128}.png`

**Step 1: Check if Xcode already generated placeholder icons**

```bash
ls SafariCookieExtractor/SafariCookieExtractorExtension/images/
```

If PNG files exist at the expected sizes, skip to Step 3.

**Step 2: Generate simple icons using Python (if missing)**

Run this script to create simple monochrome cookie icons:

```bash
python3 - <<'EOF'
import struct, zlib, os

def create_png(size, output_path):
    """Create a minimal grey square PNG as a placeholder icon."""
    img_data = []
    for y in range(size):
        row = b'\x00'  # filter byte
        for x in range(size):
            # Draw a simple "C" shape to suggest cookie/copy
            cx, cy = size // 2, size // 2
            r = size // 2 - 1
            dist = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5
            thickness = max(1, size // 8)
            if r - thickness <= dist <= r and not (
                cx - thickness <= x <= cx + thickness and y > cy
            ):
                row += bytes([40, 120, 200, 255])  # blue pixel (RGBA)
            else:
                row += bytes([0, 0, 0, 0])  # transparent
        img_data.append(row)

    raw = b''.join(img_data)
    compressed = zlib.compress(raw)

    def chunk(name, data):
        c = name + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)

    ihdr_data = struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0)
    png = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', ihdr_data)
    png += chunk(b'IDAT', compressed)
    png += chunk(b'IEND', b'')

    with open(output_path, 'wb') as f:
        f.write(png)

os.makedirs('SafariCookieExtractor/SafariCookieExtractorExtension/images', exist_ok=True)
for size in [16, 32, 48, 64, 128]:
    path = f'SafariCookieExtractor/SafariCookieExtractorExtension/images/toolbar-icon-{size}.png'
    create_png(size, path)
    print(f"Created {path}")
EOF
```

**Step 3: Verify icons exist**

```bash
ls -la SafariCookieExtractor/SafariCookieExtractorExtension/images/
```

Expected: 5 PNG files.

**Step 4: Commit**

```bash
git add SafariCookieExtractor/SafariCookieExtractorExtension/images/
git commit -m "feat: add toolbar icons for extension"
```

---

### Task 5: Update Swift wrapper app UI

The wrapper app needs a simple screen telling users how to enable the extension.

**Files:**
- Modify: `SafariCookieExtractor/SafariCookieExtractor/ViewController.swift` (if storyboard-based)
  OR `SafariCookieExtractor/SafariCookieExtractor/ContentView.swift` (if SwiftUI-based)

**Step 1: Check which UI approach Xcode generated**

```bash
ls SafariCookieExtractor/SafariCookieExtractor/
```

**Step 2a: If SwiftUI (ContentView.swift exists), replace with:**

```swift
import SwiftUI
import SafariServices

struct ContentView: View {
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "safari")
                .font(.system(size: 48))
                .foregroundColor(.blue)

            Text("Safari Cookie Extractor")
                .font(.title)
                .fontWeight(.semibold)

            Text("Click the extension icon in Safari's toolbar to copy all cookies for the current page to your clipboard.")
                .multilineTextAlignment(.center)
                .foregroundColor(.secondary)
                .padding(.horizontal)

            Button("Open Safari Extensions Preferences") {
                SFSafariApplication.showPreferencesForExtension(
                    withIdentifier: "com.yourname.SafariCookieExtractor.Extension"
                ) { _ in }
            }
            .buttonStyle(.borderedProminent)
        }
        .padding(40)
        .frame(minWidth: 400, minHeight: 300)
    }
}
```

> Replace `com.yourname` with your actual bundle ID prefix.

**Step 2b: If storyboard-based (ViewController.swift exists), replace viewDidLoad with:**

```swift
override func viewDidLoad() {
    super.viewDidLoad()

    let label = NSTextField(wrappingLabelWithString:
        "Safari Cookie Extractor\n\nClick the extension icon in Safari's toolbar to copy all cookies for the current page.\n\nEnable in Safari → Settings → Extensions."
    )
    label.alignment = .center
    label.translatesAutoresizingMaskIntoConstraints = false
    view.addSubview(label)
    NSLayoutConstraint.activate([
        label.centerXAnchor.constraint(equalTo: view.centerXAnchor),
        label.centerYAnchor.constraint(equalTo: view.centerYAnchor),
        label.widthAnchor.constraint(lessThanOrEqualToConstant: 360)
    ])
}
```

**Step 3: Commit**

```bash
git add SafariCookieExtractor/SafariCookieExtractor/
git commit -m "feat: update wrapper app UI with enable-extension instructions"
```

---

### Task 6: Build and enable the extension in Safari

> Manual testing task — no automated tests for Safari extension behavior.

**Step 1: Build the project in Xcode**

- Open `SafariCookieExtractor.xcodeproj` in Xcode
- Select the `SafariCookieExtractor` scheme (the wrapper app target, not the extension)
- Press Cmd+B to build
- Fix any compiler errors (usually just the bundle ID in ContentView.swift)

**Step 2: Run the wrapper app**

- Press Cmd+R to run
- The app window opens with the instructions screen

**Step 3: Enable the extension in Safari**

- Open Safari → Settings (Cmd+,) → Extensions tab
- Find "SafariCookieExtractor" and check the checkbox to enable it
- Click "Allow" when prompted for permissions

**Step 4: Test the extension**

1. Navigate to any website that sets cookies (e.g. github.com, google.com)
2. Click the extension icon in Safari's toolbar
3. Verify: the ✓ badge appears on the icon for ~2 seconds
4. Open a text editor and paste (Cmd+V)
5. Verify: the pasted text is in `name=value; name2=value2` format

**Step 5: Test error case**

1. Navigate to `about:blank` (no URL, no cookies)
2. Click the extension icon
3. Verify: either ✓ badge with empty clipboard, or ✗ badge if an error is thrown

**Step 6: Final commit**

```bash
git add -A
git commit -m "feat: complete Safari Cookie Extractor extension"
```

---

## Troubleshooting

**"Cannot read clipboard" error in badge:**
Safari requires the extension to have explicit user gesture context. The `browserAction.onClicked` handler IS a user gesture, so this should work. If it fails, check that `clipboardWrite` is in manifest permissions.

**No cookies returned:**
Ensure `<all_urls>` is in the `permissions` array in manifest.json. Without it, `browser.cookies.getAll()` returns an empty array even with the `cookies` permission.

**Extension not showing in Safari:**
Make sure you ran the wrapper app (the outer target), not the extension target directly. The wrapper app registers the extension with macOS.

**Badge text doesn't appear:**
Safari may have limited badge support. As a fallback, you can use `browser.notifications.create()` for a native notification (requires adding `notifications` to permissions).
