const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function boot(saved, brokenStorage = false) {
  const nodes = []; const listeners = {}; const savedValues = new Map(saved ? [['bremray-analytics-consent', saved]] : []);
  function element(tag) { return { tag, children: [], hidden: false, style: {}, setAttribute(k,v) { this[k]=v; }, appendChild(n) {this.children.push(n);nodes.push(n);return n;}, addEventListener(k,fn) {this[k]=fn;}, focus(){this.focused=true;}, remove(){this.removed=true;} }; }
  const footer = element('footer');
  const document = {head:element('head'),body:element('body'),referrer:'https://example.com/from?email=private#secret',cookie:'',createElement:element,querySelector:s=>s==='footer'?footer:null,addEventListener(k,fn){listeners[k]=fn;}};
  const window={location:{origin:'https://bremray.com',pathname:'/contact.html',hostname:'bremray.com'},localStorage:{getItem(k){if(brokenStorage)throw Error('blocked');return savedValues.get(k);},setItem(k,v){if(brokenStorage)throw Error('blocked');savedValues.set(k,v);}},addEventListener(k,fn){listeners['window:'+k]=fn;}};
  vm.runInNewContext(fs.readFileSync('js/analytics.js','utf8'),{document,window,URL,Date});
  return {window,document,nodes,listeners,savedValues,buttons:()=>nodes.filter(n=>n.tag==='button'),scripts:()=>nodes.filter(n=>n.tag==='script'),events:()=>Array.from(window.dataLayer||[],x=>Array.from(x))};
}
test('no analytics requests or events before a choice; reject persists',()=>{const b=boot();assert.equal(b.scripts().length,0);assert.equal(b.events().length,0);b.buttons().find(x=>x.textContent==='Reject analytics').click();assert.equal(b.savedValues.get('bremray-analytics-consent'),'denied');assert.equal(b.scripts().length,0);});
test('accept loads one tag, sends only sanitized page view, disables advertising',()=>{const b=boot();const accept=b.buttons().find(x=>x.textContent==='Accept analytics');accept.click();accept.click();assert.equal(b.scripts().length,1);const events=b.events();const config=events.find(x=>x[0]==='config')[2];assert.equal(config.send_page_view,false);assert.equal(config.allow_google_signals,false);assert.equal(config.allow_ad_personalization_signals,false);assert.equal(config.page_location,'https://bremray.com/contact.html');assert.equal(config.page_referrer,'https://example.com/from');assert.equal(events.filter(x=>x[1]==='page_view').length,1);assert.ok(!JSON.stringify(events).includes('private'));});
test('phone clicks only after acceptance; no form-submit listener',()=>{const b=boot();const e={target:{closest:()=>({getAttribute:()=> 'tel:7342169437'})}};b.listeners.click(e);assert.equal(b.events().length,0);b.buttons().find(x=>x.textContent==='Accept analytics').click();b.listeners.click(e);const phone=b.events().find(x=>x[1]==='phone_click');assert.ok(phone);assert.ok(!JSON.stringify(phone).includes('734'));assert.equal(b.listeners.submit,undefined);});
test('saved choices, reopening and withdrawal work',()=>{const b=boot('granted');assert.equal(b.scripts().length,1);b.buttons().find(x=>x.textContent==='Cookie choices').click();assert.ok(b.buttons().find(x=>x.textContent==='Reject analytics').focused);b.buttons().find(x=>x.textContent==='Reject analytics').click();assert.equal(b.window['ga-disable-G-4062HJ1QDH'],true);const count=b.events().length;b.listeners.click({target:{closest:()=>({getAttribute:()=> 'tel:123'})}});assert.equal(b.events().length,count);assert.equal(boot('denied').scripts().length,0);});
test('blocked storage does not prevent explicit choices',()=>{const b=boot(null,true);b.buttons().find(x=>x.textContent==='Accept analytics').click();assert.equal(b.scripts().length,1);});
test('every content page includes exactly one deferred local tag',()=>{function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()&&!e.name.startsWith('.')&&e.name!=='design-explorations'?walk(dir+'/'+e.name):e.name.endsWith('.html')?[dir+'/'+e.name]:[]);}for(const file of walk('.')){const html=fs.readFileSync(file,'utf8');assert.equal((html.match(/<script defer src="\/js\/analytics.js\?v=20261020"><\/script>/g)||[]).length,1,file);}});
test('cross-tab rejection disables collection and expires existing GA cookies',()=>{const b=boot('granted');b.document.cookie='_ga=abc; _ga_4062HJ1QDH=xyz';b.listeners['window:storage']({key:'bremray-analytics-consent',newValue:'denied'});assert.equal(b.window['ga-disable-G-4062HJ1QDH'],true);assert.match(b.document.cookie,/Max-Age=0/);const count=b.events().length;b.listeners.click({target:{closest:()=>({})}});assert.equal(b.events().length,count);});
test('withdrawing then accepting again resumes consent without duplicate tags or page views',()=>{
  const b=boot('granted');
  const clickPhone=()=>b.listeners.click({target:{closest:()=>({getAttribute:()=> 'tel:7342169437'})}});
  b.buttons().find(x=>x.textContent==='Reject analytics').click();
  clickPhone();
  assert.equal(b.events().filter(x=>x[1]==='phone_click').length,0);
  b.buttons().find(x=>x.textContent==='Accept analytics').click();
  clickPhone();
  assert.equal(b.window['ga-disable-G-4062HJ1QDH'],false);
  assert.equal(b.scripts().length,1);
  assert.equal(b.events().filter(x=>x[1]==='page_view').length,1);
  assert.equal(b.events().filter(x=>x[1]==='phone_click').length,1);
});
test('confirmed lead receipts only send a sanitized conversion with existing analytics consent',()=>{
 const b=boot();
 b.listeners['bremray:lead-delivered']({detail:{email:'private@example.com',phone:'7348227594',description:'Private job'}});
 assert.equal(b.events().length,0);
 b.buttons().find(x=>x.textContent==='Accept analytics').click();
 assert.equal(b.events().filter(x=>x[1]==='generate_lead').length,0,'no retroactive event after consent');
 b.listeners['bremray:lead-delivered']({detail:{email:'private@example.com'}});
 const event=b.events().find(x=>x[1]==='generate_lead');
 assert.equal(event[2].page_location,'https://bremray.com/contact.html');
 assert.ok(!JSON.stringify(event).includes('private'));
 assert.deepEqual(Object.keys(event[2]).sort(),['page_location','page_referrer']);
 b.buttons().find(x=>x.textContent==='Reject analytics').click();
 b.listeners['bremray:lead-delivered']({});
 assert.equal(b.events().filter(x=>x[1]==='generate_lead').length,1);
});
