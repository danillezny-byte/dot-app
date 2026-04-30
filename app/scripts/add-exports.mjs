// Phase 1 ESM-миграции: автоматически дописывает `export { ... }` ко всем
// dot/*-файлам которые имеют `Object.assign(window, { A, B, C })` в конце.
// Дуальный режим: window-globals остаются для не-конвертированных потребителей,
// export добавляется для нового кода.
//
// Запуск: `node app/scripts/add-exports.mjs`

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(__dirname, '../src/dot');

// Файлы которые мы НЕ трогаем (особые случаи или уже сделаны)
const SKIP = new Set([
  'tokens.jsx',          // уже сделано вручную
  'phone.jsx',           // уже сделано вручную
  'keyboard.jsx',        // уже сделано вручную
  'icons.jsx',           // уже сделано вручную
  'live.jsx',            // особый случай — отдельный handle
  // IIFE-файлы будут обработаны в Phase 3 — у них window-attach внутри IIFE,
  // нужна полная распаковка.
  'task-pickers.jsx',
  'habit-pickers.jsx',
  'settings-deep.jsx',
  'settings-deep2.jsx',
  'note-blocks.jsx',
  // Не используется в live-режиме.
  'flow-diagram.jsx',
]);

const files = readdirSync(SRC).filter((f) => f.endsWith('.jsx') && !SKIP.has(f));

let touched = 0;
for (const file of files) {
  const path = resolve(SRC, file);
  let code = readFileSync(path, 'utf8');

  if (code.includes('export {')) {
    console.log(`  skip (already exported): ${file}`);
    continue;
  }

  // Ищем последний Object.assign(window, { ... }); перед которым ничего значимого.
  // Чистим дубли, оставляем один + добавляем export.
  const re = /Object\.assign\(window,\s*\{\s*([^}]+)\}\s*\)\s*;?\s*$/m;
  const lastMatch = [...code.matchAll(/Object\.assign\(window,\s*\{\s*([^}]+)\}\s*\)\s*;?/g)].pop();
  if (!lastMatch) {
    console.log(`  no window.assign: ${file}`);
    continue;
  }

  // Имена из последнего assign (там самый полный список в наших файлах).
  const namesRaw = lastMatch[1];
  const names = namesRaw.split(',').map((n) => n.trim()).filter(Boolean);

  // Удаляем ВСЕ Object.assign(window, { ... }) и добавляем один + export в конец.
  let cleaned = code.replace(/Object\.assign\(window,\s*\{[^}]+\}\s*\)\s*;?\s*\n?/g, '');
  // Снять лишние пустые строки в конце
  cleaned = cleaned.replace(/\n+$/, '\n');

  const block = [
    '',
    '// Дуальный режим во время ESM-миграции: window для legacy, export для нового кода.',
    `Object.assign(window, { ${names.join(', ')} });`,
    `export { ${names.join(', ')} };`,
    '',
  ].join('\n');

  writeFileSync(path, cleaned + block, 'utf8');
  console.log(`  ok: ${file} — exports {${names.join(', ')}}`);
  touched += 1;
}
console.log(`\nDone. Touched ${touched} files.`);
