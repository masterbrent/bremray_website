/* Design review only. This controller uses the tested question rules, without a delivery client. */
(function () {
  'use strict';
  const mount = document.querySelector('[data-demo-intake]');
  const rules = window.BremrayIntake;
  if (!mount || !rules) return;
  const initial = () => ({answers: {}, step: 0, typed: '', mode: 'guided', reviewMode: 'guided'});
  let state = initial();
  let contact = {name: '', method: 'call', phone: '', email: '', zip: ''};
  let complete = false;
  const node = (tag, text, attrs = {}) => {
    const n = document.createElement(tag);
    if (text !== undefined) n.textContent = text;
    Object.entries(attrs).forEach(([key, value]) => n.setAttribute(key, value));
    return n;
  };
  const button = (text, action, cls = 'demo-option') => {
    const n = node('button', text, {type: 'button', class: cls});
    n.addEventListener('click', action);
    return n;
  };
  const reset = () => {state = initial(); contact = {name: '', method: 'call', phone: '', email: '', zip: ''}; complete = false; render();};
  const pick = (id, value) => {state = rules.advance(state, id, value); render();};
  const mode = value => {state = rules.switchMode(state, value); render();};
  function render(focus = true) {
    mount.replaceChildren();
    mount.classList.add('demo-flow');
    const opening = !complete && state.mode === 'guided' && state.step === 0;
    const stage = node('div', undefined, {class: 'demo-flow-stage', 'data-stage': complete ? 'complete' : opening ? 'opening' : state.mode === 'guided' ? 'questions' : state.mode});
    mount.append(stage);
    if (complete) renderComplete(stage);
    else if (state.mode === 'review') renderReview(stage);
    else if (state.mode === 'typed') renderTyped(stage);
    else renderQuestion(stage, opening);
    if (focus) {
      const heading = stage.querySelector('h2');
      heading?.focus({preventScroll: true});
      const top = mount.getBoundingClientRect().top;
      if (top < 100 || top > window.innerHeight - 160) mount.scrollIntoView({block: 'start', behavior: 'instant'});
    }
  }
  function progress(stage, text) {
    const meta = node('div', undefined, {class: 'demo-flow-meta'});
    meta.append(node('p', text, {class: 'demo-progress'}), button('Start over', reset, 'demo-reset'));
    stage.append(meta);
  }
  function renderQuestion(stage, opening) {
    const list = rules.questionsFor(state.answers);
    state.step = Math.max(0, Math.min(state.step, list.length - 1));
    const question = list[state.step];
    if (!opening) progress(stage, 'YOUR PROJECT / QUESTION ' + (state.step + 1));
    stage.append(node('h2', question.title, {class: 'demo-question', tabindex: '-1'}));
    if (question.help) stage.append(node('p', question.help, {class: 'demo-help'}));
    const options = node('div', undefined, {class: 'demo-options'});
    if (question.type === 'text') {
      const label = node('label', 'A few details (optional)', {for: 'demo-details', class: 'demo-label'});
      const input = node('textarea', undefined, {id: 'demo-details', class: 'demo-text', rows: '4', maxlength: '2000'});
      input.value = state.answers[question.id] || '';
      options.append(label, input, button('Review details →', () => pick(question.id, input.value), 'demo-primary'));
    } else {
      const choices = opening ? ['install', 'upgrade', 'repair'].map(id => question.options.find(o => o.value === id)) : question.options;
      if (choices.length > 4) options.classList.add('demo-options-many');
      const subtitles = {install: 'Add something to your home.', upgrade: 'Make room for what’s next.', repair: 'Tell us what stopped working.'};
      choices.forEach(choice => {
        const b = button(undefined, () => pick(question.id, choice.value));
        b.setAttribute('data-choice', choice.value);
        b.setAttribute('aria-label', choice.label);
        b.setAttribute('aria-pressed', String(state.answers[question.id] === choice.value));
        const copy = node('span', undefined, {class: 'demo-option-copy'});
        copy.append(node('span', choice.label, {class: 'demo-option-label'}));
        if (opening) copy.append(node('span', subtitles[choice.value], {class: 'demo-option-detail'}));
        b.append(copy, node('span', '↗', {class: 'demo-arrow', 'aria-hidden': 'true'}));
        options.append(b);
      });
    }
    stage.append(options);
    const toolbar = node('div', undefined, {class: 'demo-toolbar'});
    if (opening) toolbar.append(button('I’m not sure', () => pick('intent', 'unknown'), 'demo-back'));
    else toolbar.append(button('← Back', () => {state.step--; render();}, 'demo-back'));
    toolbar.append(button('I’d rather type', () => mode('typed'), 'demo-back'));
    stage.append(toolbar);
  }
  function renderTyped(stage) {
    progress(stage, 'YOUR PROJECT / IN YOUR OWN WORDS');
    stage.append(node('h2', 'What do you have in mind?', {class: 'demo-question', tabindex: '-1'}), node('p', 'Tell us what you want done, or what isn’t working. A sentence or two is enough.', {class: 'demo-help'}));
    const text = node('textarea', undefined, {class: 'demo-text', id: 'demo-project', rows: '5', maxlength: '2000', placeholder: 'For example: We want four lights in the living room. There’s an attic above it.'});
    text.value = state.typed;
    const next = button('Review details →', () => {state.typed = rules.cleanText(text.value); if (state.typed) {state = rules.review(state); render();}}, 'demo-primary');
    next.disabled = !state.typed.trim();
    text.addEventListener('input', () => {state.typed = text.value; next.disabled = !state.typed.trim();});
    stage.append(node('label', 'Your project', {for: 'demo-project', class: 'demo-label'}), text, next, button('← Back to choices', () => mode('guided'), 'demo-back'));
  }
  function renderReview(stage) {
    const closing = rules.closingFor(state);
    progress(stage, 'YOUR PROJECT / CONTACT DETAILS');
    stage.append(node('h2', closing.title, {class: 'demo-question', tabindex: '-1'}), node('p', closing.summary, {class: 'demo-help'}));
    const layout = node('div', undefined, {class: 'demo-review'});
    const summary = node('div', undefined, {class: 'demo-review-copy'});
    summary.append(node('h3', 'What happens next?'), node('p', 'An electrician will talk through the job with you. We may be able to give you a ballpark estimate over the phone. For most jobs, we need to take a look before confirming the price.'));
    const review = node('details', undefined, {class: 'demo-answers'});
    review.append(node('summary', 'Review your answers'));
    if (state.reviewMode === 'typed') review.append(node('p', state.typed, {class: 'demo-description'}));
    else {
      const answers = node('dl');
      rules.questionsFor(state.answers).forEach((question, index) => {
        const value = state.answers[question.id];
        if (value === undefined) return;
        const label = question.type === 'text' ? value || 'No extra details' : question.options.find(o => o.value === value)?.label;
        const row = node('div', undefined, {class: 'demo-answer'});
        row.append(node('dt', question.title), node('dd', label), button('Change', () => {state.mode = 'guided'; state.step = index; render();}, 'demo-back'));
        answers.append(row);
      });
      review.append(answers);
    }
    summary.append(review);
    if (state.reviewMode === 'typed') summary.append(button('Edit answers', () => mode('typed'), 'demo-back'));
    layout.append(summary, contactForm());
    stage.append(layout);
  }
  function contactForm() {
    const form = node('form', undefined, {class: 'demo-contact', 'aria-label': 'Preview contact details'});
    form.append(node('h3', 'How can we reach you?'), node('p', 'Design preview — use made-up details. Nothing is sent.', {class: 'demo-notice'}));
    function field(key, label, type, required) {
      const row = node('div', undefined, {class: 'demo-field'});
      const input = node('input', undefined, {id: 'demo-' + key, type, name: key, autocomplete: 'off', maxlength: key === 'name' ? '120' : '254'});
      input.value = contact[key]; input.required = required;
      if (type === 'tel') input.setAttribute('inputmode', 'tel');
      input.addEventListener('input', () => {contact[key] = input.value; input.setCustomValidity('');});
      row.append(node('label', label, {for: 'demo-' + key}), input);
      form.append(row); return input;
    }
    const name = field('name', 'Your name', 'text', true);
    const methods = node('fieldset', undefined, {class: 'demo-contact-methods'});
    methods.append(node('legend', 'How should we contact you?'));
    ['call', 'text', 'email'].forEach(method => {
      const label = node('label');
      const radio = node('input', undefined, {type: 'radio', name: 'contact-method', value: method});
      radio.checked = contact.method === method;
      radio.addEventListener('change', () => {contact.method = method; render(false); mount.querySelector('input[value="' + method + '"]')?.focus({preventScroll: true});});
      label.append(radio, node('span', {call: 'Call', text: 'Text', email: 'Email'}[method]));
      methods.append(label);
    });
    form.append(methods);
    const channel = contact.method === 'email' ? field('email', 'Email address', 'email', true) : field('phone', 'Phone number', 'tel', true);
    const zip = field('zip', 'ZIP code (optional)', 'text', false); zip.setAttribute('inputmode', 'numeric'); zip.setAttribute('maxlength', '10');
    const submit = node('button', 'Preview request →', {type: 'submit', class: 'demo-primary'});
    form.append(submit, node('p', 'This preview does not contact Bremray or book an appointment.', {class: 'demo-notice'}));
    form.addEventListener('submit', event => {
      event.preventDefault();
      const error = rules.validateContact({...contact, ballpark: false});
      if (error) {
        const input = error.field === 'name' ? name : error.field === 'zip' ? zip : channel;
        input.setCustomValidity(error.message); input.reportValidity(); return;
      }
      complete = true; render();
    });
    return form;
  }
  function renderComplete(stage) {
    stage.append(node('p', 'DESIGN PREVIEW', {class: 'demo-progress'}), node('h2', 'That’s the complete flow.', {class: 'demo-question', tabindex: '-1'}), node('p', 'No request was sent. On the live site, this step would confirm that Bremray received your details.', {class: 'demo-help'}), button('Try another project →', reset, 'demo-primary'));
  }
  render(false);
}());
