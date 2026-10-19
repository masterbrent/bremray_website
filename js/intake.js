// Guided intake only. Pricing and outbound automation require approved business rules.
const intakeQuestions = {
  'Generator installation': [
    ['generator_type','What are you considering?',['Automatic standby generator','Connection for a portable generator','Not sure yet']],
    ['backup_needs','What do you want to keep running?','For example: refrigerator, furnace, well pump, or most of the house'],
    ['generator_owned','Do you already have a generator?',['No','Yes','Not sure which one to buy']]
  ],
  'EV charger installation': [
    ['vehicle','What vehicle or charger are you planning to use?','It’s okay if you haven’t picked one yet'],
    ['parking','Where do you normally park?',['Attached garage','Detached garage','Driveway / outdoors','Other']],
    ['panel_distance','Roughly how far is that from your electrical panel?',['Less than 20 feet','20–50 feet','More than 50 feet','Not sure']]
  ],
  'Panel upgrade': [
    ['panel_reason','What prompted the panel work?',['Adding a charger or other equipment','Not enough space for circuits','A problem with the existing panel','Something else / not sure']],
    ['panel_detail','What would you like us to know?','Describe what you’re adding or what you’ve noticed']
  ],
  'Repair or service call': [
    ['repair_history','Has this happened before, or did something recently change?','For example: new equipment, recent work, or an intermittent problem'],
    ['repair_detail','What isn’t working?','Describe the problem and when you first noticed it'],
    ['affected_area','How much of the house is affected?',['One outlet, light, or appliance','One room or part of the house','Most or all of the house','Not sure']]
  ]
};
if(typeof module!=='undefined') module.exports = intakeQuestions;
if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',()=>{
const service=document.querySelector('#service'),container=document.querySelector('#project-questions');if(!service||!container)return;
const saved={};let previous='';
service.addEventListener('change',()=>{
  saved[previous]=Object.fromEntries([...container.querySelectorAll('input,select')].map(el=>[el.name,el.value]));
  container.replaceChildren();previous=service.value;
  const questions=intakeQuestions[previous]||[];
  for(const [name,label,choices] of questions){
    const labelNode=document.createElement('label');labelNode.htmlFor=name;labelNode.textContent=label;
    const field=document.createElement(Array.isArray(choices)?'select':'input');field.id=name;field.name=name;
    if(Array.isArray(choices)){for(const text of ['Choose an answer',...choices]){const option=document.createElement('option');option.textContent=text;option.value=text==='Choose an answer'?'':text;field.append(option)}}else{field.type='text';field.placeholder=choices}
    if(saved[previous]?.[name])field.value=saved[previous][name];container.append(labelNode,field);
  }
});
if(new URLSearchParams(location.search).get('service')==='repair'){service.value='Repair or service call';service.dispatchEvent(new Event('change'));}
});
