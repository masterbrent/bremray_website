const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const pages = ['', 'locations', 'generators'].flatMap(directory =>
  fs.readdirSync(path.join(root, directory)).filter(file => file.endsWith('.html'))
    .map(file => path.join(directory, file)));

test('every public header keeps one click-to-call number beside the logo outside the collapsible menu', () => {
  assert.equal(pages.length, 18, 'include all public pages, including the error page');
  for (const file of pages) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    const header = html.match(/<header class="site-header(?: shell)?">([\s\S]*?)<\/header>/)?.[1];
    assert.ok(header, `${file}: shared header exists`);
    const nav = header.match(/<nav[^>]*id="main-nav"[^>]*>([\s\S]*?)<\/nav>/)?.[0];
    assert.ok(nav, `${file}: existing navigation remains available`);
    const outsideMenu = header.replace(nav, '');
    const group = outsideMenu.match(/<div class="(?:header-contact|identity)">([\s\S]*?)<\/div>/)?.[1];
    assert.ok(group, `${file}: logo and number stay together outside the menu`);
    assert.match(group, /<a class="(?:brand|wordmark)"[^>]*>[\s\S]*?<img[^>]+src="\/images\/logo\.png"[^>]*>[\s\S]*?<\/a>\s*<a class="header-phone"/, `${file}: number directly follows the real logo`);
    const phone = group.match(/<a class="header-phone"([^>]*)>([^<]*)<\/a>/);
    assert.ok(phone, `${file}: telephone remains readable without JavaScript`);
    assert.match(phone[1], /href="tel:(?:\+1)?7342169437"/);
    assert.equal(phone[2].trim(), '(734) 216-9437');
    assert.doesNotMatch(phone[1], /\bhidden|aria-hidden="true"/);
    assert.equal((header.match(/href="tel:(?:\+1)?7342169437"/g) || []).length, 1, `${file}: move the header number instead of duplicating it`);
  }
});

test('the visible header phone keeps a full-height touch target and an unbroken number', () => {
  const css = fs.readFileSync(path.join(root, 'css/site.css'), 'utf8');
  const rule = css.match(/\.header-phone\s*\{([^}]+)\}/)?.[1];
  assert.ok(rule, 'the phone has a dedicated visible header style');
  assert.match(rule, /display\s*:\s*inline-flex/);
  assert.match(rule, /min-height\s*:\s*44px/);
  assert.match(rule, /white-space\s*:\s*nowrap/);
  const phoneRules = [...css.matchAll(/([^{}]*\.header-phone[^{}]*)\{([^}]+)\}/g)];
  for (const [,selector, declarations] of phoneRules) {
    assert.doesNotMatch(declarations, /display\s*:\s*none|visibility\s*:\s*hidden/, `${selector}: never hide the phone at a breakpoint`);
  }
});
