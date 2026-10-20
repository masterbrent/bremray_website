const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const jsonLd = html => [...html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map(match => JSON.parse(match[1]));

test('the directly accessible error page asks search engines not to index it', () => {
  const robots = [...read('404.html').matchAll(/<meta\s+name="robots"\s+content="([^"]+)"/gi)]
    .flatMap(match => match[1].toLowerCase().split(/[\s,]+/));
  assert.ok(robots.includes('noindex'), 'the error document needs noindex even when requested directly');
});

test('error-page recovery links work from missing URLs inside any directory', () => {
  const links = [...read('404.html').matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)]
    .map(match => match[1]).filter(href => !/^(?:[a-z]+:|#)/i.test(href));
  for (const missing of ['https://bremray.com/missing.html', 'https://bremray.com/missing/nested/page.html']) {
    for (const href of links) {
      const target = new URL(href, missing);
      const file = target.pathname === '/' ? 'index.html' : target.pathname.slice(1);
      assert.ok(fs.existsSync(path.join(root, file)), `${missing}: ${href} resolves to missing ${file}`);
    }
  }
  assert.ok(links.filter(href => href === '/get-help.html').length >= 2, 'both service recovery links reach the request page');
});

test('error-page navigation and recovery controls include the shared design stylesheet', () => {
  assert.match(read('404.html'), /<link\s+rel="stylesheet"\s+href="\/css\/design\.css"/);
});

test('generator services identify the same valid Electrician entity as the homepage', () => {
  const business = jsonLd(read('index.html')).find(item => item['@type'] === 'Electrician');
  assert.ok(business && business['@id'], 'the homepage defines a stable business identifier');
  for (const file of ['generators/standby.html', 'generators/portable-interlock.html']) {
    const service = jsonLd(read(file)).find(item => item['@type'] === 'Service');
    assert.ok(service, `${file} declares its installation service`);
    assert.equal(service.provider['@type'], 'Electrician', `${file} uses a recognized Schema.org business type`);
    assert.equal(service.provider['@id'], business['@id'], `${file} refers to the canonical business`);
    assert.equal(service.provider.name, business.name, `${file} identifies Bremray consistently`);
  }
});

test('generator providers reuse the public business address without private location details', () => {
  const business = jsonLd(read('index.html')).find(item => item['@type'] === 'Electrician');
  assert.ok(business?.address, 'the homepage publishes the service-area business location');
  for (const file of ['generators/standby.html', 'generators/portable-interlock.html']) {
    const provider = jsonLd(read(file)).find(item => item['@type'] === 'Service')?.provider;
    assert.deepEqual(provider?.address, business.address, `${file} includes the same public address as the business`);
    assert.equal(provider.address.streetAddress, undefined, `${file} must not publish a private street address`);
    assert.equal(provider.geo, undefined, `${file} must not publish a private map location`);
  }
});

test('panel-page FAQ markup describes visible questions and preserves its business entity', () => {
  const html = read('electrical-panel-upgrade.html');
  const data = jsonLd(html);
  const visible = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
  for (const faq of data.filter(item => item['@type'] === 'FAQPage')) {
    for (const question of faq.mainEntity) {
      assert.ok(visible.includes(question.name), `FAQ question is not visible: ${question.name}`);
    }
  }
  const business = data.find(item => item['@type'] === 'Electrician');
  assert.equal(business?.['@id'], 'https://bremray.com/#business');
  assert.equal(business?.name, 'Bremray Electrical');
});
