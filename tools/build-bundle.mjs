import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const files = [
  'config.js', 'utils.js', 'genetics.js', 'spatial-grid.js', 'storage.js', 'knowledge.js', 'workshop.js', 'society.js', 'civilization.js', 'legacy.js', 'grand-projects.js',
  'creature.js', 'simulation.js', 'eldritch-sprites.js', 'renderer.js', 'ui.js', 'app.js'
];

const parts = [];
for (const file of files) {
  let source = await readFile(resolve(root, 'js', file), 'utf8');
  source = source.replace(/^import .*?;\s*$/gm, '');
  source = source.replace(/\bexport\s+(?=(?:async\s+)?(?:class|function|const|let|var)\b)/g, '');
  parts.push(`\n/* ===== ${file} ===== */\n${source.trim()}\n`);
}

const banner = `/* Proyecto Génesis Ω v6.0.2 — Grandes Proyectos bundle generado. No editar directamente. */\n`;
const bundle = `${banner}(() => {\n'use strict';\n${parts.join('\n')}\n})();\n`;
await writeFile(resolve(root, 'js', 'app.bundle.js'), bundle, 'utf8');
console.log('Bundle generado:', resolve(root, 'js', 'app.bundle.js'));
