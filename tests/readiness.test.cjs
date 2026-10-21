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
    if (/warranty/i.test(html)) assert.match(html, /(?:coverage|terms)[^<.]{0,100}model|model[^<.]{0,100}(?:coverage|terms)/i, file);
    assert.match(html, /(?:selected|connected) loads|each load|extra power[^<.]*start/i, file);
    assert.match(html, /maintenance|regular service/i, file);
    assert.match(html, /https:\/\/www\.generac\.com\/resources\/home-management\/what-size-generator-do-i-need\//, file);
  }
});

test('grounding guidance distinguishes the electrode system from the fault-current return path', () => {
  for (const file of ['electrical-panel-upgrade.html', 'grounding-and-bonding.html']) {
    const html = read(file);
    assert.doesNotMatch(html, /infinite electrical sink|Fault current has a low-resistance path to dissipate|Lightning energy spreads out harmlessly|Using water pipes instead of proper ground rods/, file);
    assert.doesNotMatch(html, /ground rod[^<.]*replaces?[^<.]*bonding|water pipes[^<.]*never[^<.]*grounding/i, file);
  }
  const grounding=read('grounding-and-bonding.html');
  assert.match(grounding, /back to the electrical source[\s\S]{0,200}breaker or fuse/);
  assert.match(grounding, /don't rely on current traveling through the soil to trip the breaker/i);
  assert.match(grounding, /ground rod alone won't make faulty wiring safe/i);
  assert.match(read('electrical-panel-upgrade.html'), /href="grounding-and-bonding.html"/);
});
