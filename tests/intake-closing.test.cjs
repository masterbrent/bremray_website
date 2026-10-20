const {test}=require('node:test');
const assert=require('node:assert/strict');
const intake=require('../js/adaptive-intake.js');

test('repair closing reflects the reported problem without assuming a replacement or diagnosis',()=>{
 const result=intake.closingFor({reviewMode:'guided',answers:{intent:'repair',repair_item:'outlet',repair_when:'intermittent',repair_extent:'nearby'}});
 assert.match(result.title,/outlet/i);
 assert.match(result.summary,/comes and goes/);
 assert.match(result.summary,/nearby/);
 assert.doesNotMatch(result.title+' '+result.summary,/replace|GFCI|faulty|needs a new/i);
 assert.match(result.pricing,/\$250/);
 assert.match(result.pricing,/\$195/);
 assert.match(result.pricing,/parts are extra/i);
 assert.doesNotMatch(result.pricing,/\$249|total|will cost/i);
});

test('installation and major upgrade endings do not use the service-call rate as an estimate',()=>{
 for(const [intent,key,item] of [['install','install_item','ev'],['install','install_item','lighting'],['install','install_item','generator'],['upgrade','upgrade_item','panel'],['upgrade','upgrade_item','generator']]){
  const result=intake.closingFor({reviewMode:'guided',answers:{intent,[key]:item}});
  assert.ok(result.title.length>0);
  assert.equal(result.pricing,'');
  assert.doesNotMatch(JSON.stringify(result),/\$250|\$195|instant|certified|guaranteed/i);
 }
});

test('replacement pricing is conditional and never promises completion within one hour',()=>{
 const result=intake.closingFor({reviewMode:'guided',answers:{intent:'upgrade',upgrade_item:'outlet',outlet_count:'one'}});
 assert.match(result.title,/replace/i);
 assert.match(result.pricing,/if.*service call/i);
 assert.doesNotMatch(result.pricing,/takes less than|within an hour|one-hour job|total/i);
});

test('typed and uncertain jobs avoid stale guided assumptions and unapproved prices',()=>{
 const typed=intake.closingFor({reviewMode:'typed',typed:'Something else',answers:{intent:'repair',repair_item:'outlet'}});
 const unknown=intake.closingFor({reviewMode:'guided',answers:{intent:'unknown',details:'A few jobs'}});
 for(const result of [typed,unknown]){
  assert.equal(result.pricing,'');
  assert.doesNotMatch(result.title+' '+result.summary,/outlet|\$250|diagnos|sent|booked/i);
 }
});
