const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {gzipSync} = require('node:zlib');
const root = path.resolve(__dirname, '..');
const budgets = {'css/main.css': 13500, 'js/analytics.js': 4600, 'js/generator-tabs.js': 1400};

test('shipped shared assets stay compact and smaller than their readable sources', () => {
  for (const [file, maximum] of Object.entries(budgets)) {
    const shipped = fs.readFileSync(path.join(root, file));
    assert.ok(shipped.length <= maximum, `${file}: ${shipped.length} bytes exceeds ${maximum}-byte budget`);
    const source = fs.readFileSync(path.join(root, 'assets-src', file));
    assert.ok(gzipSync(shipped).length < gzipSync(source).length, `${file}: minification must also reduce compressed bytes`);
  }
});

test('pages keep using production assets rather than readable authoring copies', () => {
  const pages = ['', 'locations', 'generators'].flatMap(directory =>
    fs.readdirSync(path.join(root, directory)).filter(file => file.endsWith('.html'))
      .map(file => path.join(directory, file)));
  for (const file of pages) {
    assert.doesNotMatch(fs.readFileSync(path.join(root, file), 'utf8'), /(?:src|href)="[^"]*assets-src\//, file);
  }
});
