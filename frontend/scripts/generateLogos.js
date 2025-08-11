const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Create a 512x512 blue square with a white school icon
async function generateLogos() {
  // Create base SVG with school icon
  const svg = `
    <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <rect width="512" height="512" fill="#1976d2"/>
      <path d="M256 48l192 88v128c0 97-76 176-192 208-116-32-192-111-192-208V136l192-88zm0 38L107 164v100c0 72 57 132 149 156 92-24 149-84 149-156V164L256 86z" fill="white"/>
      <path d="M256 192c35 0 64 29 64 64s-29 64-64 64-64-29-64-64 29-64 64-64z" fill="white"/>
    </svg>
  `;
  // Save SVG to a buffer
  const svgBuffer = Buffer.from(svg);

  const publicDir = path.join(__dirname, '..', 'public');

  // Make sure the public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Generate logo512.png
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'logo512.png'));
  // Generate logo192.png
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'logo192.png'));
  // Generate favicon.png (32x32)
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));

  console.log('Logo files generated successfully!');
}

generateLogos().catch(console.error);
