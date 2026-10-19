const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const intake=require('../js/adaptive-intake.js');
const take=(answers,id,value)=>intake.answer(answers,id,value);

test('presentation follows the displayed question, including Back and mode changes',()=>{
 const initial={mode:'guided',answers:{},step:0};
 assert.equal(intake.viewFor(initial),'opening');
 const next=intake.advance(initial,'intent','install');
 assert.equal(intake.viewFor(next),'question');
 assert.equal(intake.viewFor({...next,step:0}),'opening');
 assert.equal(intake.viewFor({...next,mode:'typed'}),'typed');
 assert.equal(intake.viewFor({...next,mode:'review'}),'review');
});

test('starts with customer intent and offers more than the headline installation services',()=>{
 const first=intake.nextQuestion({});
 assert.equal(first.id,'intent');
 assert.deepEqual(first.options.map(o=>o.value),['repair','install','upgrade','unknown']);
 const install=intake.nextQuestion(take({},'intent','install'));
 assert.equal(install.title,'What would you like installed?');
 for(const item of ['lighting','fan','outlet','power','other','multiple','unknown'])assert.ok(install.options.some(o=>o.value===item),item);
});

test('outlet repair asks when it stopped and whether anything else lost power',()=>{
 let a=take({},'intent','repair');
 a=take(a,'repair_item','outlet');
 assert.equal(intake.nextQuestion(a).id,'repair_when');
 a=take(a,'repair_when','recent');
 assert.equal(intake.nextQuestion(a).id,'repair_extent');
 a=take(a,'repair_extent','only');
 assert.equal(intake.nextQuestion(a),undefined);
});

test('new lighting keeps count, wiring and access when relevant and skips unnecessary access questions',()=>{
 let a=take({},'intent','install');
 a=take(a,'install_item','lighting');
 assert.equal(intake.nextQuestion(a).id,'lighting_wire');
 a=take(a,'lighting_wire','no');
 a=take(a,'lighting_count','few');
 assert.equal(intake.nextQuestion(a).id,'lighting_access');
 a=take(a,'lighting_access','attic');
 assert.equal(intake.questionsFor(a).length,5);
 a=take(a,'lighting_wire','yes');
 assert.equal(a.lighting_count,'few');
 assert.equal(a.lighting_access,undefined);
 assert.equal(intake.nextQuestion(a),undefined);
});

test('appliance and garage power take different useful followups',()=>{
 let a={intent:'install',install_item:'power'};
 a=take(a,'power_kind','garage');
 assert.equal(intake.nextQuestion(a).id,'garage_existing');
 a=take(a,'garage_existing','none');
 assert.equal(intake.nextQuestion(a).id,'garage_building');
 a=take(a,'power_kind','appliance');
 assert.equal(a.garage_existing,undefined);
 assert.equal(intake.nextQuestion(a).id,'appliance_type');
});

test('other, multiple jobs and uncertainty offer an optional description without losing the intent',()=>{
 for(const [intent,itemKey] of [['repair','repair_item'],['install','install_item'],['upgrade','upgrade_item']]){
  for(const value of ['other','multiple','unknown']){
   let a=take(take({},'intent',intent),itemKey,value);
   assert.equal(intake.nextQuestion(a).id,'details');
   a=take(a,'details','An outlet and two ceiling lights.');
   assert.equal(a.intent,intent);
   assert.equal(a[itemKey],value);
   assert.equal(a.details,'An outlet and two ceiling lights.');
   assert.equal(intake.nextQuestion(a),undefined);
  }
 }
 let a=take({},'intent','unknown');
 a=take(a,'details','');
 assert.equal(intake.nextQuestion(a),undefined,'optional text can be skipped');
});

test('all question paths terminate within five questions and accept uncertainty',()=>{
 let paths=0;
 function walk(a){
  const item=intake.nextQuestion(a);
  assert.ok(intake.questionsFor(a).length<=5);
  if(!item){paths++;return;}
  if(item.type==='text'){walk(take(a,item.id,''));walk(take(a,item.id,'A little context.'));return;}
  assert.ok(item.options.some(o=>o.value==='unknown'),item.id);
  for(const choice of item.options)walk(take(a,item.id,choice.value));
 }
 walk({});
 assert.ok(paths>100);
});

