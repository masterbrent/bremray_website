const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const endpoint='https://bots.propfirmbot.com/bremray-intake/v1/requests';
const id='e456b1cf-a0a4-4cb5-93a8-01a323abc123';
const response=(status,body)=>({status,json:async()=>body});
const receipt=(status)=>({request_id:id,status});
// Exercise the production event handlers, question rules, and delivery client together.
function boot({url=endpoint,search='',pathname='/',fetch=async()=>response(201,receipt('delivered'))}={}){
 class Element{
  constructor(tag){this.tag=tag;this.children=[];this.attrs={};this.listeners={};this.value='';this.disabled=false;this.hidden=false;this.classList={add:v=>this.attrs.class=((this.attrs.class||'')+' '+v).trim()};}
  setAttribute(k,v){this.attrs[k]=String(v);}
  getAttribute(k){return this.attrs[k]??null;}
  append(...children){this.children.push(...children);}
  replaceChildren(...children){this.children=children;}
  addEventListener(e,fn){this.listeners[e]=fn;}
  querySelectorAll(s){return this.children.flatMap(c=>[...(matches(c,s)?[c]:[]),...c.querySelectorAll(s)]);}
  querySelector(s){return this.querySelectorAll(s)[0]||null;}
  focus(){this.focused=true;} getBoundingClientRect(){return{top:120};} scrollIntoView(){}
  setCustomValidity(v){this.invalid=v;} reportValidity(){return !this.invalid;}
 }
 function matches(n,s){
  if(s.startsWith('#'))return n.attrs.id===s.slice(1);
  if(s.startsWith('.'))return (n.attrs.class||'').split(' ').includes(s.slice(1));
  const match=s.match(/^([a-z]*)?\[([^=\]]+)(?:="([^"]*)")?\]$/);
  if(match)return (!match[1]||n.tag===match[1])&&n.attrs[match[2]]!==undefined&&(match[3]===undefined||n.attrs[match[2]]===match[3]);
  return n.tag===s;
 }
 const mount=new Element('div');mount.setAttribute('data-live-intake','');
 if(url)mount.setAttribute('data-intake-endpoint',url);
 const events=[];
 const document={querySelector:s=>matches(mount,s)?mount:null,getElementById:()=>null,createElement:tag=>new Element(tag),dispatchEvent:e=>events.push(e.type)};
 let uuidCount=0;
 const window={innerHeight:900,location:{origin:'https://bremray.com',pathname,search},crypto:{randomUUID:()=>{uuidCount++;return id;}},fetch};
 const context=vm.createContext({window,document,Event,AbortController,URLSearchParams,setTimeout,clearTimeout});
 vm.runInContext(fs.readFileSync('js/adaptive-intake.js','utf8'),context);
 vm.runInContext(fs.readFileSync('js/home-intake.js','utf8'),context);
 const button=text=>mount.querySelectorAll('button').find(n=>n.textContent===text);
 const click=text=>{const b=button(text);assert.ok(b,text);return b.listeners.click();};
 const pick=value=>{const b=mount.querySelectorAll('button').find(n=>n.attrs['data-choice']===value);assert.ok(b,value);return b.listeners.click();};
 const fill=(key,value)=>{const n=mount.querySelector('#home-'+key);assert.ok(n,key);n.value=value;n.listeners.input();};
 const method=value=>{const n=mount.querySelector('input[value="'+value+'"]');assert.ok(n,value);n.checked=true;n.listeners.change();};
 const submit=()=>mount.querySelector('form').listeners.submit({preventDefault(){}});
 const review=()=>{pick('repair');pick('outlet');pick('recent');pick('nearby');};
 const valid=()=>{fill('name','Bremray Website Test');fill('phone','(734) 822-7594');};
 return {mount,button,click,pick,fill,method,submit,review,valid,events,uuidCount:()=>uuidCount};
}

test('service-specific entry preserves source and reset returns to all job choices',async()=>{
 let payload;const b=boot({search:'?service=ev&email=do-not-copy%40example.com',pathname:'/get-help.html',fetch:async(url,opts)=>{payload=JSON.parse(opts.body);return response(201,receipt('delivered'));}});
 assert.equal(b.mount.querySelector('h2').textContent,'Where would you charge your car?');
 b.pick('garage');b.pick('none');b.pick('near');b.valid();await b.submit();
 assert.equal(payload.answers[0].answer,'Install something new');
 assert.equal(payload.answers[1].answer,'An EV charger');
 assert.equal(payload.source.page,'https://bremray.com/get-help.html');
 assert.doesNotMatch(JSON.stringify(payload),/do-not-copy/);
 const c=boot({search:'?service=panel'});c.click('Start over');
 assert.equal(c.mount.querySelector('h2').textContent,'What do you need done?');
 c.pick('install');assert.equal(c.mount.querySelector('h2').textContent,'What do you want us to install?');
 const d=boot({search:'?service=toString'});assert.equal(d.mount.querySelector('h2').textContent,'What do you need done?');
});

