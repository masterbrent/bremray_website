const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const rules=require('../js/adaptive-intake.js');
function boot(){
 class Element{
  constructor(tag){this.tag=tag;this.children=[];this.attrs={};this.listeners={};this.value='';this.classList={add:v=>this.attrs.class=((this.attrs.class||'')+' '+v).trim()};}
  setAttribute(k,v){this.attrs[k]=String(v);}
  append(...children){this.children.push(...children);}
  replaceChildren(...children){this.children=children;}
  addEventListener(e,fn){this.listeners[e]=fn;}
  querySelectorAll(s){return this.children.flatMap(c=>[...(s===c.tag||s[0]==='#'&&c.attrs.id===s.slice(1)?[c]:[]),...c.querySelectorAll(s)]);}
  querySelector(s){return this.querySelectorAll(s)[0]||null;}
  focus(){} getBoundingClientRect(){return{top:120};} scrollIntoView(){}
  setCustomValidity(v){this.invalid=v;} reportValidity(){return !this.invalid;}
 }
 const mount=new Element('div');
 const document={querySelector:()=>mount,createElement:tag=>new Element(tag)};
 const window={BremrayIntake:rules,innerHeight:900,fetch:()=>{throw Error('Preview tried to send');}};
 vm.runInNewContext(fs.readFileSync('design-explorations/shared/flow.js','utf8'),{window,document});
 const click=text=>{const b=mount.querySelectorAll('button').find(x=>x.textContent===text);assert.ok(b,text);b.listeners.click();};
 const pick=value=>{const b=mount.querySelectorAll('button').find(x=>x.attrs['data-choice']===value);assert.ok(b,value);b.listeners.click();};
 const fill=(id,value)=>{const n=mount.querySelector('#demo-'+id);assert.ok(n,id);n.value=value;n.listeners.input();};
 const submit=()=>mount.querySelector('form').listeners.submit({preventDefault(){}});
 return {mount,click,pick,fill,submit};
}
test('outlet flow keeps the context, rejects a bad phone, and explicitly finishes without sending',()=>{
 const b=boot();b.pick('repair');b.pick('outlet');b.pick('recent');b.pick('nearby');
 assert.equal(b.mount.querySelector('h2').textContent,'Let’s check that outlet.');
 b.fill('name','Preview Test');b.fill('phone','123');b.submit();
 assert.match(b.mount.querySelector('#demo-phone').invalid,/10-digit/);
 b.fill('phone','7345550123');b.submit();
 assert.equal(b.mount.querySelector('h2').textContent,'That’s the complete flow.');
 assert.ok(b.mount.querySelectorAll('p').some(n=>/No request was sent/.test(n.textContent)));
 b.click('Try another project →');assert.equal(b.mount.querySelector('h2').textContent,'What do you need done?');
});
test('typed alternative preserves text when reviewing and editing',()=>{
 const b=boot();b.click('I’d rather type');b.fill('project','Install a ceiling fan in our bedroom.');b.click('Review details →');
 assert.ok(b.mount.querySelectorAll('p').some(n=>n.textContent==='Install a ceiling fan in our bedroom.'));
 b.click('Edit answers');assert.equal(b.mount.querySelector('#demo-project').value,'Install a ceiling fan in our bedroom.');
});
