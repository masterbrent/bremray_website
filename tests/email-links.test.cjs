const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const email = 'contact@bremray.com';
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

for (const file of ['contact.html', 'privacy.html']) {
  test(`${file} provides a readable email link without JavaScript`, () => {
    const html = read(file).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
    const emailLinks = [...html.matchAll(/<a\b[^>]*href="(mailto:[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];

    assert.equal(emailLinks.length, 1, 'one public business email must be directly actionable');
    assert.equal(emailLinks[0][1], `mailto:${email}`);
    assert.equal(emailLinks[0][2].replace(/<[^>]+>/g, '').trim(), email);
    assert.doesNotMatch(html, /\/cdn-cgi\/l\/email-protection|__cf_email__|data-cfemail/);
  });

  test(`${file} keeps the email link outside Cloudflare obfuscation`, () => {
    // The production CDN rewrites unguarded email text into a broken endpoint.
    // Documented per-address opt-out: https://developers.cloudflare.com/waf/tools/scrape-shield/email-address-obfuscation/
    const protectedRegions = [...read(file).matchAll(/<!--email_off-->([\s\S]*?)<!--\/email_off-->/g)];
    assert.equal(protectedRegions.length, 1, 'limit the CDN opt-out to this public email link');
    assert.match(protectedRegions[0][1], /<a\b[^>]*href="mailto:contact@bremray\.com"[^>]*>contact@bremray\.com<\/a>/);
  });
}
