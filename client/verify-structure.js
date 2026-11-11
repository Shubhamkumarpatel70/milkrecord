const fs = require('fs');
const path = require('path');

console.log('Current directory:', process.cwd());
console.log('Files in current directory:');
fs.readdirSync('.').forEach(file => {
  console.log('  -', file);
});

console.log('\nFiles in src directory:');
if (fs.existsSync('src')) {
  fs.readdirSync('src').forEach(file => {
    console.log('  -', file);
  });
} else {
  console.log('  src directory does not exist!');
}

console.log('\nChecking for index.js:');
const indexPath = path.join('src', 'index.js');
if (fs.existsSync(indexPath)) {
  console.log('  index.js found at:', indexPath);
  console.log('  File size:', fs.statSync(indexPath).size, 'bytes');
} else {
  console.log('  index.js NOT found at:', indexPath);
} 