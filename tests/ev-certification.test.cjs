const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('EV service summaries describe installation without manufacturer certification claims', () => {
  for (const page of ['about.html', 'locations/ann-arbor-electrician.html', 'locations/chelsea-electrician.html']) {
    const html = fs.readFileSync(page, 'utf8');
    const summary = html.match(/<li><strong>EV Charger Installation:<\/strong>(.*?)<\/li>/s)?.[1];
    assert.ok(summary, `${page}: EV service summary remains available`);
    assert.doesNotMatch(summary, /certif(?:ied|ication)|authori[sz]ed/i, `${page}: no unsupported EV manufacturer credential`);
    if (page.startsWith('locations/')) {
      assert.match(summary, /Tesla/, `${page}: ordinary Tesla installation offering remains`);
      assert.match(summary, /ChargePoint/, `${page}: ordinary ChargePoint installation offering remains`);
    }
  }
});