test('guided Type intake sends answers and confirms only after actual delivery',async()=>{
 let resolve;const calls=[];
 const b=boot({fetch:(url,options)=>{calls.push({url,options});return new Promise(r=>resolve=r);}});
 b.review();b.valid();const send=b.submit();
 assert.equal(b.mount.querySelector('h2').textContent,'Sending your request…');
 assert.equal(b.button('Start over'),undefined);assert.deepEqual(b.events,[]);
 const payload=JSON.parse(calls[0].options.body);
 assert.equal(calls[0].url,endpoint);assert.equal(payload.request_id,id);
 assert.equal(payload.answers[3].answer,'Yes, other things nearby');
 assert.equal(payload.contact.phone,'+17348227594');assert.equal(payload.source.page,'https://bremray.com/');
 resolve(response(201,receipt('delivered')));await send;
 assert.equal(b.mount.querySelector('h2').textContent,'Thanks. We’ve got your request.');
 assert.deepEqual(b.events,['bremray:lead-delivered']);
 assert.equal(b.mount.querySelector('a').attrs.href,'tel:+17342169437');
 assert.equal(b.button('Send request'),undefined);assert.equal(b.button('Start over'),undefined);
});

test('repeated submission and status clicks never create overlapping requests',async()=>{
 let resolve;const calls=[];
 const b=boot({fetch:(url,options)=>{calls.push(options.method);return new Promise(r=>resolve=r);}});
 b.review();b.valid();const oldForm=b.mount.querySelector('form');
 const first=oldForm.listeners.submit({preventDefault(){}});
 await oldForm.listeners.submit({preventDefault(){}});assert.deepEqual(calls,['POST']);
 resolve(response(202,receipt('pending')));await first;
 const oldCheck=b.button('Check request status');const check=oldCheck.listeners.click();
 assert.equal(b.button('Checking…').disabled,true);
 await oldCheck.listeners.click();assert.deepEqual(calls,['POST','GET']);
 resolve(response(200,receipt('delivered')));await check;
 assert.deepEqual(b.events,['bremray:lead-delivered']);
});

test('a malformed or mismatched response does not display a successful receipt',async()=>{
 for(const body of [{status:'delivered'},{request_id:'different-request',status:'delivered'}]){
  const b=boot({fetch:async()=>response(201,body)});b.review();b.valid();await b.submit();
  assert.equal(b.mount.querySelector('h2').textContent,'We couldn’t confirm your request.');
  assert.deepEqual(b.events,[]);assert.ok(b.button('Check request status'));
 }
});

test('invalid name, phone, email, and ZIP remain editable and never send',async()=>{
 let calls=0;const b=boot({fetch:async()=>{calls++;}});b.review();
 await b.submit();assert.match(b.mount.querySelector('#home-name').invalid,/name/);
 b.valid();b.fill('phone','123');await b.submit();assert.match(b.mount.querySelector('#home-phone').invalid,/10-digit/);
 b.fill('phone','7348227594');b.fill('zip','not a ZIP');await b.submit();assert.match(b.mount.querySelector('#home-zip').invalid,/ZIP/);
 b.fill('zip','48103');b.method('email');b.fill('email','invalid@');await b.submit();assert.match(b.mount.querySelector('#home-email').invalid,/email/);
 assert.equal(calls,0);assert.deepEqual(b.events,[]);
});

test('typed intake sends only the current description and email contact',async()=>{
 let payload;const b=boot({fetch:async(url,options)=>{payload=JSON.parse(options.body);return response(201,receipt('delivered'));}});
 b.pick('install');b.click('I’d rather type');b.fill('project','Please install a ceiling fan in our bedroom.');b.click('Review details →');
 b.fill('name','Bremray Website Test');b.method('email');b.fill('email','bremrayllc@gmail.com');await b.submit();
 assert.equal(payload.mode,'typed');assert.deepEqual(payload.answers,[]);
 assert.equal(payload.description,'Please install a ceiling fan in our bedroom.');
 assert.equal(payload.contact.email,'bremrayllc@gmail.com');assert.equal(payload.contact.phone,'');
});

test('text ballpark permission is optional, explicit, and clears when changing channel',async()=>{
 let payload;const b=boot({fetch:async(url,options)=>{payload=JSON.parse(options.body);return response(201,receipt('delivered'));}});
 b.review();b.valid();b.method('text');let check=b.mount.querySelector('#home-ballpark');
 assert.equal(check.checked,false);check.checked=true;check.listeners.change();
 b.method('email');b.method('text');check=b.mount.querySelector('#home-ballpark');assert.equal(check.checked,false);
 check.checked=true;check.listeners.change();await b.submit();assert.equal(payload.contact.ballpark,true);
 assert.ok(b.mount.querySelectorAll('p').some(n=>/review your answers/.test(n.textContent)));
});

