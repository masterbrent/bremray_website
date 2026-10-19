const {test}=require('node:test');const assert=require('node:assert/strict');
test('local preview is noindex and excludes live measurement and form endpoint',async()=>{
for(const path of ['/','/get-help.html','/contact.html']){
const response=await fetch('http://127.0.0.1:8766'+path);assert.equal(response.status,200);assert.match(response.headers.get('x-robots-tag'),/noindex/);const html=await response.text();assert.doesNotMatch(html,/<script[^>]+analytics\.js/);assert.doesNotMatch(html,/action="https:\/\/formspree/);assert.match(html,/staging\.js/);}
const robots=await(await fetch('http://127.0.0.1:8766/robots.txt')).text();assert.match(robots,/Disallow: \//);
});
