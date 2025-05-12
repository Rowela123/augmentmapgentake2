const fs = require('fs');
const path = require('path');

// Create build directory if it doesn't exist
if (!fs.existsSync('build')) {
  fs.mkdirSync('build');
}

// Create directories for static files
if (!fs.existsSync('build/static')) {
  fs.mkdirSync('build/static');
}

// Copy map-generator.js from take2 to build
try {
  const mapGeneratorContent = fs.readFileSync('take2/map-generator.js', 'utf8');
  fs.writeFileSync('build/map-generator.js', mapGeneratorContent);
  console.log('Successfully copied map-generator.js to build directory');
} catch (error) {
  console.error('Error copying map-generator.js:', error);
}

// Copy embed.html from temp-newmapgenerator to build
try {
  const embedContent = fs.readFileSync('temp-newmapgenerator/embed.html', 'utf8');
  fs.writeFileSync('build/embed.html', embedContent);
  console.log('Successfully copied embed.html to build directory');
} catch (error) {
  console.error('Error copying embed.html:', error);
}

// Copy index.html to build
try {
  const indexContent = fs.readFileSync('public/index.html', 'utf8');
  fs.writeFileSync('build/index.html', indexContent);
  console.log('Successfully copied index.html to build directory');
} catch (error) {
  console.error('Error copying index.html:', error);
}

console.log('Build process completed successfully');
