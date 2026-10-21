const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const formURL = 'https://book.housecallpro.com/lead-form/Bremray-Electrical/9e242df02d1d42b9a5870a37b41984f3';

test('contact page uses the lightweight intake and keeps HCP as a click-only fallback', () => {
  for (const file of ['contact.html']) {
    const html = read(file);
    assert.ok(html.includes(`href="${formURL}"`), file);
    assert.match(html, /data-intake-entry="contact"/);
    assert.match(html, /\/js\/home-intake\.js\?v=/);
    assert.doesNotMatch(html, /<iframe|online-booking\.housecallpro\.com/);
    assert.doesNotMatch(html, /formspree|<form\b|js\/intake\.js/);
    assert.ok(html.indexOf('id="contact-details"') < html.indexOf('data-live-intake'), 'original contact directory precedes the callback form');
    assert.match(html, /class="contact-grid"/);
    assert.doesNotMatch(html, /Choose an option|class="request-opening/);
    const navigation = html.match(/<nav class="main-nav"[^>]*>[\s\S]*?<\/nav>/)?.[0];
    assert.match(navigation, /<a href="\/contact.html">Contact<\/a>/);
    assert.match(html, /href="tel:7342169437"/);
  }
});

test('privacy copy identifies Housecall Pro as the inquiry processor', () => {
  assert.match(read('privacy.html'), /Housecall Pro[^<]*service requests/);
});
