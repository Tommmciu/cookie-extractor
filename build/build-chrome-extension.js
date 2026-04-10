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
