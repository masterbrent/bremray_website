const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=file=>fs.readFileSync(file,'utf8');

test('homepage and request page load the lightweight intake with a real endpoint',()=>{
 for(const file of ['index.html','get-help.html']){
  const html=read(file);
  assert.equal((html.match(/id="intake-screen"/g)||[]).length,1,file);
  assert.match(html,/data-intake-endpoint="https:\/\/bots\.propfirmbot\.com\/bremray-intake\/v1\/requests"/,file);
  assert.doesNotMatch(html,/<iframe|online-booking\.housecallpro\.com|Form preview · Nothing is sent/,file);
  assert.match(html,/href="tel:7342169437"/,file);
  assert.equal((html.match(/<h1\b/g)||[]).length,1,file);
 }
 const home=read('index.html');
 assert.ok(home.indexOf('id="intake-screen"')<home.indexOf('id="services"'));
 assert.match(home,/<h1 id="lead-title">Licensed Electrician in Ann Arbor<\/h1>/);
 assert.match(read('get-help.html'),/Open the form in Housecall Pro/);
});

test('privacy describes the first-party intake and completed-lead analytics without marketing opt-in',()=>{
 const html=read('privacy.html');
 assert.match(html,/secure server[^<]*Housecall Pro/);
 assert.match(html,/completed service requests/);
 assert.match(html,/does not sign you up for marketing/);
});
