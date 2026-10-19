const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const pages = ['.', 'locations', 'generators'].flatMap(dir =>
  fs.readdirSync(path.join(root, dir))
    .filter(file => file.endsWith('.html'))
    .map(file => path.join(dir, file)));
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('public pages reference existing local assets, including the current navigation script', () => {
  for (const file of pages) {
    const html = read(file);
    for (const tag of html.matchAll(/<(?:script|img|link)\b[^>]*>/g)) {
      const reference = tag[0].match(/(?:src|href)="([^"]+)"/);
      if (!reference || /^(?:https?:|data:)/.test(reference[1])) continue;
      const asset = reference[1].split(/[?#]/)[0];
      const resolved = asset.startsWith('/')
        ? path.join(root, asset.slice(1))
        : path.resolve(root, path.dirname(file), asset);
      assert.ok(fs.existsSync(resolved), `${file}: missing ${asset}`);
    }
    assert.match(html, /<script defer src="\/js\/design\.js"><\/script>/, file);
  }
});

test('generator guidance makes warranty and capacity dependent on the selected equipment and loads', () => {
  for (const file of ['generators.html', 'generators/standby.html']) {
    const html = read(file);
    assert.doesNotMatch(html, /5-year comprehensive|sq ft|Maximum residential power/i, file);
    assert.match(html, /limited warranty/i, file);
    assert.match(html, /model[^<.]{0,100}(?:coverage|terms)|(?:coverage|terms)[^<.]{0,100}model/i, file);
    assert.match(html, /(?:electrical|starting|running) loads?/i, file);
    assert.match(html, /https:\/\/www\.generac\.com\/resources\/home-management\/what-size-generator-do-i-need\//, file);
  }
});
