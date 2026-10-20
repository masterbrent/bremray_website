const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const titleOf = html => html.match(/<title>([^<]+)<\/title>/i)?.[1];
const pages = {
  'locations/ann-arbor-electrician.html': {service: /electrician/i, city: 'Ann Arbor'},
  'locations/ypsilanti-electrician.html': {service: /electrician/i, city: 'Ypsilanti'},
  'generators/standby.html': {service: /standby generator installation/i, city: 'Ann Arbor'},
  'electrical-panel-upgrade.html': {service: /electrical panel upgrades/i, city: 'Ann Arbor'},
};

test('search titles identify the service, town and business without extra sales claims', () => {
  for (const [file, {service, city}] of Object.entries(pages)) {
    const title = titleOf(read(file));
    assert.ok(title, `${file}: a search title is present`);
    assert.match(title, service, file);
    assert.ok(title.includes(city), `${file}: keep the customer service area`);
    assert.match(title, /\| Bremray(?: Electrical)?$/, `${file}: identify the business`);
    assert.equal(title.split('|').length, 2, `${file}: one clear page topic and business name, not a list of selling points`);
    assert.doesNotMatch(title, /certified|authorized dealer|aligned partner|free quote|same.day|#1|best|cheapest/i, file);
  }
});

test('search and social titles describe the same page', () => {
  for (const file of Object.keys(pages)) {
    const html = read(file);
    const socialTitle = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i)?.[1];
    assert.equal(socialTitle, titleOf(html), `${file}: use the same clear topic when shared`);
  }
});

test('the revised search titles remain unique across public pages', () => {
  const publicPages = ['', 'locations', 'generators'].flatMap(directory =>
    fs.readdirSync(path.join(root, directory)).filter(file => file.endsWith('.html'))
      .map(file => path.join(directory, file)));
  const titles = publicPages.map(file => ({file, title: titleOf(read(file))}));
  for (const file of Object.keys(pages)) {
    const title = titleOf(read(file));
    assert.deepEqual(titles.filter(item => item.title === title).map(item => item.file), [file]);
  }
});
