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
    assert.match(html, /data-live-intake data-intake-endpoint="https:\/\/bots\.propfirmbot\.com\/bremray-intake\/v1\/requests"/);
    assert.match(html, /\/js\/home-intake\.js\?v=/);
    assert.doesNotMatch(html, /<iframe|online-booking\.housecallpro\.com/);
    assert.doesNotMatch(html, /formspree|<form\b|js\/intake\.js/);
    assert.ok(html.indexOf('data-live-intake') < html.indexOf('id="contact-details"'), 'questions appear before contact directory');
    assert.match(html, /href="tel:7342169437"/);
  }
});

test('privacy copy identifies Housecall Pro as the inquiry processor', () => {
  assert.match(read('privacy.html'), /Housecall Pro[^<]*service requests/);
});
