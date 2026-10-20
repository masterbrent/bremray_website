const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const root=path.resolve(__dirname,'..');
test('pages retain real Bremray logo and use the revised house image',()=>{for(const dir of ['.','locations','generators'])for(const file of fs.readdirSync(path.join(root,dir))){if(!file.endsWith('.html'))continue;const html=fs.readFileSync(path.join(root,dir,file),'utf8');assert.match(html,/<img[^>]+src="\/images\/logo.png"/,file);assert.doesNotMatch(html,/home-evening.jpg/,file);}});
test('homepage preserves the selected customer-focused services and avoids industrial or certification promotion',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 for(const text of ['EV chargers','Generators','Panel upgrades','hot tubs and saunas','We’ve served Ann Arbor since 2004'])assert.ok(html.includes(text),text);
 assert.doesNotMatch(html,/Commercial &amp; Industrial|Tesla certified|SPAN Certified Installer/);
});

test('every footer shows six equipment brands and only the two confirmed credential captions', () => {
  const expectedBrands = ['Generac', 'Square D', 'Siemens', 'ChargePoint', 'Wallbox', 'SPAN'];
  for (const dir of ['.', 'locations', 'generators']) {
    for (const file of fs.readdirSync(path.join(root, dir)).filter(file => file.endsWith('.html'))) {
      const html = fs.readFileSync(path.join(root, dir, file), 'utf8');
      if(file==='index.html'){
        const bank=html.match(/<section class="equipment-bank"[\s\S]*?<\/section>/)?.[0];
        assert.ok(bank);
        for(const brand of expectedBrands)assert.ok(bank.includes(brand));
        assert.equal((bank.match(/<img\b/g)||[]).length,5);
        assert.doesNotMatch(bank,/certified|partner|dealer/i);
        continue;
      }
      const footer = html.match(/<div class="manufacturer-bank"[\s\S]*?(?=<div class="wrap footer-row">)/)?.[0];
      assert.ok(footer, file);
      const marks = Array.from(footer.matchAll(/<div class="manufacturer-mark">([\s\S]*?)<\/div>/g), match => match[1]);
      const brands = marks.map(mark => mark.match(/<img\b[^>]*alt="([^"]+)"/)?.[1]
        || mark.match(/<span class="manufacturer-text">([^<]+)<\/span>/)?.[1]);
      assert.deepEqual(brands, expectedBrands, file);
      assert.equal((footer.match(/<img\b/g) || []).length, 5, file);
      assert.match(footer, /<span class="manufacturer-text">ChargePoint<\/span>/, file);
      assert.doesNotMatch(html, /chargepoint\.svg/i, file);
      const captions = Array.from(footer.matchAll(/<p(?:\s[^>]*)?>([^<]+)<\/p>/g), match => match[1]);
      assert.deepEqual(captions, ['Equipment brands', 'Generac Aligned Partner', 'SPAN Certified Installer'], file);
    }
  }
});

test('all displayed manufacturer assets match their recorded original checksums', () => {
  const crypto = require('node:crypto');
  const assets = JSON.parse(fs.readFileSync(path.join(root, 'images/manufacturers/provenance.json'), 'utf8')).assets;
  assert.equal(assets.length, 5);
  assert.ok(!fs.existsSync(path.join(root, 'images/manufacturers/chargepoint.svg')),
    'the unapproved ChargePoint logo must not be shipped as a public asset');
  for (const asset of assets) {
    const data = fs.readFileSync(path.join(root, 'images/manufacturers', asset.file));
    assert.equal(crypto.createHash('sha256').update(data).digest('hex'), asset.sha256, asset.file);
    assert.match(asset.source_page, /^https:\/\//);
    assert.match(asset.asset_url, /^https:\/\//);
  }
});
