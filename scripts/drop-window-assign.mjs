// Phase 5 ESM-миграции: убирает все `Object.assign(window, { ... })` блоки
// из dot/*-файлов. Запускать после Phase 4-full когда все потребители
// уже импортят через ESM.
//
// Запуск: `node scripts/drop-window-assign.mjs`

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(__dirname, '../src/dot');

const files = readdirSync(SRC).filter((f) => f.endsWith('.jsx'));

let touched = 0;
for (const file of files) {
  const path = resolve(SRC, file);
  let code = readFileSync(path, 'utf8');

  // Удаляем многострочные `Object.assign(window, { A, B, C });` целиком,
  // включая комментарий «Дуальный режим...» если он есть выше.
  let next = code.replace(
    /\/\/ Дуальный режим[^\n]*\n(\/\/[^\n]*\n)?Object\.assign\(window,\s*\{[^}]*\}\s*\)\s*;?\n?/g,
    ''
  );
  // Если без комментария — просто Object.assign блок
  next = next.replace(/^Object\.assign\(window,\s*\{[^}]*\}\s*\)\s*;?\n?/gm, '');
  // Также чистим const _exports = {...}; Object.assign(window, _exports);
  next = next.replace(/const _exports = \{[^}]*\};\s*\n?Object\.assign\(window,\s*_exports\)\s*;?\n?/g, '');
  // Лишние пустые строки в конце
  next = next.replace(/\n{3,}$/, '\n\n').replace(/\n+$/, '\n');

  if (next !== code) {
    writeFileSync(path, next, 'utf8');
    console.log(`  ok: ${file}`);
    touched += 1;
  } else {
    console.log(`  skip: ${file} (no change)`);
  }
}
console.log(`\nDone. Touched ${touched} files.`);
