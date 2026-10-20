const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const intake=require('../js/adaptive-intake.js');

test('repair closing reflects the reported problem without assuming a replacement or diagnosis',()=>{
 const result=intake.closingFor({reviewMode:'guided',answers:{intent:'repair',repair_item:'outlet',repair_when:'intermittent',repair_extent:'nearby'}});
 assert.match(result.title,/outlet/i);
 assert.match(result.summary,/comes and goes/);
 assert.match(result.summary,/nearby/);
 assert.doesNotMatch(result.title+' '+result.summary,/replace|GFCI|faulty|needs a new/i);
 assert.equal(Object.hasOwn(result,'pricing'),false);
});

test('installation and major upgrade endings do not use the service-call rate as an estimate',()=>{
 for(const [intent,key,item] of [['install','install_item','ev'],['install','install_item','lighting'],['install','install_item','generator'],['upgrade','upgrade_item','panel'],['upgrade','upgrade_item','generator']]){
  const result=intake.closingFor({reviewMode:'guided',answers:{intent,[key]:item}});
  assert.ok(result.title.length>0);
  assert.equal(Object.hasOwn(result,'pricing'),false);
  assert.doesNotMatch(JSON.stringify(result),/\$\s*\d|instant|certified|guaranteed/i);
 }
});

test('replacement ending collects contact details without a price or completion promise',()=>{
 const result=intake.closingFor({reviewMode:'guided',answers:{intent:'upgrade',upgrade_item:'outlet',outlet_count:'one'}});
 assert.match(result.title,/replace/i);
 assert.equal(Object.hasOwn(result,'pricing'),false);
 assert.doesNotMatch(JSON.stringify(result),/\$\s*\d|takes less than|within an hour|one-hour job|total/i);
});

test('typed and uncertain jobs avoid stale guided assumptions and unapproved prices',()=>{
 const typed=intake.closingFor({reviewMode:'typed',typed:'Something else',answers:{intent:'repair',repair_item:'outlet'}});
 const unknown=intake.closingFor({reviewMode:'guided',answers:{intent:'unknown',details:'A few jobs'}});
 for(const result of [typed,unknown]){
  assert.equal(Object.hasOwn(result,'pricing'),false);
  assert.doesNotMatch(result.title+' '+result.summary,/outlet|\$\s*\d|diagnos|sent|booked/i);
 }
});

test('all repair and small replacement endings keep rates out of public intake assets',()=>{
 for(const [intent,key,items] of [
  ['repair','repair_item',['outlet','light','breaker','power','generator']],
  ['upgrade','upgrade_item',['outlet','lighting','fan']]
 ]){
  for(const item of items){
   const result=intake.closingFor({reviewMode:'guided',answers:{intent,[key]:item}});
   assert.equal(Object.hasOwn(result,'pricing'),false,intent+':'+item);
   assert.doesNotMatch(JSON.stringify(result),/\$\s*\d|per hour|first hour|parts are extra/i);
  }
 }
 const js=fs.readFileSync(require.resolve('../js/adaptive-intake.js'),'utf8');
 assert.doesNotMatch(js,/\$\s*\d|service.call pricing|first hour|parts are extra|intake-service-rate/i);
});
