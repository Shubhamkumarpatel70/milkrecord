const fs = require('fs');
const path = require('path');

console.log('🔍 Debugging build process...');
console.log('Current directory:', process.cwd());
console.log('Files in current directory:');
console.log(fs.readdirSync('.'));

console.log('\n📁 Checking src directory...');
if (fs.existsSync('src')) {
  console.log('src directory exists');
  console.log('Files in src:', fs.readdirSync('src'));
  
  if (fs.existsSync('src/index.js')) {
    console.log('✅ index.js found in src/');
    console.log('File size:', fs.statSync('src/index.js').size);
  } else {
    console.log('❌ index.js NOT found in src/');
  }
} else {
  console.log('❌ src directory does not exist');
}

console.log('\n📁 Checking public directory...');
if (fs.existsSync('public')) {
  console.log('public directory exists');
  console.log('Files in public:', fs.readdirSync('public'));
} else {
  console.log('❌ public directory does not exist');
}

console.log('\n📄 Checking package.json...');
if (fs.existsSync('package.json')) {
  console.log('✅ package.json found');
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log('Scripts:', Object.keys(pkg.scripts));
} else {
  console.log('❌ package.json not found');
} 