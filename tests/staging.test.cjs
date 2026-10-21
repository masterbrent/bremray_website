const {test}=require('node:test');const assert=require('node:assert/strict');
test('local preview is noindex and excludes live measurement and form endpoint',async()=>{
for(const path of ['/','/get-help.html','/contact.html']){
const response=await fetch('http://127.0.0.1:8766'+path);assert.equal(response.status,200);assert.match(response.headers.get('x-robots-tag'),/noindex/);const html=await response.text();assert.doesNotMatch(html,/<script[^>]+analytics\.js/);assert.doesNotMatch(html,/action="https:\/\/formspree/);assert.match(html,/staging\.js/);}
const robots=await(await fetch('http://127.0.0.1:8766/robots.txt')).text();assert.match(robots,/Disallow: \//);
});
test('staging keeps Contact intake unable to send or load third-party frames',async()=>{
for(const path of ['/contact.html','/get-help.html']){
const response=await fetch('http://127.0.0.1:8766'+path);const html=await response.text();
assert.match(html,/data-live-intake/);
assert.doesNotMatch(html,/<iframe|(?:book|online-booking)\.housecallpro\.com|data-intake-endpoint=/);
const policy=response.headers.get('content-security-policy');
assert.match(policy,/frame-src 'none'/);assert.match(policy,/connect-src 'self'/);assert.match(policy,/form-action 'none'/);
assert.match(policy,/script-src 'self'/);
}
});
test('staging strips custom sending endpoints before HTML reaches the browser',async()=>{
for(const path of ['/','/get-help.html','/contact.html']){
 const response=await fetch('http://127.0.0.1:8766'+path);const html=await response.text();
 assert.match(html,/data-live-intake/);
 assert.doesNotMatch(html,/data-intake-endpoint=/);
 assert.match(response.headers.get('content-security-policy'),/connect-src 'self'/);
}
});
