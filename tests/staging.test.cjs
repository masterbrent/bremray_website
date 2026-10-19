const {test}=require('node:test');const assert=require('node:assert/strict');
const preview=process.env.BREMRAY_PREVIEW_URL||'http://127.0.0.1:8766';
test('local preview is noindex and excludes live measurement and form endpoint',async()=>{
for(const path of ['/','/get-help.html','/contact.html']){
const response=await fetch(preview+path);assert.equal(response.status,200);assert.match(response.headers.get('x-robots-tag'),/noindex/);const html=await response.text();assert.doesNotMatch(html,/<script[^>]+analytics\.js/);assert.doesNotMatch(html,/action="https:\/\/formspree/);assert.match(html,/staging\.js/);}
const robots=await(await fetch(preview+'/robots.txt')).text();assert.match(robots,/Disallow: \//);
});
test('staging excludes the complete third-party lead widget before JavaScript runs',async()=>{
for(const path of ['/get-help.html','/contact.html']){
const response=await fetch(preview+path);const html=await response.text();
assert.match(html,/data-lead-preview/);assert.match(html,/<fieldset disabled/);
assert.doesNotMatch(html,/<iframe|book\.housecallpro\.com|online-booking\.housecallpro\.com/);
const policy=response.headers.get('content-security-policy');
assert.match(policy,/frame-src 'none'/);assert.match(policy,/connect-src 'self'/);assert.match(policy,/form-action 'none'/);
assert.match(policy,/script-src 'self'/);
}
});
