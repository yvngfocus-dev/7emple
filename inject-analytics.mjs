import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, extname } from 'path';

const TAG = `  <script src="/analytics.js" defer></script>\n</head>`;

function processDir(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory() && !['node_modules', '.git', 'brand_assets', 'images'].includes(entry.name)) {
      processDir(full);
    } else if (entry.isFile() && extname(entry.name) === '.html') {
      const src = readFileSync(full, 'utf8');
      if (src.includes('analytics.js')) { console.log(`  skip: ${full}`); continue; }
      const updated = src.replace('</head>', TAG);
      if (updated === src) { console.log(`  no </head>: ${full}`); continue; }
      writeFileSync(full, updated, 'utf8');
      console.log(`✓ ${full}`);
    }
  }
}

processDir('.');
