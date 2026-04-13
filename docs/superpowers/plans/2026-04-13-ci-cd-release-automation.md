# CI/CD Release Automation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement GitHub Actions workflow that automatically builds both Safari and Chrome extensions on every push to main, then creates releases with semantic versioning.

**Architecture:** Single workflow file with two sequential jobs: `build` (parallel Safari + Chrome steps) and `release` (versioning + GitHub release creation). Uses conventional-changelog-action to analyze commits for semver bumps.

**Tech Stack:** GitHub Actions, xcodebuild (macOS), npm, conventional-changelog-action

---

### Task 1: Create workflow file and build job structure

**Files:**
- Create: `.github/workflows/build-and-release.yml`

- [ ] **Step 1: Create workflow file**

```bash
mkdir -p .github/workflows
cat > .github/workflows/build-and-release.yml << 'EOF'
name: Build and Release

on:
  push:
    branches: [main]

jobs:
  build:
    name: Build Extensions
    runs-on: macos-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install npm dependencies
        run: npm install
EOF
```

- [ ] **Step 2: Verify file was created**

```bash
ls -la .github/workflows/build-and-release.yml
head -20 .github/workflows/build-and-release.yml
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/build-and-release.yml
git commit -m "chore: create GitHub Actions workflow file"
```

---

### Task 2: Add Safari build step to workflow

**Files:**
- Modify: `.github/workflows/build-and-release.yml`

- [ ] **Step 1: Add Safari build step**

Append this to the `steps:` section of the `build` job:

```bash
cat >> .github/workflows/build-and-release.yml << 'EOF'

      - name: Build Safari Extension
        run: |
          cd src/safari/SafariCookieExtractor
          xcodebuild -scheme SafariCookieExtractor -configuration Release -derivedDataPath build/Release
          
      - name: Archive Safari app
        run: |
          cd src/safari/SafariCookieExtractor/build/Release
          zip -r ../../../SafariCookieExtractor.app.zip Products/Release/SafariCookieExtractor.app
EOF
```

- [ ] **Step 2: Verify the Safari steps were added**

```bash
grep -A 5 "Build Safari Extension" .github/workflows/build-and-release.yml
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/build-and-release.yml
git commit -m "feat: add Safari extension build step"
```

---

### Task 3: Add Chrome build step to workflow

**Files:**
- Modify: `.github/workflows/build-and-release.yml`

- [ ] **Step 1: Add Chrome build step**

Append this after the Safari steps (before artifact upload):

```bash
cat >> .github/workflows/build-and-release.yml << 'EOF'

      - name: Build Chrome Extension
        run: npm run build:chrome
EOF
```

- [ ] **Step 2: Verify Chrome step was added**

```bash
grep -A 2 "Build Chrome Extension" .github/workflows/build-and-release.yml
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/build-and-release.yml
git commit -m "feat: add Chrome extension build step"
```

---

### Task 4: Add artifact upload step

**Files:**
- Modify: `.github/workflows/build-and-release.yml`

- [ ] **Step 1: Add artifact uploads**

Append this after the Chrome build step:

```bash
cat >> .github/workflows/build-and-release.yml << 'EOF'

      - name: Upload Safari artifact
        uses: actions/upload-artifact@v4
        with:
          name: safari-extension
          path: src/safari/SafariCookieExtractor.app.zip
          retention-days: 5

      - name: Upload Chrome artifact
        uses: actions/upload-artifact@v4
        with:
          name: chrome-extension
          path: chrome-extension-release.zip
          retention-days: 5
EOF
```

- [ ] **Step 2: Verify artifact steps were added**

```bash
grep -A 3 "Upload Safari artifact" .github/workflows/build-and-release.yml
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/build-and-release.yml
git commit -m "feat: add artifact upload steps"
```

---

### Task 5: Add release job with versioning

**Files:**
- Modify: `.github/workflows/build-and-release.yml`

- [ ] **Step 1: Add release job**

Append this to the end of the file (after the `build` job):

```bash
cat >> .github/workflows/build-and-release.yml << 'EOF'

  release:
    name: Create Release
    needs: build
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Conventional Changelog
        id: changelog
        uses: TriPSs/conventional-changelog-action@v4
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          version-file: 'package.json'
          version-path: 'version'
          create-summary: true
          skip-on-empty: false

      - name: Download Safari artifact
        uses: actions/download-artifact@v4
        with:
          name: safari-extension

      - name: Download Chrome artifact
        uses: actions/download-artifact@v4
        with:
          name: chrome-extension

      - name: Create GitHub Release
        if: steps.changelog.outputs.skipped == 'false'
        uses: softprops/action-gh-release@v1
        with:
          tag_name: ${{ steps.changelog.outputs.tag }}
          body: ${{ steps.changelog.outputs.clean_changelog }}
          files: |
            SafariCookieExtractor.app.zip
            chrome-extension-release.zip
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
EOF
```

- [ ] **Step 2: Verify release job was added**

```bash
grep -A 10 "release:" .github/workflows/build-and-release.yml
```

- [ ] **Step 3: Verify the full workflow file is valid YAML**

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/build-and-release.yml'))" && echo "✓ Valid YAML"
```

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/build-and-release.yml
git commit -m "feat: add release job with semantic versioning"
```

---

### Task 6: Verify complete workflow file

**Files:**
- Verify: `.github/workflows/build-and-release.yml`

- [ ] **Step 1: Display complete workflow file**

```bash
cat .github/workflows/build-and-release.yml
```

Expected: Two jobs (`build` and `release`), build job has Safari + Chrome steps with artifact uploads, release job uses conventional-changelog-action.

- [ ] **Step 2: Verify key elements are present**

```bash
grep -c "name: Build and Release" .github/workflows/build-and-release.yml  # Should be 1
grep -c "jobs:" .github/workflows/build-and-release.yml  # Should be 1
grep -c "build:" .github/workflows/build-and-release.yml  # Should be 1
grep -c "release:" .github/workflows/build-and-release.yml  # Should be 1
grep -c "xcodebuild" .github/workflows/build-and-release.yml  # Should be 1
grep -c "npm run build:chrome" .github/workflows/build-and-release.yml  # Should be 1
```

All should match expected counts.

- [ ] **Step 3: Verify permissions are set for release job**

```bash
grep -A 2 "release:" .github/workflows/build-and-release.yml | grep "permissions:"
# Expected: permissions: contents: write
```

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: complete GitHub Actions CI/CD workflow setup"
```

---

## Plan Summary

This plan:
1. Creates the GitHub Actions workflow file (`.github/workflows/build-and-release.yml`)
2. Adds Safari build step using xcodebuild (unsigned)
3. Adds Chrome build step using npm script
4. Adds artifact upload for both
5. Adds release job with:
   - Conventional commits analysis for semantic versioning
   - Automatic package.json version bumping
   - GitHub release creation with artifacts attached
6. Verifies the complete workflow is valid

The workflow will automatically:
- Build both extensions on every push to main
- Create a GitHub release with new version tag
- Attach both artifacts to the release
- Update package.json with new version
