const fs = require('fs');
const path = require('path');

const DIST_DIR = path.resolve(__dirname, '../dist');
const LEGACY_DIR = path.resolve(__dirname, '../legacy');
const INDEX_HTML = path.join(DIST_DIR, 'index.html');
const INDEX_GAS = path.join(DIST_DIR, 'Index.html');

console.log('Preparing for Google Apps Script deployment...');

// 1. Process index.html to inject the printlet check
if (fs.existsSync(INDEX_HTML)) {
    let html = fs.readFileSync(INDEX_HTML, 'utf8');

    // We need to inject the script that sets window.SERVER_DATA from the printlet
    // The printlet <?!= injectedData ?> is replaced by GAS on the server side with the base64 string.
    // We wrap it in quotes to make it a JS string literal.
    const injectionScript = `
  <script>
    // Injected by GAS
    window.SERVER_DATA = "<?!= injectedData ?>";
  </script>
  `;

    // Insert before </head>
    html = html.replace('</head>', `${injectionScript}\n</head>`);

    // Write to Index.html (capitalized for consistency with legacy Code.gs)
    fs.writeFileSync(INDEX_GAS, html);
    console.log('✓ Created dist/Index.html with data injection');

    // Remove original index.html to avoid confusion? No, keep it.
} else {
    console.error('Error: dist/index.html not found. Run npm run build first.');
    process.exit(1);
}

// 2. Copy Code.gs from legacy
const codeGsPath = path.join(LEGACY_DIR, 'Code.gs');
if (fs.existsSync(codeGsPath)) {
    // Clasp expects .js locally which it pushes as .gs
    fs.copyFileSync(codeGsPath, path.join(DIST_DIR, 'Code.js'));
    console.log('✓ Copied Code.gs to dist/Code.js');
} else {
    console.error('Error: legacy/Code.gs not found.');
}

// 3. Copy appsscript.json from legacy
const appsscriptJsonPath = path.join(LEGACY_DIR, 'appsscript.json');
if (fs.existsSync(appsscriptJsonPath)) {
    fs.copyFileSync(appsscriptJsonPath, path.join(DIST_DIR, 'appsscript.json'));
    console.log('✓ Copied appsscript.json to dist/appsscript.json');
} else {
    console.warn('Warning: legacy/appsscript.json not found. You may need to create it or `clasp clone`.');
}

// 4. Copy .clasp.json from legacy
const claspJsonPath = path.join(LEGACY_DIR, '.clasp.json');
if (fs.existsSync(claspJsonPath)) {
    fs.copyFileSync(claspJsonPath, path.join(DIST_DIR, '.clasp.json'));
    console.log('✓ Copied .clasp.json to dist/.clasp.json');
} else {
    console.warn('Warning: legacy/.clasp.json not found. Clasp commands may fail.');
}

console.log('--------------------------------------------------');
console.log('Deployment preparation complete.');
console.log('To deploy, run:');
console.log('  cd dist');
console.log('  clasp push');
console.log('--------------------------------------------------');
