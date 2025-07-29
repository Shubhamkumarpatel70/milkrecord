const fs = require('fs');
const path = require('path');

// Create a simple SVG icon for the milk record app
const createSVGIcon = (size) => {
  const scale = size / 512;
  const fontSize = Math.max(12, Math.floor(24 * scale));
  const textY1 = Math.floor(420 * scale);
  const textY2 = Math.floor(450 * scale);
  
  return `<svg width="${size}" height="${size}" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background circle -->
  <circle cx="256" cy="256" r="240" fill="#4F46E5"/>
  
  <!-- Milk bottle -->
  <path d="M200 120h112c8.8 0 16 7.2 16 16v200c0 8.8-7.2 16-16 16H200c-8.8 0-16-7.2-16-16V136c0-8.8 7.2-16 16-16z" fill="white"/>
  <path d="M200 120h112v-20c0-8.8-7.2-16-16-16H216c-8.8 0-16 7.2-16 16v20z" fill="#E5E7EB"/>
  
  <!-- Milk level -->
  <rect x="208" y="280" width="96" height="40" fill="#FEF3C7" rx="4"/>
  
  <!-- Chart bars -->
  <rect x="220" y="340" width="16" height="60" fill="#10B981" rx="2"/>
  <rect x="244" y="320" width="16" height="80" fill="#10B981" rx="2"/>
  <rect x="268" y="300" width="16" height="100" fill="#10B981" rx="2"/>
  <rect x="292" y="280" width="16" height="120" fill="#10B981" rx="2"/>
  
  <!-- Drop icon -->
  <path d="M256 180c-8.8 0-16 7.2-16 16 0 8.8 16 40 16 40s16-31.2 16-40c0-8.8-7.2-16-16-16z" fill="#3B82F6"/>
  
  <!-- App name - only show on larger icons -->
  ${size >= 128 ? `<text x="256" y="${textY1}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold">MILK</text>` : ''}
  ${size >= 128 ? `<text x="256" y="${textY2}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold">RECORD</text>` : ''}
</svg>`;
};

// Icon sizes needed for PWA
const iconSizes = [16, 32, 48, 72, 96, 128, 144, 152, 192, 384, 512];

console.log('Generating icons for Milk Record App...');

// Generate SVG icons
iconSizes.forEach(size => {
  const svgContent = createSVGIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  fs.writeFileSync(path.join(__dirname, filename), svgContent);
  console.log(`Created ${filename}`);
});

// Create a simple favicon.ico replacement (SVG)
const faviconSVG = createSVGIcon(32);
fs.writeFileSync(path.join(__dirname, 'favicon.svg'), faviconSVG);
console.log('Created favicon.svg');

// Update the manifest.json with new icon references
const manifest = {
  "short_name": "MILK RECORD",
  "name": "Milk Record Management App",
  "description": "Track and manage your milk production records",
  "icons": [
    {
      "src": "favicon.svg",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "any"
    },
    {
      "src": "icon-16x16.svg",
      "type": "image/svg+xml",
      "sizes": "16x16",
      "purpose": "any"
    },
    {
      "src": "icon-32x32.svg",
      "type": "image/svg+xml",
      "sizes": "32x32",
      "purpose": "any"
    },
    {
      "src": "icon-48x48.svg",
      "type": "image/svg+xml",
      "sizes": "48x48",
      "purpose": "any"
    },
    {
      "src": "icon-72x72.svg",
      "type": "image/svg+xml",
      "sizes": "72x72",
      "purpose": "any"
    },
    {
      "src": "icon-96x96.svg",
      "type": "image/svg+xml",
      "sizes": "96x96",
      "purpose": "any"
    },
    {
      "src": "icon-128x128.svg",
      "type": "image/svg+xml",
      "sizes": "128x128",
      "purpose": "any"
    },
    {
      "src": "icon-144x144.svg",
      "type": "image/svg+xml",
      "sizes": "144x144",
      "purpose": "any"
    },
    {
      "src": "icon-152x152.svg",
      "type": "image/svg+xml",
      "sizes": "152x152",
      "purpose": "any"
    },
    {
      "src": "icon-192x192.svg",
      "type": "image/svg+xml",
      "sizes": "192x192",
      "purpose": "any"
    },
    {
      "src": "icon-384x384.svg",
      "type": "image/svg+xml",
      "sizes": "384x384",
      "purpose": "any"
    },
    {
      "src": "icon-512x512.svg",
      "type": "image/svg+xml",
      "sizes": "512x512",
      "purpose": "any"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#4F46E5",
  "background_color": "#ffffff",
  "orientation": "portrait",
  "scope": "/",
  "lang": "en",
  "categories": ["business", "productivity", "utilities"],
  "screenshots": [
    {
      "src": "screenshot-wide.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "screenshot-narrow.png",
      "sizes": "750x1334",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ]
};

fs.writeFileSync(path.join(__dirname, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('Updated manifest.json');

console.log('\nIcon generation complete!');
console.log('To convert SVG to PNG, you can use online tools or image editing software.');
console.log('For the best results, convert the SVG files to PNG with the same dimensions.'); 