const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync('index.html','utf8');
test('selected homepage is a real indexed intake with preserved search and privacy controls',()=>{
 assert.match(html,/data-live-intake data-intake-endpoint="https:\/\/bots\.propfirmbot\.com\/bremray-intake\/v1\/requests"/);
 assert.match(html,/\/js\/home-intake.js\?v=/);
 assert.match(html,/<link rel="canonical" href="https:\/\/bremray.com\/"/);
 assert.match(html,/\/js\/analytics.js\?v=20261020/);
 assert.match(html,/href="\/privacy.html"/);
 assert.doesNotMatch(html,/design preview|nothing is sent|no request was sent|noindex|data-demo-intake|design-explorations|\$250|\$195/i);
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
 for(const file of ['ev-charger-installation.html','electrical-panel-upgrade.html','generators.html','residential-electrical.html','locations/ann-arbor-electrician.html','locations/ypsilanti-electrician.html','locations/chelsea-electrician.html','locations/saline-electrician.html'])assert.ok(html.includes('href="/'+file+'"'),file);
});
test('only production files are published and old preview paths redirect',()=>{
 assert.equal(fs.existsSync('design-explorations'),false);
 const spec=JSON.parse(fs.readFileSync('deploy/app-spec.json','utf8'));
 assert.equal(spec.static_sites[0].output_dir,'_site');
 assert.match(spec.static_sites[0].build_command,/cp \*\.html robots\.txt sitemap\.xml _site\//);
 assert.doesNotMatch(spec.static_sites[0].build_command,/cp -R \. /);
 for(const prefix of ['/design-explorations','/adaptive-intake.html']){
  const rule=spec.ingress.rules.find(r=>r.match.path.prefix===prefix||r.match.path.exact===prefix);
  assert.equal(rule?.redirect?.uri,'/');assert.equal(rule?.redirect?.redirect_code,301);
 }
});