test('editing item or intent removes stale answers, while unchanged selections preserve the draft',()=>{
 const original={intent:'install',install_item:'lighting',lighting_wire:'no',lighting_count:'few',lighting_access:'attic'};
 assert.deepEqual(take(original,'install_item','lighting'),original);
 assert.deepEqual(take(original,'install_item','fan'),{intent:'install',install_item:'fan'});
 assert.deepEqual(take(original,'intent','repair'),{intent:'repair'});
 assert.throws(()=>take(original,'intent','injected'));
});

test('typed details remain bounded plain text and never submit',()=>{
 const malicious='<img src=x onerror=alert(1)> & my lights';
 assert.equal(intake.cleanText(malicious),malicious);
 assert.equal(take({intent:'unknown'},'details',malicious).details,malicious);
 assert.equal(intake.cleanText('x'.repeat(2100)).length,2000);
 const js=fs.readFileSync(require.resolve('../js/adaptive-intake.js'),'utf8');
 assert.doesNotMatch(js,/innerHTML|insertAdjacentHTML|fetch\(|XMLHttpRequest|sendBeacon|localStorage/);
 assert.doesNotMatch(js,/of up to 4/);
 const html=fs.readFileSync(require.resolve('../adaptive-intake.html'),'utf8');
 assert.match(html,/noindex,nofollow/);
 assert.doesNotMatch(html,/housecallpro|analytics\.js|<iframe|<form[^>]*action=/i);
 assert.match(html,/Nothing is sent/);
});

test('switching answer modes preserves both drafts and reviews the chosen mode',()=>{
 const initial={mode:'typed',reviewMode:'typed',step:0,typed:'Four lights in our kitchen.',answers:{intent:'install',install_item:'lighting'}};
 const guided=intake.switchMode(initial,'guided');
 assert.equal(guided.typed,initial.typed);
 assert.deepEqual(guided.answers,initial.answers);
 assert.equal(guided.step,2);
 assert.equal(intake.review(guided).reviewMode,'guided');
 const typed=intake.switchMode(intake.review(guided),'typed');
 assert.equal(typed.typed,initial.typed);
 assert.deepEqual(typed.answers,initial.answers);
 assert.equal(intake.review(typed).reviewMode,'typed');
});

test('nested Other choices collect a short description and retain their job context',()=>{
 const paths=[
  {a:{intent:'repair',repair_item:'generator'},id:'generator_problem'},
  {a:{intent:'install',install_item:'power',power_kind:'appliance'},id:'appliance_type'},
  {a:{intent:'upgrade',upgrade_item:'outlet'},id:'outlet_replace'},
  {a:{intent:'upgrade',upgrade_item:'panel',panel_reason:'more'},id:'panel_addition'}
 ];
 for(const {a,id} of paths){
  let updated=take(a,id,'other');
  assert.equal(intake.nextQuestion(updated).id,'details',id);
  updated=take(updated,'details','A detail that does not fit the choices.');
  for(const [key,value] of Object.entries(a))assert.equal(updated[key],value);
  assert.equal(updated.details,'A detail that does not fit the choices.');
  assert.equal(intake.nextQuestion(updated),undefined);
  assert.ok(intake.questionsFor(updated).length<=5);
 }
});

test('panel problems capture the symptom before timing and allow an unlisted symptom',()=>{
 let a={intent:'upgrade',upgrade_item:'panel',panel_reason:'problem'};
 assert.equal(intake.nextQuestion(a).id,'panel_symptom');
 a=take(a,'panel_symptom','breaker');
 assert.equal(intake.nextQuestion(a).id,'panel_when');
 a=take(a,'panel_when','recent');
 assert.equal(intake.nextQuestion(a),undefined);
 a=take(a,'panel_symptom','other');
 assert.equal(a.panel_when,undefined);
 assert.equal(intake.nextQuestion(a).id,'details');
});

test('one choice advances immediately, with a final choice opening review',()=>{
 const initial={mode:'guided',reviewMode:'guided',step:0,typed:'Keep my typed draft.',answers:{}};
 let state=intake.advance(initial,'intent','repair');
 assert.equal(state.step,1);
 assert.equal(state.answers.intent,'repair');
 assert.equal(state.typed,initial.typed);
 state=intake.advance(state,'repair_item','outlet');
 assert.equal(state.step,2);
 state=intake.advance(state,'repair_when','recent');
 assert.equal(state.step,3);
 state=intake.advance(state,'repair_extent','only');
 assert.equal(state.mode,'review');
 assert.equal(state.reviewMode,'guided');
});
