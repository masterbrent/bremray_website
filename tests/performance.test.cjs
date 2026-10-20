const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const publicPages = ['', 'locations', 'generators'].flatMap(directory =>
  fs.readdirSync(path.join(root, directory)).filter(file => file.endsWith('.html'))
    .map(file => path.join(directory, file)));

test('pages use system or self-hosted fonts without external font requests', () => {
  assert.match(read('css/site.css'), /@font-face/);
  for (const file of publicPages) {
    const html = read(file);
    assert.doesNotMatch(html, /https:\/\/fonts\.(?:googleapis|gstatic)\.com/, file);
    const stylesheets = [...html.matchAll(/<link\b[^>]*\brel="stylesheet"[^>]*>/g)].map(match => match[0]);
    assert.equal(stylesheets.filter(tag=>tag.includes('/css/site.css')).length,1,file);
    assert.doesNotMatch(html,/\/css\/(?:main|design|type|type-content|fonts)\.css/,file);
  }
});

test('first service images have early priority without lazy loading or altered source images', () => {
  const sources = {
    'residential-electrical.html': '/images/home-phone-v2.jpg',
    'generators.html': '/images/generator.jpg',
    'ev-charger-installation.html': '/images/ev-charging.jpg',
    'electrical-panel-upgrade.html': '/images/panel.jpg',
  };
  for (const [file, source] of Object.entries(sources)) {
    const html = read(file);
    const image = html.match(/<figure class="service-banner">\s*(<img\b[^>]+>)/)?.[1];
    assert.ok(image, `${file}: existing lead image remains discoverable in HTML`);
    assert.ok(image.includes(`src="${source}"`), `${file}: keep the reviewed photograph`);
    assert.match(image, /fetchpriority="high"/, file);
    assert.doesNotMatch(image, /loading="lazy"/, file);
    assert.match(image, /width="\d+"/, file);
    assert.match(image, /height="\d+"/, file);
    assert.equal((html.match(/fetchpriority="high"/g) || []).length, 1, `${file}: do not prioritize every image`);
  }
});
