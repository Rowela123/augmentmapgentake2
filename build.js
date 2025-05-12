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

// Create directory for JS files
if (!fs.existsSync('build/js')) {
  fs.mkdirSync('build/js');
}

// Copy map-generator.js to js directory as well
try {
  const mapGeneratorContent = fs.readFileSync('public/js/map-generator.js', 'utf8');
  fs.writeFileSync('build/js/map-generator.js', mapGeneratorContent);
  console.log('Successfully copied map-generator.js to build/js directory');
} catch (error) {
  console.error('Error copying map-generator.js to js directory:', error);
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
  // Try to use the redirect version first
  const indexContent = fs.readFileSync('public/index-redirect.html', 'utf8');
  fs.writeFileSync('build/index.html', indexContent);
  console.log('Successfully copied index-redirect.html to build/index.html');
} catch (error) {
  try {
    // Fall back to the original index.html
    const indexContent = fs.readFileSync('public/index.html', 'utf8');
    fs.writeFileSync('build/index.html', indexContent);
    console.log('Successfully copied index.html to build directory');
  } catch (fallbackError) {
    console.error('Error copying index.html:', fallbackError);
  }
}

// Copy map-generator.html from take2 to build
try {
  const mapGeneratorHtmlContent = fs.readFileSync('take2/map-generator.html', 'utf8');
  fs.writeFileSync('build/map-generator.html', mapGeneratorHtmlContent);
  console.log('Successfully copied map-generator.html to build directory');
} catch (error) {
  console.error('Error copying map-generator.html:', error);
}

// Copy direct-map.html to build
try {
  const directMapContent = fs.readFileSync('public/direct-map.html', 'utf8');
  fs.writeFileSync('build/direct-map.html', directMapContent);
  console.log('Successfully copied direct-map.html to build directory');
} catch (error) {
  console.error('Error copying direct-map.html:', error);
}

// Copy standalone-map.html to build
try {
  const standaloneMapContent = fs.readFileSync('public/standalone-map.html', 'utf8');
  fs.writeFileSync('build/standalone-map.html', standaloneMapContent);
  console.log('Successfully copied standalone-map.html to build directory');
} catch (error) {
  console.error('Error copying standalone-map.html:', error);
}

console.log('Build process completed successfully');