test('uncertain network response checks status without another POST and fires conversion once',async()=>{
 const methods=[];const b=boot({fetch:async(url,options)=>{methods.push(options.method);if(options.method==='POST')throw Error('offline');return response(200,receipt('delivered'));}});
 b.review();b.valid();await b.submit();assert.deepEqual(b.events,[]);
 assert.equal(b.mount.querySelector('h2').textContent,'We couldn’t confirm your request.');
 assert.equal(b.button('Start over'),undefined);assert.equal(b.button('Send request'),undefined);
 await b.click('Check request status');assert.deepEqual(methods,['POST','GET']);assert.deepEqual(b.events,['bremray:lead-delivered']);
 assert.equal(b.button('Check request status'),undefined);assert.equal(b.uuidCount(),1);
});

test('a missing receipt retries the identical payload with the same request ID',async()=>{
 const calls=[];const b=boot({fetch:async(url,options)=>{calls.push({url,options});if(calls.length===1)throw Error('offline');if(options.method==='GET')return response(404,{error:'not_found'});return response(201,receipt('delivered'));}});
 b.review();b.valid();await b.submit();await b.click('Check request status');
 assert.equal(b.mount.querySelector('h2').textContent,'Your request hasn’t arrived yet.');
 await b.click('Try sending again');assert.deepEqual(calls.map(x=>x.options.method),['POST','GET','POST']);
 assert.equal(calls[0].options.body,calls[2].options.body);assert.equal(b.uuidCount(),1);
});

test('pending and uncertain receipts keep edits locked and cannot pretend to succeed',async()=>{
 for(const status of ['pending','uncertain']){
  const methods=[];const b=boot({fetch:async(url,options)=>{methods.push(options.method);return response(202,receipt(status));}});
  b.review();b.valid();await b.submit();await b.click('Check request status');
  assert.deepEqual(methods,['POST','GET']);assert.deepEqual(b.events,[]);
  assert.equal(b.button('Start over'),undefined);assert.equal(b.mount.querySelector('form'),null);
  assert.equal(b.mount.querySelector('a').attrs.href,'tel:+17342169437');
 }
});

test('server rejection permits corrections without submitting automatically',async()=>{
 const payloads=[];const b=boot({fetch:async(url,options)=>{payloads.push(JSON.parse(options.body));return payloads.length===1?response(400,{error:'invalid_request'}):response(201,receipt('delivered'));}});
 b.review();b.valid();await b.submit();assert.equal(b.mount.querySelector('h2').textContent,'We couldn’t send your request.');
 await b.click('Check my details');assert.equal(payloads.length,1);assert.equal(b.mount.querySelector('#home-name').value,'Bremray Website Test');
 b.fill('phone','7342169437');await b.submit();assert.equal(payloads[1].contact.phone,'+17342169437');assert.equal(b.uuidCount(),2);
 assert.deepEqual(b.events,['bremray:lead-delivered']);
});

test('protected local preview disables submission and never shows a real receipt',async()=>{
 let calls=0;const b=boot({url:'',fetch:async()=>calls++});b.review();b.valid();
 assert.equal(b.button('Send request').disabled,true);await b.submit();assert.equal(calls,0);assert.deepEqual(b.events,[]);
 assert.ok(b.mount.querySelectorAll('p').some(n=>/Nothing is sent/.test(n.textContent)));
 assert.notEqual(b.mount.querySelector('h2').textContent,'Thanks. We’ve got your request.');
});

test('back, typed editing, and Start over preserve or clear the intended details',()=>{
 const b=boot();b.pick('install');b.click('← Back');assert.equal(b.mount.querySelector('h2').textContent,'What do you need done?');
 b.click('I’d rather type');b.fill('project','Install kitchen lights.');b.click('Review details →');b.click('Edit answers');
 assert.equal(b.mount.querySelector('#home-project').value,'Install kitchen lights.');
 b.click('Review details →');b.fill('name','Test');b.click('Start over');b.click('I’d rather type');
 assert.equal(b.mount.querySelector('#home-project').value,'');
});

test('production contact includes privacy and appointment clarification without prices',()=>{
 const b=boot();b.review();
 assert.equal(b.mount.querySelector('a').attrs.href,'/privacy.html');
 assert.ok(b.mount.querySelectorAll('p').some(n=>/does not book an appointment/.test(n.textContent)));
 const source=fs.readFileSync('js/home-intake.js','utf8');
 assert.doesNotMatch(source,/\$\s?(?:250|195|249)|localStorage|sessionStorage|design-explorations\//);
});
