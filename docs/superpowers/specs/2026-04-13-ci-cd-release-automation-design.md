# CI/CD Release Automation Design

**Date:** 2026-04-13  
**Scope:** GitHub Actions workflow for automated builds and releases of both Safari and Chrome extensions  
**Versioning:** Semantic versioning with conventional commits analysis  
**Build Artifacts:** Unsigned Safari app (.zip) and Chrome extension (.zip)

---

## Overview

Implement GitHub Actions CI/CD that automatically builds both extensions on every push to main, then creates GitHub releases with semantic versioning based on commit messages. Safari builds unsigned (developer account expired), Chrome builds via npm script.

---

## Workflow Structure

**File:** `.github/workflows/build-and-release.yml`

**Trigger:** Every push to `main` branch

**Two Sequential Jobs:**

### Job 1: Build (Parallel Steps)

Runs on `macos-latest` (required for Xcode and native tools)

**Parallel Step A: Build Safari**
- Check out code
- Install Xcode dependencies
- Build unsigned Safari app: `xcodebuild -scheme SafariCookieExtractor -configuration Release -derivedDataPath build/Release`
- Archive to `SafariCookieExtractor.app.zip`
- ~3-5 minutes

**Parallel Step B: Build Chrome**
- Check out code
- Install Node.js
- Run `npm run build:chrome`
- Already outputs `chrome-extension-release.zip`
- ~1-2 minutes

**After Both Complete:**
- Upload `SafariCookieExtractor.app.zip` as artifact
- Upload `chrome-extension-release.zip` as artifact
- These artifacts available in GitHub UI and for next job

**Failure Handling:**
- If either build fails, stop immediately
- No release created
- GitHub notifies on failure

### Job 2: Release

Runs after `build` succeeds. Needs: `write` permission on repository.

**Steps:**

1. **Download Artifacts**
   - Fetch both zips from build job to workspace

2. **Determine Version**
   - Use `conventional-changelog-action` to analyze commits since last release
   - Rules:
     - `feat:` prefix → minor version bump (1.0.0 → 1.1.0)
     - `fix:` prefix → patch version bump (1.0.0 → 1.0.1)
     - `chore:` prefix → no version change
   - Generate new tag (e.g., `v1.1.0`)
   - Generate release notes from commit messages

3. **Update package.json**
   - Bump `version` field in `package.json` to new release version
   - Commit with message: "chore: bump version to X.Y.Z"
   - Push commit back to main

4. **Create GitHub Release**
   - Create release with tag (e.g., `v1.1.0`)
   - Use generated release notes
   - Attach both artifacts:
     - `SafariCookieExtractor.app.zip`
     - `chrome-extension-release.zip`
   - Mark as latest release

**Failure Handling:**
- If no commits since last release: skip gracefully (no version bump)
- If versioning fails: workflow stops, artifacts still available as build artifacts
- If release creation fails: workflow stops, GitHub notifies

---

## Artifacts & Distribution

**Safari Artifact:** `SafariCookieExtractor.app.zip`
- Unsigned macOS app bundle
- Users download, extract, manually allow in security settings (or grant Gatekeeper exception)
- Requires macOS 13+

**Chrome Artifact:** `chrome-extension-release.zip`
- Ready-to-load unpacked extension
- Users extract and load via `chrome://extensions`
- Includes manifest, background.js, popup.html/js, icons, locales

Both artifacts available at GitHub Releases page and accessible via direct download links.

---

## Notifications & Debugging

**Automatic Notifications:**
- GitHub notifies on workflow success/failure
- Notifications appear in repo settings, email, or GitHub notifications

**Manual Re-run:**
- If workflow fails, click "Re-run" in GitHub Actions UI
- No manual rebuilding needed

**Logs:**
- Full build logs visible in Actions tab
- Each job and step logs available for debugging

---

## Requirements Met

✅ Automatic builds on every push to main  
✅ Parallel Safari and Chrome builds  
✅ Semantic versioning from conventional commits  
✅ Unsigned Safari app (no developer account needed)  
✅ GitHub release creation with artifacts  
✅ Error handling for build/release failures  
✅ Version tracking in package.json

---

## Future Enhancements (Out of Scope)

- Code signing when developer account is renewed
- DMG installer for Safari
- Slack/email notifications
- Pre-release/beta releases
- Automated testing before release
