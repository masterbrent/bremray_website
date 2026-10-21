const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');

// Read the actual controls and load only their external script, as the preview's
// script-src 'self' policy does. Inline handlers are deliberately never run.
function boot(reducedMotion = false) {
  const html = fs.readFileSync(path.join(root, 'generators.html'), 'utf8');
  let focused;
  const nodes = [...html.matchAll(/<(button|div)\b([^>]*)>/g)].map(match => {
    const attributes = new Map([...match[2].matchAll(/([\w-]+)(?:="([^"]*)")?/g)].map(a => [a[1], a[2] || '']));
    const classes = new Set((attributes.get('class') || '').split(/\s+/));
    const listeners = {};
    const node = {
      text: match[1] === 'button' ? html.slice(match.index + match[0].length).split('</button>')[0] : '',
      hidden: attributes.has('hidden'),
      tabIndex: Number(attributes.get('tabindex') || 0),
      getAttribute: key => attributes.get(key) ?? null,
      setAttribute(key, value) { attributes.set(key, String(value)); },
      hasAttribute: key => attributes.has(key),
      classList: {
        contains: name => classes.has(name),
        toggle(name, enabled) { if (enabled) classes.add(name); else classes.delete(name); }
      },
      addEventListener(type, listener) { (listeners[type] ||= []).push(listener); },
      focus() { focused = node; },
      scrollIntoView(options) { node.scrolls.push(options); },
      scrolls: [],
      fire(type, key) {
        const event = {key, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }};
        if (type === 'click') node.focus();
        for (const listener of listeners[type] || []) listener(event);
        return event;
      }
    };
    return node;
  });
  function matches(node, selector) {
    if (selector.startsWith('.')) return node.classList.contains(selector.slice(1));
    const attribute = /^\[([\w-]+)(?:="([^"]*)")?\]$/.exec(selector);
    return attribute && (attribute[2] === undefined ? node.hasAttribute(attribute[1]) : node.getAttribute(attribute[1]) === attribute[2]);
  }
  const document = {
    querySelectorAll: selector => nodes.filter(node => matches(node, selector)),
    querySelector: selector => nodes.find(node => matches(node, selector)),
    getElementById: id => nodes.find(node => node.getAttribute('id') === id)
  };
  const window = {matchMedia: () => ({matches: reducedMotion})};
  for (const script of html.matchAll(/<script\b[^>]*src="(\/js\/generator-tabs\.js)"[^>]*><\/script>/g)) {
    vm.runInNewContext(fs.readFileSync(path.join(root, script[1]), 'utf8'), {document, window});
  }
  const tabs = nodes.filter(node => node.classList.contains('tab-button'));
  return {
    tabs,
    details: nodes.filter(node => node.getAttribute('data-generator-target') && node.getAttribute('role') !== 'tab'),
    panels: ['standby', 'portable'].map(name => document.getElementById(name + '-tab')),
    container: document.querySelector('.tab-container'),
    focused: () => focused,
    html
  };
}

function selected(ui, index) {
  ui.panels.forEach((panel, i) => {
    assert.equal(panel.classList.contains('active'), i === index, 'only selected panel is visible');
    assert.equal(panel.hidden, i !== index, 'inactive panel is hidden from assistive technology');
  });
  ui.tabs.forEach((tab, i) => {
    assert.equal(tab.getAttribute('aria-selected'), String(i === index));
    assert.equal(tab.tabIndex, i === index ? 0 : -1);
    assert.equal(tab.getAttribute('aria-controls'), ui.panels[i].getAttribute('id'));
    assert.equal(ui.panels[i].getAttribute('aria-labelledby'), tab.getAttribute('id'));
  });
}

test('generator tabs switch under the preview policy without inline JavaScript', () => {
  const ui = boot();
  ui.tabs[1].fire('click');
  selected(ui, 1);
  ui.tabs[0].fire('click');
  selected(ui, 0);
  assert.equal(ui.container.scrolls.length, 0, 'switching an adjacent tab does not jump the page');
  assert.doesNotMatch(ui.html, /\bonclick=|function showTab/);
});

test('both detail controls select their panel and move focus to the tabs', () => {
  const ui = boot();
  for (const index of [1, 0]) {
    ui.details[index].fire('click');
    selected(ui, index);
    assert.equal(ui.focused(), ui.tabs[index]);
  }
  assert.equal(ui.container.scrolls.length, 2);
  assert.ok(ui.container.scrolls.every(scroll => scroll.behavior === 'smooth'));
});

test('tab keyboard navigation wraps and supports Home and End', () => {
  const ui = boot();
  for (const [from, key, to] of [[0, 'ArrowRight', 1], [1, 'ArrowRight', 0], [0, 'ArrowLeft', 1], [1, 'Home', 0], [0, 'End', 1]]) {
    assert.equal(ui.tabs[from].fire('keydown', key).defaultPrevented, true);
    selected(ui, to);
    assert.equal(ui.focused(), ui.tabs[to]);
  }
  assert.equal(ui.tabs[1].fire('keydown', 'Tab').defaultPrevented, false);
  assert.equal(ui.container.scrolls.length, 0);
});

test('Detail navigation respects reduced-motion preferences', () => {
  const ui = boot(true);
  ui.details[1].fire('click');
  assert.equal(ui.container.scrolls[0]?.behavior, 'auto');
});
