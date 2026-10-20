const {test}=require('node:test');
const assert=require('node:assert/strict');
const intake=require('../js/adaptive-intake.js');
const endpoint='https://bots.propfirmbot.com/bremray-intake/v1/requests';
const id='e456b1cf-a0a4-4cb5-93a8-01a323abc123';
const contact={name:'Bremray Test',method:'text',phone:'(734) 822-7594',email:'',zip:'48103',ballpark:true};
const guided={reviewMode:'guided',answers:{intent:'repair',repair_item:'outlet',repair_when:'recent',repair_extent:'nearby'},typed:'Stale typing'};
const payload=()=>intake.payloadFor(guided,contact,'https://bremray.com/');
const response=(status,body)=>({status,json:async()=>body});
const record=(status)=>({request_id:id,status});

test('contact validation uses the chosen method, keeps names intact and checks US numbers',()=>{
 assert.equal(intake.validateContact(contact),null);
 assert.equal(intake.validateContact({...contact,name:'   '}).field,'name');
 assert.equal(intake.validateContact({...contact,phone:'734822'}).field,'phone');
 assert.equal(intake.validateContact({...contact,phone:'abc7348227594'}).field,'phone');
 assert.equal(intake.validateContact({...contact,method:'email',phone:'',email:'test@bremray.com'}),null);
 assert.equal(intake.validateContact({...contact,method:'email',email:'test@'}).field,'email');
 assert.equal(intake.validateContact({...contact,zip:'abc'}).field,'zip');
});
test('payload retains guided answers, long optional details and contact preference without stale text',()=>{
 const data=payload();
 assert.equal(data.answers.length,4);
 assert.equal(data.answers[3].answer,'Yes, other things nearby');
 assert.equal(data.contact.ballpark,true);
 assert.equal(data.contact.phone,'+17348227594');
 assert.equal(data.description,'');
 const long='x'.repeat(2000);
 const fallback=intake.payloadFor({reviewMode:'guided',answers:{intent:'unknown',details:long}},contact,'https://bremray.com/');
 assert.equal(fallback.description,long);
 assert.equal(fallback.answers.length,1);
 const typed=intake.payloadFor({...guided,reviewMode:'typed',typed:'Four lights'}, {...contact,method:'email',email:'test@bremray.com'},'https://bremray.com/');
 assert.deepEqual(typed.answers,[]);
 assert.equal(typed.description,'Four lights');
 assert.equal(typed.contact.ballpark,false);
 assert.equal(typed.contact.phone,'');
});
test('preview without endpoint cannot send',async()=>{
 let calls=0; const c=intake.createSubmission({endpoint:'',fetch:async()=>{calls++;},uuid:()=>id});
 assert.equal((await c.submit(payload())).status,'preview'); assert.equal(calls,0);
});
test('a confirmed delivery fires once, has stable id and blocks duplicate clicks',async()=>{
 let resolve; const requests=[];let delivered=0;
 const c=intake.createSubmission({endpoint,uuid:()=>id,onDelivered:()=>delivered++,fetch:(url,options)=>{requests.push({url,options});return new Promise(r=>{resolve=r;});}});
 const first=c.submit(payload());
 assert.equal((await c.submit(payload())).status,'sending'); assert.equal(requests.length,1);assert.equal(delivered,0);
 resolve(response(201,record('delivered'))); assert.equal((await first).status,'delivered');
 await c.submit(payload()); assert.equal(requests.length,1);assert.equal(delivered,1);
 assert.equal(JSON.parse(requests[0].options.body).request_id,id);
});
test('network ambiguity checks receipt with GET, never fires success early and locks changed payload',async()=>{
 const requests=[]; let delivered=0;
 const c=intake.createSubmission({endpoint,uuid:()=>id,onDelivered:()=>delivered++,fetch:async(url,opts)=>{requests.push({url,opts});if(opts.method==='POST')throw Error('connection lost');return response(200,record('delivered'));}});
 assert.equal((await c.submit(payload())).status,'unknown'); assert.equal(delivered,0);
 assert.equal((await c.submit({...payload(),description:'changed'})).status,'unknown');assert.equal(requests.length,1);
 assert.equal((await c.check()).status,'delivered');assert.equal(delivered,1);
 assert.equal(requests[1].url,endpoint+'/'+id); assert.equal(requests[1].opts.method,'GET');
});
test('pending and uncertain deliveries can only be checked, with no second POST',async()=>{
 for(const status of ['pending','uncertain']){
  const methods=[];let events=0;
  const c=intake.createSubmission({endpoint,uuid:()=>id,onDelivered:()=>events++,fetch:async(url,opts)=>{methods.push(opts.method);return response(opts.method==='POST'?202:200,record(status));}});
  assert.equal((await c.submit(payload())).status,status);
  await c.submit(payload());await c.check();
  assert.deepEqual(methods,['POST','GET']);assert.equal(events,0);
 }
});
test('missing receipt permits exact same request retry, never a new request id',async()=>{
 const requests=[];let uuids=0;
 const c=intake.createSubmission({endpoint,uuid:()=>{uuids++;return id;},fetch:async(url,opts)=>{requests.push({url,opts});if(requests.length===1)throw Error('offline');if(opts.method==='GET')return response(404,{error:'not_found'});return response(201,record('delivered'));}});
 await c.submit(payload());assert.equal((await c.check()).status,'retryable');
 await c.submit({...payload(),description:'changed'});
 assert.equal(JSON.parse(requests[2].opts.body).description,'');assert.equal(uuids,1);
 assert.equal(c.state().status,'delivered');
});
test('malformed or mismatched success responses cannot display success',async()=>{
 for(const body of [{status:'delivered'},{request_id:'someone-else',status:'delivered'},record('unexpected')]){
  let events=0;const c=intake.createSubmission({endpoint,uuid:()=>id,onDelivered:()=>events++,fetch:async()=>response(201,body)});
  assert.equal((await c.submit(payload())).status,'unknown');assert.equal(events,0);
 }
});
test('definitive rejection permits correction without an automatic resubmit',async()=>{
 let calls=0;
 const c=intake.createSubmission({endpoint,uuid:()=>id,fetch:async()=>{calls++;return response(422,record('rejected'));}});
 assert.equal((await c.submit(payload())).status,'rejected'); assert.equal(calls,1);
 assert.equal(c.reset(),true);assert.equal(c.state().status,'ready');assert.equal(calls,1);
});
test('status request failure preserves ambiguous state and does not duplicate a lead',async()=>{
 let calls=0;
 const c=intake.createSubmission({endpoint,uuid:()=>id,fetch:async()=>{calls++;throw Error('offline');}});
 await c.submit(payload());await c.check();assert.equal(c.state().status,'unknown');assert.equal(calls,2);assert.equal(c.reset(),false);
});
