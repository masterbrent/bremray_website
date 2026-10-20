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
 // Prices belong in follow-up after successful lead capture, not in public intake assets.
 function closingFor(state){
  const a=state.answers||{};
  const generic={title:'Let’s work out what you need.',summary:'An electrician can talk through the details with you.'};
  if(state.reviewMode==='typed'||!a.intent||a.intent==='unknown')return generic;
  const item=a[a.intent+'_item'];
  if(!item||fallback(item))return generic;
  if(a.intent==='repair'){
   const titles={outlet:'Let’s get that outlet checked.',light:'Let’s check that light or switch.',breaker:'Let’s find out why the breaker keeps switching off.',power:'Let’s check the power problem.',generator:'Let’s get your generator checked.'};
   const timing={recent:'You noticed the problem today or yesterday.',week:'You noticed the problem within the last week.',longer:'The problem started more than a week ago.',intermittent:'You said the problem comes and goes.'};
   const extent={only:'You haven’t noticed anything else losing power.',nearby:'Other things nearby have also lost power.',elsewhere:'Other parts of the house have also lost power.'};
   return {title:titles[item]||generic.title,summary:[timing[a.repair_when],extent[a.repair_extent]].filter(Boolean).join(' ')||'We’ll need to find out what is causing the problem before pricing the repair.'};
  }
  const names={lighting:'lights',fan:'a ceiling fan',outlet:'outlets or switches',ev:'an EV charger',generator:'backup power',power:'power for your equipment or building',panel:'your electrical panel'};
  if(a.intent==='install')return {title:item==='power'?'You’d like power added for your equipment or building.':'You’d like '+(names[item]||'something new')+' installed.',summary:'We’ll look at what is already there and what the new installation needs.'};
  const replacementNames={...names,generator:'your generator'};
  return {title:'You’d like to replace or upgrade '+(replacementNames[item]||'something')+'.',summary:'We’ll confirm what needs changing and what can stay.'};
 }
 function phoneNumber(value){
  const raw=String(value||'').trim();
  if(!/^[+\d().\s-]+$/.test(raw))return '';
  const digits=raw.replace(/\D/g,'').replace(/^1(?=\d{10}$)/,'');
  return /^[2-9]\d{2}[2-9]\d{6}$/.test(digits)?'+1'+digits:'';
 }
 function validateContact(value){
  if(!String(value.name||'').trim()||String(value.name).length>120)return {field:'name',message:'Please enter your name.'};
  if(!['call','text','email'].includes(value.method))return {field:'method',message:'Choose how we should contact you.'};
  if(value.method==='email'){
   if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value.email||'').trim())||String(value.email).length>254)return {field:'email',message:'Please check your email address.'};
  }else if(!phoneNumber(value.phone))return {field:'phone',message:'Please enter a 10-digit phone number, including the area code.'};
  if(value.zip&&!/^\d{5}(-\d{4})?$/.test(String(value.zip).trim()))return {field:'zip',message:'Please check your ZIP code, or leave it blank.'};
  return null;
 }
 function payloadFor(state,contact,page,website=''){
  const typedMode=state.reviewMode==='typed';
  const answers=typedMode?[]:questionsFor(state.answers).filter(item=>item.type!=='text'&&hasAnswer(state.answers,item)).map(item=>({question:item.title,answer:item.options.find(choice=>choice.value===state.answers[item.id]).label}));
  return {contact:{name:contact.name.trim(),method:contact.method,phone:contact.method==='email'?'':phoneNumber(contact.phone),email:contact.method==='email'?contact.email.trim():'',zip:contact.zip.trim(),ballpark:contact.method==='text'&&Boolean(contact.ballpark)},mode:typedMode?'typed':'guided',description:cleanText(typedMode?state.typed:state.answers.details||''),answers,source:{page},website};
 }
 // A request stays in memory. A lost connection must not create a second lead.
 function createSubmission({endpoint,fetch,uuid,onDelivered=()=>{}}){
  let status=endpoint?'ready':'preview',payload=null,busy=false,reported=false;
  const state=()=>({status,request_id:payload?.request_id||'',busy});
  async function request(method){
   busy=true;
   const controller=typeof AbortController==='function'?new AbortController():null;
   const timer=controller?setTimeout(()=>controller.abort(),20000):null;
   try{
    const res=await fetch(endpoint+(method==='GET'?'/'+payload.request_id:''),{method,credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',headers:method==='POST'?{'Content-Type':'application/json'}:{},...(method==='POST'?{body:JSON.stringify(payload)}:{}),...(controller?{signal:controller.signal}:{})});
    const body=await res.json();
    if(method==='GET'&&res.status===404)status='retryable';
    else if(method==='POST'&&res.status===400&&body.error==='invalid_request')status='rejected';
    else {
     const recognized=body.request_id===payload.request_id&&['delivered','pending','uncertain','rejected'].includes(body.status);
     status=recognized&&(body.status!=='delivered'||[200,201].includes(res.status))?body.status:'unknown';
    }
    if(status==='delivered'&&!reported){reported=true;try{onDelivered();}catch(_){/* Measurement never changes the receipt. */}}
   }catch(_){status='unknown';}
   finally{busy=false;if(timer)clearTimeout(timer);}
   return state();
  }
  return {
   state,
   async submit(data){
    if(busy||!['ready','retryable'].includes(status))return state();
    if(!payload)payload={...data,request_id:uuid()};
    status='sending';return request('POST');
   },
   async check(){if(!payload||busy||status==='delivered')return state();return request('GET');},
   reset(){if(status!=='rejected')return false;payload=null;reported=false;status='ready';return true;}
  };
 }
 const api={questionsFor,nextQuestion,answer,cleanText,switchMode,review,advance,viewFor,closingFor,validateContact,payloadFor,createSubmission};
 if(typeof module==='object'&&module.exports){module.exports=api;return;}
 root.BremrayIntake=api;
 const shell=document.getElementById('intake-screen');
 if(!shell)return;
 const endpoint=shell.closest('.intake-card')?.getAttribute('data-intake-endpoint')||'';
 const uuid=()=>root.crypto.randomUUID?root.crypto.randomUUID():'10000000-1000-4000-8000-100000000000'.replace(/[018]/g,c=>(c^root.crypto.getRandomValues(new Uint8Array(1))[0]&15>>c/4).toString(16));
 const submission=createSubmission({endpoint,fetch:(...args)=>root.fetch(...args),uuid,onDelivered:()=>document.dispatchEvent(new Event('bremray:lead-delivered'))});
 let answers={},step=0,typed='',mode='guided',reviewMode='guided';
 const emptyContact=()=>({name:'',phone:'',email:'',zip:'',method:'call',ballpark:false});
 let contact=emptyContact();
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
  const delivery=submission.state();
  const locked=!['ready','preview'].includes(delivery.status);
  modeButtons.forEach(b=>{b.disabled=locked;b.setAttribute('aria-pressed',String(b.dataset.intakeMode===(mode==='review'?reviewMode:mode)));});
  if(locked){renderReceipt(delivery);if(path){path.replaceChildren();path.hidden=true;}if(focus)focusHeading();return;}
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
  const legend=el('legend',undefined,{tabindex:'-1'});
  if(secondary&&item.id==='intent')legend.append(el('h2',item.title));
  else legend.textContent=item.title;
  field.append(legend);
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
  setProgress('Your details',100);
  const closing=closingFor(state());
  const layout=el('div',undefined,{class:'intake-result-layout'});
  const copy=el('div',undefined,{class:'intake-result-copy'});
  copy.append(el('h2',closing.title,{tabindex:'-1'}),el('p',closing.summary,{class:'intake-result-summary'}));
  copy.append(el('p','Leave your details and an electrician will contact you. We may be able to give you a ballpark estimate over the phone. For most jobs, we need to take a look before confirming the price.',{class:'intake-next-steps'}));
  const details=el('details',undefined,{class:'intake-answer-review'});
  details.append(el('summary','Review or change your answers'));
  if(reviewMode==='typed'){
   details.append(el('p',cleanText(typed),{class:'intake-typed-review'}));
   details.append(button('Edit my description',()=>{mode='typed';render();},'intake-back'));
  }else{
   const summary=el('dl',undefined,{class:'intake-summary'});
   questionsFor(answers).forEach((item,index)=>{
    if(!hasAnswer(answers,item))return;
    const label=item.type==='text'?(answers[item.id]||'No extra details added'):item.options.find(o=>o.value===answers[item.id])?.label;
    if(label===undefined)return;
    const row=el('div');
    const copy=el('div');copy.append(el('dt',item.title),el('dd',label));
    row.append(copy,button('Edit',()=>{mode='guided';step=index;render();},'intake-edit'));summary.append(row);
   });details.append(summary);
  }
  copy.append(details);
  layout.append(copy,renderContact());
  shell.append(layout,button('Start over',()=>{answers={};typed='';contact=emptyContact();step=0;mode='guided';render();},'intake-back'));
 }
 function renderContact(){
  const panel=el('form',undefined,{class:'intake-contact','aria-labelledby':'contact-heading'});
  panel.append(el('h3','How can we reach you?',{id:'contact-heading'}));
  const preview=el('p',endpoint?'We’ll use these details to reply about your request.':'Preview only — use made-up details. Nothing is sent.',{class:'intake-contact-preview',id:'contact-preview'});
  panel.append(preview);
  function field(key,label,type,autocomplete){
   const row=el('div',undefined,{class:'intake-contact-field'});
   const id='intake-contact-'+key;
   const input=el('input',undefined,{id,name:key,type,autocomplete,maxlength:key==='name'?'120':key==='phone'?'32':'254','aria-describedby':'contact-preview'});
   input.value=contact[key];input.required=key!=='zip';
   if(key==='zip'){input.setAttribute('inputmode','numeric');input.setAttribute('maxlength','10');}
   input.addEventListener('input',()=>{contact[key]=input.value;input.setCustomValidity('');});
   row.append(el('label',label,{for:id}),input);
   return row;
  }
  const name=field('name','Your name','text','name');
  const phone=field('phone','Phone number','tel','tel');
  const email=field('email','Email address','email','email');
  const zip=field('zip','ZIP code (optional)','text','postal-code');
  const method=el('fieldset',undefined,{class:'intake-contact-methods'});
  method.append(el('legend','How should we contact you?'));
  const options=el('div',undefined,{class:'intake-contact-options'});
  const radios=[];
  const estimate=el('div',undefined,{class:'intake-ballpark'});
  const checkbox=el('input',undefined,{id:'intake-ballpark',type:'checkbox'});
  checkbox.checked=contact.ballpark;
  checkbox.addEventListener('change',()=>{contact.ballpark=checkbox.checked;});
  const estimateLabel=el('label',undefined,{for:'intake-ballpark'});
  estimateLabel.append(checkbox,el('span','I’d like a ballpark estimate by text.'));
  estimate.append(estimateLabel,el('p','We’ll review your answers first. We may need a few more details or a visit before we can estimate the job.'));
  function updateMethod(){
   const byEmail=contact.method==='email';
   phone.hidden=byEmail;phone.querySelector('input').required=!byEmail;phone.querySelector('input').disabled=byEmail;
   email.hidden=!byEmail;email.querySelector('input').required=byEmail;email.querySelector('input').disabled=!byEmail;
   estimate.hidden=contact.method!=='text';
   if(contact.method!=='text'){contact.ballpark=false;checkbox.checked=false;}
   radios.forEach(input=>{input.checked=input.value===contact.method;});
  }
  for(const [value,label] of [['call','Call'],['text','Text'],['email','Email']]){
   const choice=el('label',undefined,{class:'intake-contact-option'});
   const input=el('input',undefined,{type:'radio',name:'intake-contact-method',value});
   input.checked=contact.method===value;
   input.addEventListener('change',()=>{contact.method=value;updateMethod();});
   radios.push(input);choice.append(input,el('span',label));options.append(choice);
  }
  method.append(options);
  const trap=el('div',undefined,{class:'intake-website','aria-hidden':'true'});
  const website=el('input',undefined,{id:'intake-website',name:'website',type:'text',tabindex:'-1',autocomplete:'off'});
  trap.append(el('label','Leave this blank',{for:'intake-website'}),website);
  const send=el('button','Send request',{type:'submit',class:'intake-primary'});
  send.disabled=!endpoint;send.setAttribute('aria-describedby','contact-preview');
  panel.append(name,method,phone,email,zip,estimate,trap,send);
  const footnote=el('p',endpoint?'This sends your request to Bremray. It does not book an appointment.':'Sending is not connected in this preview.',{class:'intake-contact-footnote'});
  if(endpoint){footnote.append(document.createTextNode(' '),el('a','Privacy policy',{href:'/privacy.html'}));}
  panel.append(footnote);
  panel.addEventListener('submit',async event=>{
   event.preventDefault();
   if(!endpoint)return;
   const invalid=validateContact(contact);
   if(invalid){const input=panel.querySelector('#intake-contact-'+invalid.field);if(input){input.setCustomValidity(invalid.message);input.reportValidity();}return;}
   if(!panel.reportValidity())return;
   const data=payloadFor(state(),contact,root.location.origin+root.location.pathname,website.value);
   const result=submission.submit(data);render();await result;render();
  });
  updateMethod();
  return panel;
 }
 function renderReceipt(delivery){
  setProgress(delivery.status==='delivered'?'Request received':'Your request',100);
  const messages={
   sending:['Sending your request…','Please keep this page open while we send your details.'],
   delivered:['Thanks. We’ve got your request.','An electrician will contact you about the work. We’ll use the contact method you chose.'],
   pending:['Your request is still being sent.','Please check below before sending it again.'],
   uncertain:['We saved your details, but can’t confirm delivery yet.','Please call us so we can check your request. You do not need to fill out the form again.'],
   unknown:['We couldn’t confirm your request.','Your connection may have dropped. Check below to see whether it went through.'],
   retryable:['Your request hasn’t arrived yet.','Your details are still here. You can try sending them again.'],
   rejected:['We couldn’t send your request.','Please call us, or check your details and try again.']
  };
  const [title,description]=messages[delivery.status]||messages.unknown;
  const receipt=el('section',undefined,{class:'intake-receipt','aria-live':'polite','aria-busy':String(delivery.busy)});
  receipt.append(el('h2',title,{tabindex:'-1'}),el('p',description));
  if(delivery.status==='delivered'){
   if(contact.ballpark)receipt.append(el('p','We’ll review your answers before sending a ballpark estimate. We may need more details or a visit first.'));
   receipt.append(el('p','This is a request for a callback, not a confirmed appointment.'));
  }else if(delivery.status!=='sending'){
   const action=delivery.status==='retryable'?button('Try sending again',async()=>{const request=submission.submit();render();await request;render();}):delivery.status==='rejected'?button('Check my details',()=>{submission.reset();render();}):button(delivery.busy?'Checking…':'Check request status',async()=>{const request=submission.check();render();await request;render();});
   action.disabled=delivery.busy;receipt.append(action);
  }
  if(delivery.status!=='sending')receipt.append(el('a','Call (734) 216-9437',{href:'tel:+17342169437',class:'intake-receipt-call'}));
  shell.append(receipt);
 }
 modeButtons.forEach(b=>b.addEventListener('click',()=>{
  applyState(switchMode(state(),b.dataset.intakeMode));
  render();
 }));
 render(false);
})(typeof window!=='undefined'?window:globalThis);
