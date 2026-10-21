const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const home=fs.readFileSync(path.join(root,'index.html'),'utf8');

test('homepage supporting sections use descriptive headings and the common type scale',()=>{
 for(const topic of ['What will it cost?','Electrical work for your home.','Here in Ann Arbor.','Before you get in touch.']){
  assert.ok(home.includes('>'+topic+'</h2>'),topic);
 }
 assert.doesNotMatch(home,/<h2[^>]*>That’s a fair question/);
 const css=fs.readFileSync(path.join(root,'css/site.css'),'utf8');
 assert.match(css,/font-size:\s*var\(--section-size\)/);
 assert.match(css,/--section-size:\s*34px/);
});

test('contact sections remain descriptive without repeating a page-specific closing call to action',()=>{
 const pages=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8').match(/<loc>(.*?)<\/loc>/g)
  .map(x=>x.replace(/<\/?loc>/g,'').replace('https://bremray.com/','')||'index.html');
 pages.push('404.html');
 for(const page of pages){
  if(page==='index.html'){ assert.match(home,/<footer[^>]*id="contact"/); assert.match(home,/href="\/?#questions">Tell us what you need/); continue; }
  const html=fs.readFileSync(path.join(root,page),'utf8');
  const band=html.match(/<section class="contact-band">([\s\S]*?)<\/section>/)?.[1];
  const entry=JSON.parse(fs.readFileSync(path.join(root,'site/pages.json'),'utf8')).find(item=>item.path===page);
  if(entry.hideContactBand){ assert.equal(band,undefined,page+' suppresses duplicate contact section'); assert.match(html,/data-live-intake|class="cta-section"|class="action-panel"|privacy|can't find|can’t find/i,page); continue; }
  assert.ok(band,page);
  assert.ok(band.includes('<h2>Get in touch</h2>'),page);
  assert.ok(band.includes('<p class="section-subheading">Have a project in mind? Something not working?</p>'),page);
  assert.doesNotMatch(band,/<span class="eyebrow">/);
 }
});

test('generator page keeps its descriptive H1 and readable owner-selected supporting phrase',()=>{
 const html=fs.readFileSync(path.join(root,'generators.html'),'utf8');
 assert.match(html,/<h1>Generator installation in Ann Arbor<\/h1>/);
 assert.match(html,/<p class="section-subheading">Home energy resilience<\/p>/);
 assert.doesNotMatch(html,/<span class="eyebrow">Home energy resilience/);
});
