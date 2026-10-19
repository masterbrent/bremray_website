(function(root){
 'use strict';
 const option=(value,label)=>({value,label});
 const unsure=option('unknown','Not sure');
 const question=(id,title,help,options)=>({id,title,help,options});
 const q={
  service:question('service','What would you like help with?','Pick the closest match. You can also describe the job in your own words.',[
   option('lighting','Lights'),option('ev','EV charger'),option('generator','Backup power'),option('panel','Electrical panel')]),
  lighting_kind:question('lighting_kind','Are you replacing lights or adding new ones?','This helps us understand whether new wiring may be needed.',[
   option('replacement','Replace existing lights'),option('new','Add lights in a new spot'),unsure]),
  lighting_wire:question('lighting_wire','Is there already a wire where the new light will go?','Only tell us what you already know. No need to open anything or check wiring.',[
   option('yes','Yes, a wire is already there'),option('no','No, it needs a wire'),unsure]),
  lighting_access:question('lighting_access','What is above the room?','This gives us an idea of how we could run a wire.',[
   option('attic','An attic'),option('room','Another room'),option('roof','The roof, with no attic'),unsure]),
  lighting_count:question('lighting_count','How many lights are you thinking about?','A rough idea is fine.',[
   option('one','One light'),option('few','2–4 lights'),option('many','5 or more'),unsure]),
  lighting_place:question('lighting_place','Where are the lights?','Choose the closest match.',[
   option('ceiling','Inside, on the ceiling'),option('wall','Inside, on the wall'),option('outside','Outside'),unsure]),
  ev_place:question('ev_place','Where would you charge your car?','Pick the spot you have in mind.',[
   option('garage','Inside a garage'),option('driveway','In the driveway'),option('other','Somewhere else'),unsure]),
  ev_charger:question('ev_charger','Have you picked a charger?','You do not need to choose one before talking to us.',[
   option('have','I already have one'),option('picked','I have one in mind'),option('help','I need help choosing'),unsure]),
  ev_distance:question('ev_distance','How close is the electrical panel to that spot?','A rough idea helps us plan the wiring. No measuring needed.',[
   option('near','Nearby, in the same area'),option('far','In another part of the house'),option('separate','The garage is a separate building'),unsure]),
  generator_backup:question('generator_backup','What do you want to keep running?','Think about what matters to you during an outage.',[
   option('essentials','Just the essentials'),option('most','Most of the house'),unsure]),
  generator_fuel:question('generator_fuel','Does your home use natural gas or propane?','This helps us understand your backup-power options.',[
   option('gas','Natural gas'),option('propane','Propane'),option('neither','Neither'),unsure]),
  generator_current:question('generator_current','Do you use a generator now?','We can work from what you already have.',[
   option('portable','Yes, a portable generator'),option('standby','Yes, a permanently installed generator'),option('none','No'),unsure]),
  panel_reason:question('panel_reason','What brought you here?','Tell us what you want to solve. You do not need to know which panel you need.',[
   option('more','I’m adding something that needs power'),option('problem','Something is not working right'),option('old','I’m concerned about an old panel'),unsure]),
  panel_addition:question('panel_addition','What are you adding?','This helps us understand the extra power you may need.',[
   option('ev','An EV charger'),option('heating','Heating or cooling equipment'),option('addition','An addition or renovation'),option('several','Several things'),unsure]),
  panel_problem:question('panel_problem','What have you noticed?','Choose the closest match. We will need to look at it before recommending work.',[
   option('tripping','A breaker keeps switching off'),option('power','Part of the house loses power'),option('space','There is no room for another circuit'),option('other','Something else'),unsure]),
  panel_place:question('panel_place','Where is the electrical panel?','No need to inspect it. Just tell us where it is.',[
   option('basement','In the basement'),option('garage','In the garage'),option('outside','Outside'),option('elsewhere','Somewhere else'),unsure])
 };
 function questionsFor(a={}){
  const list=[q.service];
  if(a.service==='lighting'){
   list.push(q.lighting_kind);
   if(a.lighting_kind==='new'){
    list.push(q.lighting_wire);
    if(a.lighting_wire) list.push(a.lighting_wire==='yes'?q.lighting_count:q.lighting_access);
   }else if(a.lighting_kind){list.push(q.lighting_count,q.lighting_place);}
  }
  if(a.service==='ev')list.push(q.ev_place,q.ev_charger,q.ev_distance);
  if(a.service==='generator')list.push(q.generator_backup,q.generator_fuel,q.generator_current);
  if(a.service==='panel'){
   list.push(q.panel_reason);
   if(a.panel_reason){
    if(a.panel_reason==='more')list.push(q.panel_addition);
    if(a.panel_reason==='problem')list.push(q.panel_problem);
    list.push(q.panel_place);
   }
  }
  return list;
 }
 function nextQuestion(a){return questionsFor(a).find(item=>!a[item.id]);}
 function answer(a,id,value){
  const current=questionsFor(a).find(item=>item.id===id);
  if(!current||!current.options.some(item=>item.value===value))throw new Error('Unknown answer');
  const updated={...a,[id]:value};
  const clean={};
  for(const item of questionsFor(updated)){
   if(!item.options.some(choice=>choice.value===updated[item.id]))break;
   clean[item.id]=updated[item.id];
  }
  return clean;
 }
 function cleanText(value){return String(value).slice(0,2000).trim();}
 function switchMode(state,mode){
  if(!['guided','typed'].includes(mode))throw new Error('Unknown mode');
  return {...state,mode,step:mode==='guided'?Math.max(0,questionsFor(state.answers).findIndex(item=>!state.answers[item.id])):state.step};
 }
 function review(state){return {...state,reviewMode:state.mode,mode:'review'};}
 const api={questionsFor,nextQuestion,answer,cleanText,switchMode,review};
 if(typeof module==='object'&&module.exports){module.exports=api;return;}
 root.BremrayIntake=api;
 const shell=document.getElementById('intake-screen');
 if(!shell)return;
 let answers={},step=0,typed='',mode='guided',reviewMode='guided';
 const progress=document.getElementById('intake-progress');
 const track=document.getElementById('intake-track');
 const modeButtons=document.querySelectorAll('[data-intake-mode]');
 function state(){return {answers,step,typed,mode,reviewMode};}
 function applyState(value){({answers,step,typed,mode,reviewMode}=value);}
 function el(tag,text,attrs={}){
  const node=document.createElement(tag);
  if(text!==undefined)node.textContent=text;
  Object.entries(attrs).forEach(([key,value])=>node.setAttribute(key,value));
  return node;
 }
 function button(text,handler,className='intake-primary'){
  const node=el('button',text,{type:'button',class:className});node.addEventListener('click',handler);return node;
 }
 function focusHeading(){shell.querySelector('h2, legend')?.focus({preventScroll:true});}
 function setProgress(label,percent){progress.textContent=label;track.style.width=percent+'%';}
 function render(focus=true){
  shell.replaceChildren();
  modeButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.intakeMode===(mode==='review'?reviewMode:mode))));
  if(mode==='typed')renderTyped();else if(mode==='review')renderReview();else renderQuestion();
  if(focus)focusHeading();
 }
 function renderQuestion(){
  const list=questionsFor(answers);step=Math.min(step,list.length-1);
  const item=list[step];
  setProgress('Question '+(step+1)+' of up to 4',(step+1)*25);
  const field=el('fieldset');
  field.append(el('legend',item.title,{tabindex:'-1'}));
  field.append(el('p',item.help,{class:'intake-help',id:'question-help'}));
  const choices=el('div',undefined,{class:'intake-choices'});
  let selected=answers[item.id];
  item.options.forEach(choice=>{
   const label=el('label',undefined,{class:'intake-choice'});
   const input=el('input',undefined,{type:'radio',name:item.id,value:choice.value,'aria-describedby':'question-help'});
   input.checked=selected===choice.value;
   input.addEventListener('change',()=>{selected=choice.value;next.disabled=false;});
   label.append(input,el('span',choice.label));choices.append(label);
  });
  field.append(choices);shell.append(field);
  const nav=el('div',undefined,{class:'intake-navigation'});
  if(step>0)nav.append(button('Back',()=>{step--;render();},'intake-back'));
  const next=button('Continue →',()=>{
   if(!selected)return;
   answers=answer(answers,item.id,selected);
   const missing=nextQuestion(answers);
   if(!missing){applyState(review(state()));render();return;}
   step=questionsFor(answers).findIndex(item=>item.id===missing.id);render();
  });
  next.disabled=!selected;nav.append(next);shell.append(nav);
 }
 function renderTyped(){
  setProgress('Your words. No questionnaire.',25);
  shell.append(el('h2','What do you have in mind?',{tabindex:'-1'}),el('p','Tell us what you want done, or what is not working. A sentence or two is enough.',{class:'intake-help'}));
  const label=el('label','Your project',{for:'project-details',class:'intake-field-label'});
  const area=el('textarea',undefined,{id:'project-details',rows:'6',maxlength:'2000',placeholder:'For example: We want four ceiling lights in the living room. There is an attic above it.'});
  area.value=typed;
  const count=el('p',typed.length+' / 2,000',{class:'intake-count'});
  const next=button('Review details →',()=>{typed=cleanText(area.value);if(typed){applyState(review(state()));render();}});
  next.disabled=!typed.trim();
  area.addEventListener('input',()=>{typed=area.value;count.textContent=typed.length+' / 2,000';next.disabled=!typed.trim();});
  shell.append(label,area,count,next);
 }
 function renderReview(){
  setProgress('Ready to review',100);
  shell.append(el('div','PREVIEW · NOT SENT',{class:'intake-kicker'}),el('h2','Here’s what you told us.',{tabindex:'-1'}));
  if(reviewMode==='typed'){
   shell.append(el('p',cleanText(typed),{class:'intake-typed-review'}));
   shell.append(button('Edit my description',()=>{mode='typed';render();},'intake-back'));
  }else{
   const summary=el('dl',undefined,{class:'intake-summary'});
   questionsFor(answers).forEach((item,index)=>{
    const choice=item.options.find(o=>o.value===answers[item.id]);if(!choice)return;
    const row=el('div');
    const copy=el('div');copy.append(el('dt',item.title),el('dd',choice.label));
    row.append(copy,button('Edit',()=>{mode='guided';step=index;render();},'intake-edit'));summary.append(row);
   });shell.append(summary);
  }
  const note=el('div',undefined,{class:'intake-review-note'});
  note.append(el('h3','This is a preview.'),el('p','Nothing is sent to Bremray or Housecall Pro. This version does not calculate a price or book a visit.'));
  shell.append(note,button('Try another project',()=>{answers={};typed='';step=0;mode='guided';render();},'intake-primary'));
 }
 modeButtons.forEach(b=>b.addEventListener('click',()=>{
  applyState(switchMode(state(),b.dataset.intakeMode));
  render();
 }));
 render(false);
})(typeof window!=='undefined'?window:globalThis);
