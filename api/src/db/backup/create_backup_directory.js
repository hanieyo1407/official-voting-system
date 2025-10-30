// Quick script to create backup directory
const fs = require('fs');
const path = require('path');

const backupDir = path.join(__dirname, 'files');

try {
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
    console.log('✅ Backup directory created:', backupDir);
  } else {
    console.log('✅ Backup directory already exists:', backupDir);
  }
} catch (error) {
  console.error('❌ Failed to create backup directory:', error.message);
}