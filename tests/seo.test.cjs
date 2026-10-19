const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
test('every sitemap page declares its own canonical URL', () => {
  for (const url of urls) {
    const pathname = new URL(url).pathname;
    const html = fs.readFileSync(path.join(root, pathname === '/' ? 'index.html' : pathname.slice(1)), 'utf8');
    const canonicals = [...html.matchAll(/<link\s+rel="canonical"\s+href="([^"]+)"/g)].map(m => m[1]);
    assert.deepEqual(canonicals, [url], url);
  }
});
test('location pages identify the real business base and separate service areas', () => {
  for (const file of fs.readdirSync(path.join(root, 'locations'))) {
    if (!file.endsWith('.html')) continue;
    const html = fs.readFileSync(path.join(root, 'locations', file), 'utf8');
    const data = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
    const business = data.find(d => d['@type'] === 'Electrician');
    assert.equal(business.address.addressLocality, 'Ann Arbor', file);
    assert.equal(business.address.streetAddress, undefined, 'private street address must stay absent');
    assert.ok(business.areaServed.name, file);
  }
});
test('homepage does not imply an unverified map pin', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const data = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
  assert.equal(data.find(d => d['@type'] === 'Electrician').geo, undefined);
});
