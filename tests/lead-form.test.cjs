const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const formURL = 'https://book.housecallpro.com/lead-form/Bremray-Electrical/9e242df02d1d42b9a5870a37b41984f3';

test('both inquiry pages use the verified Bremray lead form without a second intake path', () => {
  for (const file of ['get-help.html', 'contact.html']) {
    const html = read(file);
    assert.ok(html.includes(`src="${formURL}"`), file);
    assert.match(html, /<iframe[^>]+title="Send your project details to Bremray"/);
    assert.equal((html.match(/id="hcp-lead-iframe"/g) || []).length, 1);
    assert.match(html, /<!--Start of Housecallpro Lead Capture code-->/);
    assert.match(html, /<!--End of Housecallpro Lead Capture code-->/);
    assert.match(html, /<script async src="https:\/\/online-booking\.housecallpro\.com\/script\.js\?token=9e242df02d1d42b9a5870a37b41984f3&amp;orgName=Bremray-Electrical"><\/script>/);
    assert.doesNotMatch(html, /formspree|<form\b|js\/intake\.js/);
    assert.match(html, /does not give an instant price or book an appointment/);
    assert.match(html, /href="tel:7342169437"/);
  }
});

test('privacy copy identifies Housecall Pro as the inquiry processor', () => {
  assert.match(read('privacy.html'), /Housecall Pro[^<]*service requests/);
});
