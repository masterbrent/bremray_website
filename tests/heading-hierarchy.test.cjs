const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const home=fs.readFileSync(path.join(root,'index.html'),'utf8');

test('homepage section headings name the customer question rather than the supporting response',()=>{
 for(const topic of ['What will it cost?','Not sure where to start?','Before you get in touch']){
  assert.ok(home.includes('<h2>'+topic+'</h2>'),topic);
 }
 for(const support of ['That’s a fair question.','Tell us what’s going on.','A few useful answers.']){
  assert.ok(home.includes('<p class="section-subheading">'+support+'</p>'),support);
  assert.ok(!home.includes('<h2>'+support+'</h2>'),support);
 }
 assert.ok(home.includes('<h2>Our Electrical Services</h2>'));
 assert.ok(home.includes('<h2>Serving Ann Arbor and All of Washtenaw County</h2>'));
});

test('shared contact sections expose their purpose as a heading on every public content page',()=>{
 const pages=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8').match(/<loc>(.*?)<\/loc>/g)
  .map(x=>x.replace(/<\/?loc>/g,'').replace('https://bremray.com/','')||'index.html');
 pages.push('404.html');
 for(const page of pages){
  const html=fs.readFileSync(path.join(root,page),'utf8');
  const band=html.match(/<section class="contact-band">([\s\S]*?)<\/section>/)?.[1];
  assert.ok(band,page);
  assert.ok(band.includes('<h2>Get in touch</h2>'),page);
  assert.ok(band.includes('<p class="section-subheading">Have a project in mind? Something not working?</p>'),page);
  assert.doesNotMatch(band,/<span class="eyebrow">/);
 }
});

test('generator page keeps its descriptive H1 and readable owner-selected supporting phrase',()=>{
 const html=fs.readFileSync(path.join(root,'generators.html'),'utf8');
 assert.match(html,/<h1>Generator Backup Power Solutions<\/h1>/);
 assert.match(html,/<p class="section-subheading">Home energy resilience<\/p>/);
 assert.doesNotMatch(html,/<span class="eyebrow">Home energy resilience/);
});
