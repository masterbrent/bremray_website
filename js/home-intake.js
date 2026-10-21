/* Homepage questionnaire. Delivery and duplicate protection live in BremrayIntake. */
(function () {
  'use strict';
  const mount = document.querySelector('[data-live-intake]');
  const rules = window.BremrayIntake;
  if (!mount || !rules) return;
  const initial = () => ({answers: {}, step: 0, typed: '', mode: 'guided', reviewMode: 'guided'});
  let state = initial();
  const emptyContact = () => ({name: '', method: 'call', phone: '', email: '', zip: '', ballpark: false});
  let contact = emptyContact();
  const endpoint = mount.getAttribute('data-intake-endpoint') || '';
  const uuid = () => window.crypto.randomUUID ? window.crypto.randomUUID() : '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c => (c ^ window.crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
  const submission = rules.createSubmission({
    endpoint,
    fetch: (...args) => window.fetch(...args),
    uuid,
    onDelivered: () => document.dispatchEvent(new Event('bremray:lead-delivered'))
  });
  const editable = () => ['ready', 'preview'].includes(submission.state().status);
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
  const reset = () => {if (!editable()) return; state = initial(); contact = emptyContact(); render();};
  const pick = (id, value) => {state = rules.advance(state, id, value); render();};
  const mode = value => {state = rules.switchMode(state, value); render();};
  function render(focus = true) {
    mount.replaceChildren();
    mount.classList.add('demo-flow');
    const delivery = submission.state();
    const locked = !editable();
    const opening = !locked && state.mode === 'guided' && state.step === 0;
    const stage = node('div', undefined, {class: 'demo-flow-stage', 'data-stage': locked ? 'complete' : opening ? 'opening' : state.mode === 'guided' ? 'questions' : state.mode});
    mount.append(stage);
    if (locked) renderReceipt(stage, delivery);
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
    stage.append(node('h2', question.title, {class: opening ? 'demo-question ask' : 'demo-question', tabindex: '-1'}));
    if (question.help) stage.append(node('p', question.help, {class: 'demo-help'}));
    const options = node('div', undefined, {class: opening ? 'demo-options opts' : 'demo-options'});
    if (question.type === 'text') {
      const label = node('label', 'A few details (optional)', {for: 'home-details', class: 'demo-label'});
      const input = node('textarea', undefined, {id: 'home-details', class: 'demo-text', rows: '4', maxlength: '2000'});
      input.value = state.answers[question.id] || '';
      input.addEventListener('input', () => {state.answers = rules.answer(state.answers, question.id, input.value);});
      options.append(label, input, button('Review details →', () => pick(question.id, input.value), 'demo-primary'));
    } else {
      const faces = {
        repair: {num: '01', label: 'Something broke', detail: 'Tell us what stopped working.', on: true},
        install: {num: '02', label: 'Install something new', detail: 'Add something to your home.', on: false},
        upgrade: {num: '03', label: 'Upgrade something', detail: 'Make room for what’s next.', on: false}
      };
      const choices = opening ? ['repair', 'install', 'upgrade'].map(id => question.options.find(o => o.value === id)) : question.options;
      if (choices.length > 4) options.classList.add('demo-options-many');
      choices.forEach(choice => {
        const face = opening ? faces[choice.value] : null;
        const b = button(undefined, () => pick(question.id, choice.value), face ? 'demo-option opt' : 'demo-option');
        if (face && face.on) b.classList.add('opt1');
        b.setAttribute('data-choice', choice.value);
        b.setAttribute('aria-pressed', String(state.answers[question.id] === choice.value));
        if (face) {
          const tog = node('span', undefined, {class: 'tog', 'aria-hidden': 'true'});
          tog.append(node('i'));
          b.append(tog, node('span', face.num, {class: 'num', 'aria-hidden': 'true'}), node('span', face.label, {class: 'lbl demo-option-label'}), node('span', face.detail, {class: 'sub demo-option-detail'}), node('span', '→', {class: 'arr demo-arrow', 'aria-hidden': 'true'}));
        } else {
          b.setAttribute('aria-label', choice.label);
          const tog = node('span', undefined, {class: 'tog', 'aria-hidden': 'true'});
          tog.append(node('i'));
          const copy = node('span', undefined, {class: 'demo-option-copy'});
          copy.append(node('span', choice.label, {class: 'demo-option-label'}));
          b.append(tog, copy, node('span', '→', {class: 'arr demo-arrow', 'aria-hidden': 'true'}));
        }
        options.append(b);
      });
    }
    stage.append(options);
    const toolbar = node('div', undefined, {class: opening ? 'demo-toolbar alt' : 'demo-toolbar'});
    if (opening) {
      toolbar.append(button('I’m not sure', () => pick('intent', 'unknown'), 'demo-back'), node('span', '·', {class: 'dot', 'aria-hidden': 'true'}), button('I’d rather type', () => mode('typed'), 'demo-back type-more'), node('span', '·', {class: 'dot', 'aria-hidden': 'true'}), node('a', 'Or call (734) 216-9437', {href: 'tel:+17342169437', class: 'alt-call'}));
    } else {
      toolbar.append(button('← Back', () => {state.step--; render();}, 'demo-back'), button('I’d rather type', () => mode('typed'), 'demo-back'));
    }
    stage.append(toolbar);
  }
  function renderTyped(stage) {
    progress(stage, 'YOUR PROJECT / IN YOUR OWN WORDS');
    stage.append(node('h2', 'What do you have in mind?', {class: 'demo-question', tabindex: '-1'}), node('p', 'Tell us what you want done, or what isn’t working. A sentence or two is enough.', {class: 'demo-help'}));
    const text = node('textarea', undefined, {class: 'demo-text', id: 'home-project', rows: '5', maxlength: '2000', placeholder: 'For example: We want four lights in the living room. There’s an attic above it.'});
    text.value = state.typed;
    const next = button('Review details →', () => {state.typed = rules.cleanText(text.value); if (state.typed) {state = rules.review(state); render();}}, 'demo-primary');
    next.disabled = !state.typed.trim();
    text.addEventListener('input', () => {state.typed = text.value; next.disabled = !state.typed.trim();});
    stage.append(node('label', 'Your project', {for: 'home-project', class: 'demo-label'}), text, next, button('← Back to choices', () => mode('guided'), 'demo-back'));
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
    const form = node('form', undefined, {class: 'demo-contact', 'aria-label': 'Contact details'});
    form.append(node('h3', 'How can we reach you?'), node('p', endpoint ? 'We’ll use these details to reply about your request.' : 'Preview only — use made-up details. Nothing is sent.', {class: 'demo-notice', id: 'home-contact-notice'}));
    function field(key, label, type, required, autocomplete) {
      const row = node('div', undefined, {class: 'demo-field'});
      const input = node('input', undefined, {id: 'home-' + key, type, name: key, autocomplete, maxlength: key === 'name' ? '120' : key === 'phone' ? '32' : '254', 'aria-describedby': 'home-contact-notice'});
      input.value = contact[key]; input.required = required;
      if (type === 'tel') input.setAttribute('inputmode', 'tel');
      input.addEventListener('input', () => {contact[key] = input.value; input.setCustomValidity('');});
      row.append(node('label', label, {for: 'home-' + key}), input);
      form.append(row); return input;
    }
    const name = field('name', 'Your name', 'text', true, 'name');
    const methods = node('fieldset', undefined, {class: 'demo-contact-methods'});
    methods.append(node('legend', 'How should we contact you?'));
    ['call', 'text', 'email'].forEach(method => {
      const label = node('label');
      const radio = node('input', undefined, {type: 'radio', name: 'contact-method', value: method});
      radio.checked = contact.method === method;
      radio.addEventListener('change', () => {contact.method = method; if (method !== 'text') contact.ballpark = false; render(false); mount.querySelector('input[value="' + method + '"]')?.focus({preventScroll: true});});
      label.append(radio, node('span', {call: 'Call', text: 'Text', email: 'Email'}[method]));
      methods.append(label);
    });
    form.append(methods);
    const channel = contact.method === 'email' ? field('email', 'Email address', 'email', true, 'email') : field('phone', 'Phone number', 'tel', true, 'tel');
    const zip = field('zip', 'ZIP code (optional)', 'text', false, 'postal-code'); zip.setAttribute('inputmode', 'numeric'); zip.setAttribute('maxlength', '10');
    if (contact.method === 'text') {
      const estimate = node('div', undefined, {class: 'demo-ballpark'});
      const label = node('label', undefined, {for: 'home-ballpark'});
      const checkbox = node('input', undefined, {id: 'home-ballpark', type: 'checkbox'});
      checkbox.checked = contact.ballpark;
      checkbox.addEventListener('change', () => {contact.ballpark = checkbox.checked;});
      label.append(checkbox, node('span', 'I’d like a ballpark estimate by text.'));
      estimate.append(label, node('p', 'We’ll review your answers first. We may need a few more details or a visit before we can estimate the job.', {class: 'demo-notice'}));
      form.append(estimate);
    }
    const trap = node('div', undefined, {hidden: '', 'aria-hidden': 'true'});
    const website = node('input', undefined, {id: 'home-website', name: 'website', type: 'text', tabindex: '-1', autocomplete: 'off'});
    trap.append(node('label', 'Leave this blank', {for: 'home-website'}), website);
    const submit = node('button', 'Send request', {type: 'submit', class: 'demo-primary'});
    submit.disabled = !endpoint;
    const footnote = node('p', endpoint ? 'This sends your request to Bremray. It does not book an appointment. ' : 'Sending is not connected in this preview.', {class: 'demo-notice'});
    footnote.append(node('a', 'Privacy policy', {href: '/privacy.html'}));
    form.append(trap, submit, footnote);
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!endpoint || !editable()) return;
      const error = rules.validateContact(contact);
      if (error) {
        const input = error.field === 'name' ? name : error.field === 'zip' ? zip : channel;
        input.setCustomValidity(error.message); input.reportValidity(); return;
      }
      if (!form.reportValidity()) return;
      const data = rules.payloadFor(state, contact, window.location.origin + window.location.pathname, website.value);
      const sending = submission.submit(data);
      render();
      await sending;
      render();
    });
    return form;
  }
  function renderReceipt(stage, delivery) {
    const messages = {
      sending: ['Sending your request…', 'Please keep this page open while we send your details.'],
      delivered: ['Thanks. We’ve got your request.', 'An electrician will contact you about the work. We’ll use the contact method you chose.'],
      pending: ['Your request is still being sent.', 'Please check below before sending it again.'],
      uncertain: ['We saved your details, but can’t confirm delivery yet.', 'Please call us so we can check your request. You do not need to fill out the form again.'],
      unknown: ['We couldn’t confirm your request.', 'Your connection may have dropped. Check below to see whether it went through.'],
      retryable: ['Your request hasn’t arrived yet.', 'Your details are still here. You can try sending them again.'],
      rejected: ['We couldn’t send your request.', 'Please call us, or check your details and try again.']
    };
    const [title, description] = messages[delivery.status] || messages.unknown;
    const receipt = node('section', undefined, {class: 'demo-receipt', 'aria-live': 'polite', 'aria-busy': String(delivery.busy)});
    receipt.append(node('h2', title, {class: 'demo-question', tabindex: '-1'}), node('p', description, {class: 'demo-help'}));
    if (delivery.status === 'delivered') {
      if (contact.ballpark) receipt.append(node('p', 'We’ll review your answers before sending a ballpark estimate. We may need more details or a visit first.', {class: 'demo-help'}));
      receipt.append(node('p', 'This is a request for a callback, not a confirmed appointment.', {class: 'demo-notice'}));
    } else if (delivery.status !== 'sending') {
      const action = delivery.status === 'retryable'
        ? button('Try sending again', async () => {const request = submission.submit(); render(); await request; render();}, 'demo-primary')
        : delivery.status === 'rejected'
          ? button('Check my details', () => {if (submission.reset()) render();}, 'demo-primary')
          : button(delivery.busy ? 'Checking…' : 'Check request status', async () => {const request = submission.check(); render(); await request; render();}, 'demo-primary');
      action.disabled = delivery.busy;
      receipt.append(action);
    }
    if (delivery.status !== 'sending') receipt.append(node('a', 'Call (734) 216-9437', {href: 'tel:+17342169437', class: 'demo-receipt-call'}));
    stage.append(receipt);
  }
  render(false);
}());
