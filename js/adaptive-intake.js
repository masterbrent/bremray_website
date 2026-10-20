(function(root){
 'use strict';
 const option=(value,label)=>({value,label});
 const unsure=option('unknown','Not sure');
 const other=option('other','Something else');
 const multiple=option('multiple','A few different things');
 const question=(id,title,help,options)=>({id,title,help,options});
 const q={
  intent:question('intent','What do you need done?','',[
   option('repair','Something isn’t working'),option('install','Install something new'),option('upgrade','Replace or upgrade something'),option('unknown','I’m not sure')]),
  repair_item:question('repair_item','What isn’t working?','Choose the closest match.',[
   option('outlet','An outlet'),option('light','A light or switch'),option('breaker','A breaker keeps switching off'),option('power','Several things or part of the house'),option('generator','A generator'),multiple,other,unsure]),
  install_item:question('install_item','What would you like installed?','Choose the closest match. There is room for other jobs, too.',[
   option('lighting','Lights'),option('fan','A ceiling fan'),option('outlet','An outlet or switch'),option('ev','An EV charger'),option('generator','Backup power'),option('power','Power for an appliance, equipment or garage'),multiple,other,unsure]),
  upgrade_item:question('upgrade_item','What would you like to replace or upgrade?','Tell us what you have in mind.',[
   option('panel','The electrical panel'),option('lighting','Lights'),option('fan','A ceiling fan'),option('outlet','Outlets or switches'),option('generator','A generator'),multiple,other,unsure]),
  repair_when:question('repair_when','When did it stop working?','A rough idea is fine.',[
   option('recent','Today or yesterday'),option('week','Within the last week'),option('longer','Longer ago'),option('intermittent','It comes and goes'),unsure]),
  repair_extent:question('repair_extent','Did anything else lose power?','Just tell us what you have noticed. No need to test or open anything.',[
   option('only','No, just that one thing'),option('nearby','Yes, other things nearby'),option('elsewhere','Yes, in other parts of the house'),unsure]),
  repair_change:question('repair_change','Did anything change around the time it started?','Only tell us what you already noticed.',[
   option('equipment','We started using something new'),option('work','There was work done at the house'),option('weather','There was a storm or outage'),option('nothing','Nothing that I know of'),unsure]),
  generator_problem:question('generator_problem','What has the generator been doing?','Choose the closest match. You can describe anything else in your own words.',[
   option('start','It will not start'),option('power','It runs but does not provide power'),option('warning','It shows a warning'),other,unsure]),
  lighting_wire:question('lighting_wire','Is there already a light or a wire at that spot?','Only tell us what you already know. No need to open anything or check wiring.',[
   option('fixture','There is already a light'),option('yes','There is a wire, but no light'),option('no','No, it needs a wire'),unsure]),
  lighting_access:question('lighting_access','What is above the room?','This gives us an idea of how we could run a wire.',[
   option('attic','An attic'),option('room','Another room'),option('roof','The roof, with no attic'),unsure]),
  lighting_count:question('lighting_count','How many lights are you thinking about?','A rough idea is fine.',[
   option('one','One light'),option('few','2–4 lights'),option('many','5 or more'),unsure]),
  lighting_place:question('lighting_place','Where are the lights?','Choose the closest match.',[
   option('ceiling','Inside, on the ceiling'),option('wall','Inside, on the wall'),option('outside','Outside'),unsure]),
  fan_existing:question('fan_existing','What is there now?','No need to inspect it. Just tell us what is already in that spot.',[
   option('fan','A ceiling fan'),option('light','A light fixture'),option('nothing','Nothing yet'),unsure]),
  fan_height:question('fan_height','How high is the ceiling?','No measuring needed. A rough idea is fine.',[
   option('normal','A standard-height ceiling'),option('high','A high or vaulted ceiling'),unsure]),
  outlet_need:question('outlet_need','What do you need at that spot?','Choose the closest match.',[
   option('outlet','An outlet to plug something in'),option('switch','A switch to control a light or fan'),option('both','Both'),unsure]),
  outlet_place:question('outlet_place','Where will it go?','Choose the closest match.',[
   option('room','Inside the house'),option('garage','In the garage'),option('outside','Outside'),unsure]),
  outlet_replace:question('outlet_replace','What would you like to change?','Choose the closest match.',[
   option('worn','Replace worn or damaged outlets or switches'),option('look','Change the style or color'),option('features','Add a feature, like dimming or USB charging'),other,unsure]),
  outlet_count:question('outlet_count','How many outlets or switches?','A rough idea is fine.',[
   option('one','One'),option('few','2–4'),option('many','5 or more'),unsure]),
  ev_place:question('ev_place','Where would you charge your car?','Pick the spot you have in mind.',[
   option('garage','Inside a garage'),option('driveway','In the driveway'),option('other','Somewhere else'),unsure]),
  ev_existing:question('ev_existing','Is anything already set up for charging there?','Only tell us what you already know.',[
   option('charger','There is an existing charger'),option('wiring','There is an outlet or wire meant for a charger'),option('none','Nothing yet'),unsure]),
  ev_distance:question('ev_distance','How close is the electrical panel to that spot?','A rough idea helps us plan the wiring. No measuring needed.',[
   option('near','Nearby, in the same area'),option('far','In another part of the house'),option('separate','The garage is a separate building'),unsure]),
  generator_backup:question('generator_backup','What do you want to keep running?','Think about what matters to you during an outage.',[
   option('essentials','Just the essentials'),option('most','Most of the house'),unsure]),
  generator_fuel:question('generator_fuel','Does your home use natural gas or propane?','This helps us understand your backup-power options.',[
   option('gas','Natural gas'),option('propane','Propane'),option('neither','Neither'),unsure]),
  power_kind:question('power_kind','What needs power?','Choose the closest match.',[
   option('appliance','An appliance or other equipment'),option('garage','A garage or separate building'),other,unsure]),
  appliance_type:question('appliance_type','What are you connecting?','Choose the closest match.',[
   option('kitchen','A kitchen or laundry appliance'),option('heating','Heating or cooling equipment'),option('sauna','A sauna or hot tub'),option('workshop','Workshop equipment'),other,unsure]),
  appliance_existing:question('appliance_existing','Was similar equipment connected in that spot before?','Only tell us what you already know.',[
   option('yes','Yes'),option('no','No, this is a new spot'),unsure]),
  garage_existing:question('garage_existing','Is there power in the building now?','Only tell us what you already know.',[
   option('yes','Yes, but we need more'),option('none','No'),unsure]),
  garage_building:question('garage_building','Is it attached to the house?','This helps us understand where wiring would need to go.',[
   option('attached','Yes, it is attached'),option('separate','No, it is a separate building'),unsure]),
  panel_reason:question('panel_reason','What do you want to solve?','You do not need to decide which panel or size you need.',[
   option('more','I’m adding something that needs power'),option('problem','Something is not working right'),option('old','I’m concerned about an old panel'),unsure]),
  panel_addition:question('panel_addition','What are you adding?','This helps us understand the extra power you may need.',[
   option('ev','An EV charger'),option('heating','Heating or cooling equipment'),option('addition','An addition or renovation'),option('several','Several things'),other,unsure]),
  panel_symptom:question('panel_symptom','What have you noticed?','Just tell us what you have already seen. No need to open or test anything.',[
   option('breaker','A breaker keeps switching off'),option('power','Some things lose power'),option('damage','The panel looks damaged or worn'),other,unsure]),
  panel_when:question('panel_when','When did you first notice it?','A rough idea is fine.',[
   option('recent','Today or yesterday'),option('week','Within the last week'),option('longer','Longer ago'),unsure]),
  panel_place:question('panel_place','Where is the electrical panel?','No need to inspect it. Just tell us where it is.',[
   option('basement','In the basement'),option('garage','In the garage'),option('outside','Outside'),option('elsewhere','Somewhere else'),unsure]),
  details:{id:'details',type:'text',title:'Tell us a little about it.',help:'A sentence or two is enough. If there are a few jobs, you can list them here. This is optional.'}
 };
 const fallback=value=>['other','multiple','unknown'].includes(value);
 function questionsFor(a={}){
  const list=[q.intent];
  if(!a.intent)return list;
  if(a.intent==='unknown')return [...list,q.details];
  const itemKey=a.intent+'_item';
  list.push(q[itemKey]);
  const item=a[itemKey];
  if(!item)return list;
  if(fallback(item))return [...list,q.details];
  if(a.intent==='repair'){
   if(item==='generator')return [...list,q.generator_problem,fallback(a.generator_problem)?q.details:q.repair_when];
   return [...list,q.repair_when,item==='power'?q.repair_change:q.repair_extent];
  }
  if(item==='lighting'){
   if(a.intent==='upgrade')return [...list,q.lighting_count,q.lighting_place];
   list.push(q.lighting_wire,q.lighting_count);
   if(['no','unknown'].includes(a.lighting_wire))list.push(q.lighting_access);
  }
  if(item==='fan')list.push(q.fan_existing,q.fan_height);
  if(item==='outlet'){
   if(a.intent==='upgrade')list.push(q.outlet_replace,fallback(a.outlet_replace)?q.details:q.outlet_count);
   else list.push(q.outlet_need,q.outlet_place);
  }
  if(item==='ev'){
   list.push(q.ev_place,q.ev_existing);
   if(['none','unknown'].includes(a.ev_existing))list.push(q.ev_distance);
  }
  if(item==='generator')list.push(q.generator_backup,q.generator_fuel);
  if(item==='power'){
   list.push(q.power_kind);
   if(fallback(a.power_kind))list.push(q.details);
   if(a.power_kind==='appliance')list.push(q.appliance_type,fallback(a.appliance_type)?q.details:q.appliance_existing);
   if(a.power_kind==='garage')list.push(q.garage_existing,q.garage_building);
  }
  if(item==='panel'){
   list.push(q.panel_reason);
   if(a.panel_reason==='more'){
    list.push(q.panel_addition);
    if(fallback(a.panel_addition))list.push(q.details);
   }
   else if(a.panel_reason==='problem')list.push(q.panel_symptom,fallback(a.panel_symptom)?q.details:q.panel_when);
   else if(a.panel_reason)list.push(q.panel_place);
  }
  return list;
 }
 function hasAnswer(a,item){return item.type==='text'?Object.prototype.hasOwnProperty.call(a,item.id):Boolean(a[item.id]);}
 function nextQuestion(a){return questionsFor(a).find(item=>!hasAnswer(a,item));}
 function answer(a,id,value){
  const current=questionsFor(a).find(item=>item.id===id);
  if(!current||(current.type!=='text'&&!current.options.some(item=>item.value===value)))throw new Error('Unknown answer');
  const updated={...a,[id]:current.type==='text'?cleanText(value):value};
  // Intent and item changes establish a different job. Do not carry its details over.
  if((id==='intent'||id.endsWith('_item')||id==='power_kind')&&a[id]!==value){
   let passed=false;
   for(const item of questionsFor(a)){if(passed)delete updated[item.id];if(item.id===id)passed=true;}
  }
  const clean={};
  for(const item of questionsFor(updated)){
   if(!hasAnswer(updated,item))break;
   if(item.type!=='text'&&!item.options.some(choice=>choice.value===updated[item.id]))break;
   clean[item.id]=updated[item.id];
  }
  return clean;
 }
 function cleanText(value){return String(value).slice(0,2000).trim();}
 function switchMode(state,mode){
  if(!['guided','typed'].includes(mode))throw new Error('Unknown mode');
  return {...state,mode,step:mode==='guided'?Math.max(0,questionsFor(state.answers).findIndex(item=>!hasAnswer(state.answers,item))):state.step};
 }
 function review(state){return {...state,reviewMode:state.mode,mode:'review'};}
 function advance(state,id,value){
  const updated={...state,answers:answer(state.answers,id,value)};
  const missing=nextQuestion(updated.answers);
  if(!missing)return review(updated);
  return {...updated,step:questionsFor(updated.answers).findIndex(item=>item.id===missing.id)};
 }
 function viewFor(state){
  if(state.mode!=='guided')return state.mode;
  const list=questionsFor(state.answers);
  return list[Math.max(0,Math.min(state.step,list.length-1))]?.id==='intent'?'opening':'question';
 }
 const api={questionsFor,nextQuestion,answer,cleanText,switchMode,review,advance,viewFor};
 if(typeof module==='object'&&module.exports){module.exports=api;return;}
 root.BremrayIntake=api;
 const shell=document.getElementById('intake-screen');
 if(!shell)return;
 let answers={},step=0,typed='',mode='guided',reviewMode='guided';
 const progress=document.getElementById('intake-progress');
 const track=document.getElementById('intake-track');
 const path=document.getElementById('intake-path');
 const secondary=document.getElementById('intake-secondary');
 const openingPhotos={
  repair:{src:'/images/home-phone-v2.jpg',detail:'Outlets, lights, lost power and more'},
  install:{src:'/images/ev-charging.jpg',detail:'Lights, chargers, new circuits and more'},
  upgrade:{src:'/images/panel.jpg',detail:'Panels, fixtures, switches and more'}
 };
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
 function focusHeading(){
  const heading=shell.querySelector('h2, legend');
  if(!heading)return;
  heading.focus({preventScroll:true});
  const bounds=heading.getBoundingClientRect();
  const anchor=path&&!path.hidden?path:heading;
  if(anchor.getBoundingClientRect().top<24||bounds.bottom>window.innerHeight-100)anchor.scrollIntoView({block:'start'});
 }
 function setProgress(label,percent){progress.textContent=label;track.style.width=percent+'%';}
 function render(focus=true){
  shell.replaceChildren();
  secondary?.querySelector('.intake-choice-secondary')?.remove();
  shell.closest('.intake-card')?.setAttribute('data-intake-view',viewFor(state()));
  modeButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.intakeMode===(mode==='review'?reviewMode:mode))));
  if(mode==='typed')renderTyped();else if(mode==='review')renderReview();else renderQuestion();
  renderPath();
  if(focus)focusHeading();
 }
 function renderPath(){
  if(!path)return;
  path.replaceChildren();
  const answered=mode==='guided'?questionsFor(answers).slice(0,step):[];
  answered.forEach((item,index)=>{
   const label=item.options?.find(choice=>choice.value===answers[item.id])?.label;
   if(!label)return;
   const edit=button(label,()=>{mode='guided';step=index;render();},'intake-path-choice');
   edit.setAttribute('aria-label','Change answer: '+label);
   edit.setAttribute('title','Change this answer');
   path.append(edit);
  });
  path.hidden=path.childElementCount===0;
 }
 function renderQuestion(){
  const list=questionsFor(answers);step=Math.min(step,list.length-1);
  const item=list[step];
  setProgress('Question '+(step+1),(step+1)*20);
  const field=el('fieldset');
  field.append(el('legend',item.title,{tabindex:'-1'}));
  if(item.help)field.append(el('p',item.help,{class:'intake-help',id:'question-help'}));
  const choices=el('div',undefined,{class:'intake-choices'+(item.options?.length>6?' intake-choices-compact':'')});
  let selected=answers[item.id];
  if(item.type==='text'){
   selected=selected||'';
   const label=el('label','A few details (optional)',{for:'guided-details',class:'intake-field-label'});
   const area=el('textarea',undefined,{id:'guided-details',rows:'5',maxlength:'2000','aria-describedby':'question-help'});
   area.value=selected;
   const count=el('p',selected.length+' / 2,000',{class:'intake-count'});
   area.addEventListener('input',()=>{selected=area.value;answers=answer(answers,item.id,selected);count.textContent=selected.length+' / 2,000';});
   choices.append(label,area,count);
  }else item.options.forEach(choice=>{
   const pick=button('',()=>{applyState(advance(state(),item.id,choice.value));render();},'intake-choice');
   pick.setAttribute('aria-pressed',String(selected===choice.value));
   pick.setAttribute('data-choice',choice.value);
   if(item.help)pick.setAttribute('aria-describedby','question-help');
   const photo=secondary&&item.id==='intent'?openingPhotos[choice.value]:undefined;
   if(photo){
    pick.classList.add('intake-visual-choice');
    pick.setAttribute('aria-label',choice.label);
    pick.setAttribute('aria-describedby','choice-detail-'+choice.value);
    pick.append(el('img',undefined,{src:photo.src,alt:'',width:'600',height:'400',class:'intake-choice-image'}));
    const copy=el('span',undefined,{class:'intake-choice-copy'});
    copy.append(el('span',choice.label,{class:'intake-choice-title'}),el('span',photo.detail,{class:'intake-choice-detail',id:'choice-detail-'+choice.value}));
    pick.append(copy);
   }else pick.append(el('span',choice.label));
   pick.append(el('span','→',{'aria-hidden':'true',class:'intake-choice-arrow'}));
   if(secondary&&item.id==='intent'&&choice.value==='unknown'){
    pick.classList.add('intake-choice-secondary');
    secondary.prepend(pick);return;
   }
   choices.append(pick);
  });
  field.append(choices);shell.append(field);
  const nav=el('div',undefined,{class:'intake-navigation'});
  if(step>0)nav.append(button('Back',()=>{step--;render();},'intake-back'));
  if(item.type==='text')nav.append(button('Review details →',()=>{applyState(advance(state(),item.id,selected));render();}));
  if(nav.childElementCount)shell.append(nav);
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
    if(!hasAnswer(answers,item))return;
    const label=item.type==='text'?(answers[item.id]||'No extra details added'):item.options.find(o=>o.value===answers[item.id])?.label;
    if(label===undefined)return;
    const row=el('div');
    const copy=el('div');copy.append(el('dt',item.title),el('dd',label));
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
