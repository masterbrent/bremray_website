const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
// Small DOM fixture exercises the real event handlers without loading a browser.
function boot({endpoint='',fetch}={}){
 class Element{
  constructor(tag){this.tag=tag;this.children=[];this.attrs={};this.listeners={};this.style={};this.value='';this.disabled=false;this.hidden=false;this.classList={add:(v)=>{this.attrs.class=(this.attrs.class||'')+' '+v;}};}
  setAttribute(k,v){this.attrs[k]=String(v);if(k==='id')this.id=v;}
  getAttribute(k){return this.attrs[k]??null;}
  append(...children){for(const child of children){child.parent=this;this.children.push(child);}}
  prepend(child){child.parent=this;this.children.unshift(child);}
  replaceChildren(...children){this.children=[];this.append(...children);}
  remove(){this.parent.children=this.parent.children.filter(x=>x!==this);}
  get childElementCount(){return this.children.length;}
  addEventListener(event,fn){this.listeners[event]=fn;}
  querySelectorAll(selector){return this.children.flatMap(child=>[...(matches(child,selector)?[child]:[]),...child.querySelectorAll(selector)]);}
  querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
  closest(selector){return matches(this,selector)?this:this.parent?.closest(selector)||null;}
  focus(){this.focused=true;}
  getBoundingClientRect(){return {top:100,bottom:200};}
  scrollIntoView(){}
  setCustomValidity(value){this.invalid=value;}
  reportValidity(){return !this.invalid;}
 }
 function matches(node,selector){return selector.split(',').some(part=>{const s=part.trim();return s[0]==='#'?node.id===s.slice(1):s[0]==='.'?(node.attrs.class||'').split(' ').includes(s.slice(1)):s.startsWith('[')?node.getAttribute(s.slice(1,-1))!==null:node.tag===s;});}
 const card=new Element('div');card.setAttribute('class','intake-card');if(endpoint)card.setAttribute('data-intake-endpoint',endpoint);
 for(const id of ['intake-screen','intake-progress','intake-track','intake-path']){const el=new Element('div');el.setAttribute('id',id);card.append(el);}
 const events=[];const document={getElementById:id=>card.querySelector('#'+id),querySelectorAll:()=>[],createElement:tag=>new Element(tag),createTextNode:text=>{const el=new Element('text');el.textContent=text;return el;},dispatchEvent:event=>events.push(event.type)};
 const window={location:{origin:'https://bremray.com',pathname:'/'},innerHeight:1000,crypto:{randomUUID:()=> 'e456b1cf-a0a4-4cb5-93a8-01a323abc123'},fetch};
 vm.runInNewContext(fs.readFileSync('js/adaptive-intake.js','utf8'),{document,window,Event,AbortController,setTimeout,clearTimeout});
 const button=text=>card.querySelectorAll('button').find(x=>x.textContent===text);
 const pick=value=>card.querySelectorAll('button').find(x=>x.getAttribute('data-choice')===value).listeners.click();
 const input=(id,value)=>{const node=card.querySelector('#'+id);node.value=value;node.listeners.input();};
 const review=()=>{pick('repair');pick('outlet');pick('recent');pick('nearby');};
 const submit=()=>card.querySelector('form').listeners.submit({preventDefault(){}});
 return {card,button,pick,input,review,submit,events};
}
test('preview contact form stays disabled and never sends',async()=>{
 let calls=0;const b=boot({fetch:async()=>{calls++;}});b.review();
 assert.equal(b.button('Send request').disabled,true);
 await b.submit();assert.equal(calls,0);
});
test('real guided flow submits selected answers and contact, then shows only confirmed receipt',async()=>{
 let resolve;let sent;const b=boot({endpoint:'https://bots.propfirmbot.com/bremray-intake/v1/requests',fetch:async(url,options)=>{sent=JSON.parse(options.body);return new Promise(r=>{resolve=r;});}});
 b.review();b.input('intake-contact-name','Bremray Test');b.input('intake-contact-phone','7348227594');
 const wait=b.submit();assert.equal(b.card.querySelector('h2').textContent,'Sending your request…');assert.deepEqual(b.events,[]);
 assert.equal(sent.answers[3].answer,'Yes, other things nearby');assert.equal(sent.contact.phone,'+17348227594');
 resolve({status:201,json:async()=>({request_id:sent.request_id,status:'delivered'})});await wait;
 assert.equal(b.card.querySelector('h2').textContent,'Thanks. We’ve got your request.');assert.deepEqual(b.events,['bremray:lead-delivered']);
 assert.equal(b.card.querySelector('a').getAttribute('href'),'tel:+17342169437');
});
test('invalid phone remains editable and sends no request',async()=>{
 let calls=0;const b=boot({endpoint:'https://bots.propfirmbot.com/bremray-intake/v1/requests',fetch:async()=>{calls++;}});
 b.review();b.input('intake-contact-name','Bremray Test');b.input('intake-contact-phone','123');await b.submit();
 assert.equal(calls,0);assert.match(b.card.querySelector('#intake-contact-phone').invalid,/10-digit/);
});
test('network failure offers a status check and no second request until missing receipt is confirmed',async()=>{
 const methods=[];const b=boot({endpoint:'https://bots.propfirmbot.com/bremray-intake/v1/requests',fetch:async(url,options)=>{methods.push(options.method);if(options.method==='POST')throw Error('offline');return {status:200,json:async()=>({request_id:'e456b1cf-a0a4-4cb5-93a8-01a323abc123',status:'pending'})};}});
 b.review();b.input('intake-contact-name','Bremray Test');b.input('intake-contact-phone','7348227594');await b.submit();
 assert.equal(b.card.querySelector('h2').textContent,'We couldn’t confirm your request.');assert.equal(b.button('Send request'),undefined);
 await b.button('Check request status').listeners.click();assert.deepEqual(methods,['POST','GET']);assert.deepEqual(b.events,[]);
 assert.equal(b.card.querySelector('h2').textContent,'Your request is still being sent.');
});
