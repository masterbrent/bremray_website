# YourBusiness Electric Website

A fast, static HTML website for an electrical contractor business.

## Structure

- `index.html` - Homepage with services overview
- `services.html` - Detailed services page
- `about.html` - About the business
- `contact.html` - Contact information and form placeholder
- `css/main.css` - All styles
- `js/main.js` - Basic JavaScript functionality

## Setup Instructions

1. **Update Business Information:**
   - Replace "YourBusiness" with your actual business name
   - Replace "Your City" with your actual city/location
   - Replace phone numbers (XXX) XXX-XXXX with real numbers
   - Add your real license number
   - Update email address

2. **GoHighLevel Integration:**
   - The contact form placeholder is in `contact.html`
   - Replace the placeholder div with your GoHighLevel form embed code
   - Update all links to `/emergency-electrician`, `/ev-charger-installation`, etc. to point to your GoHighLevel landing pages

3. **Images:**
   - Add your logo and any service images to the `img/` folder
   - Update image references in the HTML

4. **Hosting:**
   - Can be hosted on any static hosting service:
     - Netlify (recommended - drag and drop deployment)
     - Vercel
     - GitHub Pages
     - Any web server

## GoHighLevel Landing Pages to Create

Create these landing pages in GoHighLevel:
- `/emergency-electrician` - For Google Ads emergency campaign
- `/ev-charger-installation` - For EV charger campaign
- `/electrical-panel-upgrade` - For panel upgrade services
- `/commercial-electrical` - For commercial services
- `/book-now` - Scheduling page with calendar

## Performance

This site is optimized for speed:
- No frameworks or heavy libraries
- Minimal CSS and JavaScript
- Google Fonts loaded asynchronously
- Mobile responsive

## SEO

Remember to:
- Update meta descriptions on each page
- Add your Google Analytics code
- Submit sitemap to Google Search Console
- Set up Google My Business integration
## October 2026 staging redesign

Current review branch: `codex/visual-redesign-staging-20261019`. Do not merge to main without Brent's publication approval: main auto-deploys to DigitalOcean.

Run from this repository with `GOMAXPROCS=2 go run staging/server.go`, then open http://127.0.0.1:8766. It binds only to loopback. The preview sends no live Analytics tag, strips Formspree form actions, intercepts submissions, and returns noindex headers/robots rules. Stop with Ctrl-C. No cloud server is needed.

With the preview running, run `node --test tests/*.test.cjs`. The staging test intentionally requires the preview server. Existing analytics tests test production consent behavior; preview excludes that loader entirely.

Design: installations first (generators, EV charging, panels), repairs secondary, plain customer language, service-specific intake. Four generated illustrative JPEGs establish layout; they are not Bremray project evidence. Replace with genuine van/job photos before final publication when available. No reviews or jobs fabricated. Current styling is a review concept, not a production release.

Intake is a local UI prototype, not an AI quoting engine. It does not calculate or email prices. Service-call rates and future quote rules are private business context in Braindump, not public source. Installation estimates require scope, labor, materials and unresolved conditions. Automated prices require approved rules/review gates. Marketing checkbox is optional and unchecked; no marketing service is connected.

Research references: https://a2electric.com/ , https://jdelectricllc.com/ , https://www.vedderelectric.com/ , https://haleymechanical.com/electrical-service/ . Opportunities: genuine job photos, simpler service selection, clearer estimate process, local proof without invented claims. No ranking guarantee.
