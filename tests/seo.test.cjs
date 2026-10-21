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

test('all public pages have distinct search summaries and one main heading', () => {
  const entries=JSON.parse(fs.readFileSync(path.join(root,'site/pages.json'),'utf8'));
  const titles=new Set(), descriptions=new Set();
  for(const entry of entries){
    const html=fs.readFileSync(path.join(root,entry.path),'utf8');
    assert.equal([...html.matchAll(/<h1\b/g)].length,1,entry.path);
    const title=html.match(/<title>(.*?)<\/title>/s)?.[1];
    const description=html.match(/<meta name="description" content="([^"]+)"/)?.[1];
    assert.ok(title&&description,entry.path+' has a title and description');
    assert.ok(!titles.has(title),entry.path+' has a distinct title');titles.add(title);
    assert.ok(!descriptions.has(description),entry.path+' has a distinct description');descriptions.add(description);
    if(entry.path!=='404.html') assert.doesNotMatch(html,/<meta name="robots"[^>]*noindex/,entry.path);
  }
});

test('internal links and fragments resolve throughout the site', () => {
  const entries=JSON.parse(fs.readFileSync(path.join(root,'site/pages.json'),'utf8'));
  for(const entry of entries){
    const html=fs.readFileSync(path.join(root,entry.path),'utf8');
    for(const match of html.matchAll(/<a\b[^>]*href="([^"]*)"/g)){
      const url=new URL(match[1].replaceAll('&amp;','&'),'https://bremray.com/'+(entry.path==='index.html'?'':entry.path));
      if(url.origin!=='https://bremray.com')continue;
      const file=url.pathname==='/'?'index.html':url.pathname.slice(1);
      assert.ok(fs.existsSync(path.join(root,file)),entry.path+' → '+match[1]);
      if(url.hash&&file.endsWith('.html')){
        const target=fs.readFileSync(path.join(root,file),'utf8');
        assert.ok(target.includes('id="'+decodeURIComponent(url.hash.slice(1))+'"'),entry.path+' → '+match[1]+' fragment');
      }
    }
  }
});

test('structured answers are present in the visible page copy', () => {
  const entries=JSON.parse(fs.readFileSync(path.join(root,'site/pages.json'),'utf8'));
  const normalize=text=>text.replaceAll('&amp;','&').replaceAll('&#39;',"'").replaceAll('&quot;','"').replace(/\s+/g,' ').trim();
  for(const entry of entries){
    const html=fs.readFileSync(path.join(root,entry.path),'utf8');
    const visible=normalize(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replace(/<[^>]*>/g,' '));
    for(const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){
      const data=JSON.parse(match[1]);
      if(data['@type']==='FAQPage')for(const question of data.mainEntity){
        assert.ok(visible.includes(normalize(question.name)),entry.path+' '+question.name);
        assert.ok(visible.includes(normalize(question.acceptedAnswer.text)),entry.path+' FAQ answer is visible');
      }
    }
  }
});
