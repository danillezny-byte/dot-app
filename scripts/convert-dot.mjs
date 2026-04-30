// Конвертер dot/*.jsx → app/src/dot/*.jsx для гибридного ESM-режима.
//
// Что делает:
// 1) Читает каждый файл из ../../dot/
// 2) Префиксит `import React from 'react';`
// 3) Добавляет в конец `Object.assign(window, { ...все top-level function-имена })`
//    с учётом исключений (коллизии Caret/Row).
// 4) Пишет результат в ../src/dot/
//
// live.jsx обрабатывается особо (см. EXCLUDE_AUTOWRAP).

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(__dirname, '../../dot');
const DST = resolve(__dirname, '../src/dot');

// Имена функций, которые НЕ надо вешать на window (коллизии)
const SKIP_WINDOW = {
  'composer-variants.jsx': new Set(['Caret']),
  'phone.jsx':             new Set(['Row']),
  'settings.jsx':          new Set(['Row']),
};

// Файлы, которые конвертер не трогает (обрабатываются отдельно)
const EXCLUDE_AUTOWRAP = new Set(['live.jsx']);

mkdirSync(DST, { recursive: true });

const files = readdirSync(SRC).filter((f) => f.endsWith('.jsx'));
let converted = 0;

for (const file of files) {
  if (EXCLUDE_AUTOWRAP.has(file)) {
    console.log(`  skip (special): ${file}`);
    continue;
  }
  const srcPath = resolve(SRC, file);
  const dstPath = resolve(DST, file);
  const code = readFileSync(srcPath, 'utf8');

  // Top-level function declarations: ^function Name(
  const fnNames = [...code.matchAll(/^function\s+([A-Z][A-Za-z0-9_]*)\s*\(/gm)]
    .map((m) => m[1]);

  const skip = SKIP_WINDOW[file] || new Set();
  const exported = fnNames.filter((n) => !skip.has(n));

  const header = `import React from 'react';\n`;
  const footer = exported.length
    ? `\n\nObject.assign(window, { ${exported.join(', ')} });\n`
    : '\n';

  writeFileSync(dstPath, header + code + footer, 'utf8');
  console.log(`  ${file}: +window {${exported.join(', ') || '(none)'}}`);
  converted += 1;
}

console.log(`\nConverted ${converted} files into ${DST}`);
