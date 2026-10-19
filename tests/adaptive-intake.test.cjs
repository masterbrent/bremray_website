const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const intake=require('../js/adaptive-intake.js');

test('lighting asks about wiring and access only when that affects the work',()=>{
 let answers=intake.answer({},'service','lighting');
 answers=intake.answer(answers,'lighting_kind','new');
 assert.equal(intake.nextQuestion(answers).id,'lighting_wire');
 answers=intake.answer(answers,'lighting_wire','no');
 assert.equal(intake.nextQuestion(answers).id,'lighting_access');
 answers=intake.answer(answers,'lighting_wire','yes');
 assert.equal(intake.nextQuestion(answers).id,'lighting_count');
 answers=intake.answer(answers,'lighting_kind','replacement');
 assert.equal(intake.nextQuestion(answers).id,'lighting_count');
 assert.equal(answers.lighting_wire,undefined);
});

test('every branch ends within four questions and gives an uncertain customer a way through',()=>{
 let paths=0;
 function walk(answers){
  const q=intake.nextQuestion(answers);
  assert.ok(intake.questionsFor(answers).length<=4);
  if(!q){paths++;return;}
  if(q.id!=='service') assert.ok(q.options.some(o=>o.value==='unknown'),q.id);
  for(const choice of q.options) walk(intake.answer(answers,q.id,choice.value));
 }
 walk({});
 assert.ok(paths>100);
});

test('editing preserves still-relevant answers and removes stale branch values',()=>{
 let answers={service:'lighting',lighting_kind:'new',lighting_wire:'no',lighting_access:'attic'};
 assert.deepEqual(intake.answer(answers,'lighting_wire','no'),answers);
 answers=intake.answer(answers,'lighting_wire','yes');
 assert.equal(answers.lighting_access,undefined);
 answers=intake.answer(answers,'lighting_count','few');
 answers=intake.answer(answers,'lighting_kind','replacement');
 assert.equal(answers.lighting_count,'few');
 assert.equal(answers.lighting_wire,undefined);
 answers=intake.answer(answers,'service','ev');
 assert.deepEqual(answers,{service:'ev'});
 assert.throws(()=>intake.answer(answers,'service','injected'));
});

test('typed details remain plain text, bounded, and do not submit',()=>{
 const malicious='<img src=x onerror=alert(1)> & my lights';
 assert.equal(intake.cleanText(malicious),malicious);
 assert.equal(intake.cleanText('x'.repeat(2100)).length,2000);
 const js=fs.readFileSync(require.resolve('../js/adaptive-intake.js'),'utf8');
 assert.doesNotMatch(js,/innerHTML|insertAdjacentHTML|fetch\(|XMLHttpRequest|sendBeacon|localStorage/);
 const html=fs.readFileSync(require.resolve('../adaptive-intake.html'),'utf8');
 assert.match(html,/noindex,nofollow/);
 assert.doesNotMatch(html,/housecallpro|analytics\.js|<iframe|<form[^>]*action=/i);
 assert.match(html,/Nothing is sent/);
});

test('switching answer modes preserves both drafts and reviews the chosen mode',()=>{
 const initial={mode:'typed',reviewMode:'typed',step:0,typed:'Four lights in our kitchen.',answers:{service:'lighting',lighting_kind:'new'}};
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
