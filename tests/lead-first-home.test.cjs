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
 assert.ok(page.indexOf('id="intake-screen"')<page.indexOf('/images/home-phone-v2.jpg'));
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

test('all original homepage main copy remains intact beneath the intake',()=>{
 const crypto=require('node:crypto');
 const content=html().split('<!-- Existing homepage content -->')[1]?.split('</main>')[0];
 assert.ok(content,'existing content stays in its own lower section');
 const text=content.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
 assert.equal(crypto.createHash('sha256').update(text).digest('hex'),'5d47a890fd1924f54848bc4846c00fc0254a38deccdd19c0cf10507b636f0c12');
});
