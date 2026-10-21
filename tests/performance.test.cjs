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
    const image = html.match(/<figure class="service-banner">\s*(?:<picture>\s*<source[^>]+>\s*)?(<img\b[^>]+>)/)?.[1];
    assert.ok(image, `${file}: existing lead image remains discoverable in HTML`);
    assert.ok(image.includes(`src="${source}"`), `${file}: keep the reviewed photograph`);
    assert.match(image, /fetchpriority="high"/, file);
    assert.doesNotMatch(image, /loading="lazy"/, file);
    assert.match(image, /width="\d+"/, file);
    assert.match(image, /height="\d+"/, file);
    assert.equal((html.match(/fetchpriority="high"/g) || []).length, 1, `${file}: do not prioritize every image`);
  }
});

test('service photos offer responsive WebP files instead of full-size downloads on phones',()=>{
 for(const file of ['index.html','residential-electrical.html','generators.html','ev-charger-installation.html','electrical-panel-upgrade.html']){
  const html=read(file);
  const pictures=[...html.matchAll(/<picture>([\s\S]*?)<\/picture>/g)];
  assert.ok(pictures.length>0,file);
  for(const [,picture] of pictures){
   assert.match(picture,/type="image\/webp"/);
   assert.match(picture,/sizes="[^"]+"/);
   for(const size of [480,960,1440])assert.ok(picture.includes(size+'.webp '+size+'w'),file+' width '+size);
   for(const [,url] of picture.matchAll(/(\/images\/responsive\/[^\s",]+\.webp)/g)){
    const b=fs.readFileSync(path.join(root,url));
    assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WEBP');
    assert.ok(b.length<220000,url+' image budget');
   }
  }
 }
});
