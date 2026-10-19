const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=()=>fs.readFileSync('index.html','utf8');

test('homepage begins with the working adaptive intake and keeps the site content below it',()=>{
 const page=html();
 const firstSection=page.match(/<main>\s*<section\b[^>]*>/)?.[0];
 assert.match(firstSection||'',/id="start"/);
 assert.equal((page.match(/id="intake-screen"/g)||[]).length,1);
 assert.equal((page.match(/src="\/js\/adaptive-intake.js"/g)||[]).length,1);
 assert.ok(page.indexOf('id="intake-screen"')<page.indexOf('id="services"'));
 assert.ok(page.indexOf('id="intake-screen"')<page.indexOf('/images/generator.jpg'));
 assert.equal((page.match(/<h1\b/g)||[]).length,1);
 for(const id of ['services','pricing','main-nav','manufacturer-logos'])assert.ok(page.includes('id="'+id+'"'));
});

test('homepage intake identifies the preview, offers typing, and keeps a phone alternative',()=>{
 const start=html().split('<section class="hero')[0];
 assert.match(start,/Form preview · Nothing is sent/);
 assert.match(start,/data-intake-mode="guided"/);
 assert.match(start,/data-intake-mode="typed"/);
 assert.match(start,/href="tel:7342169437"/);
 assert.doesNotMatch(start,/instant estimate|free quotes|request sent|we.ll email your estimate/i);
 assert.match(start,/href="#services"/);
});

test('original service, pricing, area and FAQ copy remains intact beneath the intake',()=>{
 const crypto=require('node:crypto');
 const content=html().split('<div class="trust">')[1]?.split('</main>')[0];
 assert.ok(content,'existing content stays in its own lower section');
 const text=content.replace(/<p class="lead-reading-summary">[^<]*<\/p>/,'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
 assert.equal(crypto.createHash('sha256').update(text).digest('hex'),'0428c19281ee10a4b42ff676dd481def1feec9dd90cd09a9e4ae7649de7756cc');
});

test('the homepage opens as an intake task with no promotional hero ahead of the services',()=>{
 const page=html();
 const opening=page.split('<!-- Existing homepage content -->')[0];
 assert.doesNotMatch(page,/lead-supporting-hero|about-bremray-title/);
 assert.doesNotMatch(opening,/hero-image|home-phone-v2/);
 assert.match(opening,/id="intake-path"/);
 assert.equal((page.match(/Licensed electrician in Ann Arbor/gi)||[]).length,1);
 assert.match(page,/EV chargers, electrical panel upgrades, whole house generators, and residential electrical service\./);
});
