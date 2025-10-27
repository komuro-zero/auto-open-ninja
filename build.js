const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Files to include in the extension ZIP
const files = [
  'manifest.json',
  'background.js',
  'popup.html',
  'popup.js',
  'popup.css',
  // Add icon files if they exist
  'icon16.png',
  'icon32.png',
  'icon48.png',
  'icon128.png'
];

// Create a temporary directory for the extension files
const tempDir = path.join(__dirname, 'temp-extension');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Copy files to temp directory
files.forEach(file => {
  const src = path.join(__dirname, file);
  const dest = path.join(tempDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
});

// Create ZIP
const zipPath = path.join(__dirname, 'auto-open-ninja.zip');
try {
  execSync(`cd ${tempDir} && zip -r ../auto-open-ninja.zip .`);
  console.log('Extension ZIP updated successfully.');
} catch (error) {
  console.error('Error creating ZIP:', error);
}

// Clean up temp directory
fs.rmSync(tempDir, { recursive: true, force: true });