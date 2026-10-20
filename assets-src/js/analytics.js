/* Optional analytics. Keep GA4 Enhanced Measurement disabled in the web stream:
   this module explicitly sends page_view, phone_click and confirmed generate_lead. */
(function () {
    'use strict';
    const measurementId = 'G-4062HJ1QDH';
    const storageKey = 'bremray-analytics-consent';
    let consent = null;
    let started = false;
    let returnFocus = null;
    try { consent = window.localStorage.getItem(storageKey); } catch (_) { /* Ask each visit if storage is unavailable. */ }

    function cleanUrl(value) {
        try {
            const url = new URL(value);
            return /^https?:$/.test(url.protocol) ? url.origin + url.pathname : '';
        } catch (_) { return ''; }
    }
    function pageDetails() {
        return {
            page_location: window.location.origin + window.location.pathname,
            page_referrer: cleanUrl(document.referrer)
        };
    }
    function gtag() { window.dataLayer.push(arguments); }
    function startAnalytics() {
        window['ga-disable-' + measurementId] = false;
        if (started) return;
        started = true;
        window.dataLayer = window.dataLayer || [];
        gtag('consent', 'default', {
            analytics_storage: 'granted', ad_storage: 'denied',
            ad_user_data: 'denied', ad_personalization: 'denied'
        });
        gtag('js', new Date());
        gtag('config', measurementId, Object.assign(pageDetails(), {
            send_page_view: false,
            allow_google_signals: false,
            allow_ad_personalization_signals: false
        }));
        gtag('event', 'page_view', pageDetails());
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
        document.head.appendChild(script);
    }
    function clearAnalyticsCookies() {
        // GA4 may set host-only or parent-domain cookies; expire both variants.
        const names = document.cookie.split(';').map(part => part.split('=')[0].trim())
            .filter(name => /^_ga(?:_|$)/.test(name));
        const domains = window.location.hostname.split('.');
        for (const name of names) {
            document.cookie = name + '=; Max-Age=0; path=/';
            for (let i = 0; i < domains.length - 1; i++) {
                const domain = domains.slice(i).join('.');
                document.cookie = name + '=; Max-Age=0; path=/; domain=' + domain;
                document.cookie = name + '=; Max-Age=0; path=/; domain=.' + domain;
            }
        }
    }
    function choose(value) {
        consent = value;
        try { window.localStorage.setItem(storageKey, value); } catch (_) { /* The current-page choice still applies. */ }
        if (value === 'granted') startAnalytics();
        else {
            window['ga-disable-' + measurementId] = true;
            clearAnalyticsCookies();
        }
        panel.hidden = true;
        if (returnFocus) returnFocus.focus();
    }

    const style = document.createElement('style');
    style.textContent = '.analytics-choices{position:fixed;z-index:10000;bottom:80px;left:16px;right:16px;max-width:560px;margin:auto;padding:18px;background:#fff;color:var(--ink,#080808);border:1px solid var(--module-line,#d9dce2);border-radius:12px;box-shadow:0 5px 24px #0003;font:15px/1.5 var(--font-sans,Arial,sans-serif);max-height:70vh;overflow:auto;text-align:left}.analytics-choices[hidden]{display:none}.analytics-choices p{margin:0 0 12px;color:var(--ink,#080808)}.analytics-choices a{color:var(--accent,#2455c6);text-decoration:underline}.analytics-actions{display:flex;gap:10px;flex-wrap:wrap}.analytics-choices button,.analytics-reopen{font:inherit;cursor:pointer;min-height:44px;padding:9px 14px;border:1px solid var(--accent,#2455c6);border-radius:6px;background:#fff;color:var(--ink,#080808)}.analytics-choices button:focus-visible,.analytics-reopen:focus-visible{outline:3px solid var(--accent,#2455c6);outline-offset:3px}.analytics-reopen{display:block;margin:16px auto;background:transparent;color:inherit;border-color:currentColor}.analytics-title{display:block;margin-bottom:6px;font-size:17px}';
    document.head.appendChild(style);
    const panel = document.createElement('section');
    panel.className = 'analytics-choices';
    panel.setAttribute('aria-label', 'Optional analytics cookies');
    panel.hidden = consent === 'granted' || consent === 'denied';
    const title = document.createElement('strong');
    title.className = 'analytics-title';
    title.textContent = 'Your cookie choices';
    panel.appendChild(title);
    const explanation = document.createElement('p');
    explanation.textContent = 'May we use Google Analytics to measure page visits, call-button clicks and completed requests? Analytics is optional. Your form answers and contact details are not included. You can change your choice in the footer.';
    panel.appendChild(explanation);
    const policy = document.createElement('a');
    policy.href = '/privacy.html';
    policy.textContent = 'Read our privacy policy';
    const policyLine = document.createElement('p');
    policyLine.appendChild(policy);
    panel.appendChild(policyLine);
    const actions = document.createElement('div');
    actions.className = 'analytics-actions';
    const reject = document.createElement('button');
    reject.type = 'button';
    reject.textContent = 'Reject analytics';
    reject.addEventListener('click', function () { choose('denied'); });
    const accept = document.createElement('button');
    accept.type = 'button';
    accept.textContent = 'Accept analytics';
    accept.addEventListener('click', function () { choose('granted'); });
    actions.appendChild(reject);
    actions.appendChild(accept);
    panel.appendChild(actions);
    document.body.appendChild(panel);
    const reopen = document.createElement('button');
    reopen.type = 'button';
    reopen.className = 'analytics-reopen';
    reopen.textContent = 'Cookie choices';
    reopen.addEventListener('click', function () {
        returnFocus = reopen;
        panel.hidden = false;
        reject.focus();
    });
    (document.querySelector('footer') || document.body).appendChild(reopen);
    if (consent === 'granted') startAnalytics();
    document.addEventListener('click', function (event) {
        if (consent !== 'granted') return;
        const link = event.target.closest && event.target.closest('a[href^="tel:"]');
        if (link) gtag('event', 'phone_click', pageDetails());
    });
    document.addEventListener('bremray:lead-delivered', function () {
        if (consent === 'granted') gtag('event', 'generate_lead', pageDetails());
    });
    window.addEventListener('storage', function (event) {
        if (event.key !== storageKey && event.key !== null) return;
        consent = event.newValue;
        if (consent === 'granted') startAnalytics();
        else {
            window['ga-disable-' + measurementId] = true;
            clearAnalyticsCookies();
        }
        panel.hidden = consent === 'granted' || consent === 'denied';
    });
}());
