const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
for(const variant of ['type','service-desk','hybrid']){
 test(`${variant} is an isolated, unindexed preview with a visible phone link`,()=>{
  const html=fs.readFileSync(`design-explorations/${variant}/index.html`,'utf8');
  assert.match(html,/<meta\s+name="robots"\s+content="noindex,\s*nofollow"/i);
  assert.match(html,/connect-src 'none'/);assert.match(html,/form-action 'none'/);
  assert.match(html,/href="tel:(?:\+1)?7342169437"/);
  assert.match(html,/data-demo-intake/);assert.doesNotMatch(html,/data-intake-endpoint|id="intake-screen"|analytics\.js|iframe|\$250|\$195/);
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  assert.match(html, /src="\/images\/logo\.png"/);
  for(const asset of ['ev-charging.jpg','generator.jpg','panel.jpg']) assert.ok(html.includes('/images/'+asset));
  for(const match of html.matchAll(/(?:src|href)="(\/[^"#?]+)(?:[?#][^"]*)?"/g)){
   if(match[1].endsWith('/'))continue;
   assert.ok(fs.existsSync(path.join('.',match[1])),`Missing ${match[1]}`);
  }
 });
}
test('preview controller cannot transmit or persist entered contact details',()=>{
 const js=fs.readFileSync('design-explorations/shared/flow.js','utf8');
 assert.doesNotMatch(js,/\b(fetch|XMLHttpRequest|WebSocket|sendBeacon|localStorage|sessionStorage|createSubmission)\b/);
 assert.match(js,/preventDefault\(/);
 assert.match(js,/No request was sent/);
});
