const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=file=>fs.readFileSync(file,'utf8');

test('all request entry points share the lightweight intake with a real endpoint',()=>{
 for(const file of ['index.html','get-help.html','contact.html']){
  const html=read(file);
  assert.equal((html.match(/data-live-intake/g)||[]).length,1,file);
  assert.match(html,/data-intake-endpoint="https:\/\/bots\.propfirmbot\.com\/bremray-intake\/v1\/requests"/,file);
  assert.doesNotMatch(html,/<iframe|online-booking\.housecallpro\.com|Form preview · Nothing is sent/,file);
  assert.match(html,/href="tel:(?:\+1)?7342169437"/,file);
  assert.equal((html.match(/<h1\b/g)||[]).length,1,file);
 }
 const home=read('index.html');
 assert.ok(home.indexOf('data-live-intake')<home.indexOf('id="services"'));
 assert.match(home,/<h1[^>]*>[\s\S]*?Licensed[\s\S]*?electrician[\s\S]*?in Ann Arbor[\s\S]*?<\/h1>/);
 assert.match(read('get-help.html'),/Open the form in Housecall Pro/);
});

test('privacy describes the first-party intake and completed-lead analytics without marketing opt-in',()=>{
 const html=read('privacy.html');
 assert.match(html,/secure server[^<]*Housecall Pro/);
 assert.match(html,/completed service requests/);
 assert.match(html,/does not sign you up for marketing/);
});

test('native intake entry pages version both dependent scripts together',()=>{
 for(const file of ['index.html','contact.html','get-help.html']){
  const html=read(file);
  const rules=html.match(/src="\/js\/adaptive-intake\.js\?v=(\d+)"/);
  const controller=html.match(/src="\/js\/home-intake\.js\?v=(\d+)"/);
  assert.ok(rules&&controller,file+' avoids a cached old rules file with the new controller');
  assert.equal(rules[1],controller[1],file+' uses one intake release');
 }
});
