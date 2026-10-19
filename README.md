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

Run from this repository with `GOMAXPROCS=2 go run staging/server.go`, then open http://127.0.0.1:8766. It binds only to loopback. The preview removes the complete Housecall Pro embed before serving HTML and substitutes a disabled local layout sample. A preview-only Content Security Policy also blocks external frames/scripts, form actions, and external connections. It excludes live Analytics, strips legacy Formspree actions, and returns noindex headers/robots rules. Stop with Ctrl-C. Restart after changing the Go server or embedded template. No cloud server is needed.

With the preview running, run `node --test tests/*.test.cjs`. The staging test intentionally requires the preview server. Existing analytics tests test production consent behavior; preview excludes that loader entirely.

Design: installations first (generators, EV charging, panels), repairs secondary, plain customer language, service-specific intake. Four generated illustrative JPEGs establish layout; they are not Bremray project evidence. Replace with genuine van/job photos before final publication when available. No reviews or jobs fabricated. Current styling is a review concept, not a production release.

`get-help.html` and `contact.html` now contain Bremray Electrical’s native Housecall Pro lead embed, copied from the signed-in account’s Settings > Leads > Share lead form on October 19, 2026. The form identifier is public embed configuration, not an API credential. Keep the exact start/end embed comments: staging replaces the entire block, including its fallback link. Each page has one iframe with an accessible title, full-width styling, the vendor resize script, and a phone fallback. No custom intake answers are claimed to pass into this cross-origin form. The privacy page identifies Housecall Pro as the request processor.

HCP account verification: Bremray Electrical, bremray.com, bremrayllc@gmail.com. Native fields currently include names, phone, email, address and service details, plus a separate unchecked promotional SMS choice. Job Inbox auto-reply was ON. The actual native embed rendered in a temporary local browser check at 390px and 1280px; its vendor script resized the iframe to 1136px and 870px respectively. The normal staging server still removes the live form.

On October 19, Brent approved one clearly labelled delivery test using the public business contact details. Submission through the installed iframe succeeded. Housecall Pro Job Inbox showed the exact test message; an independent connector read confirmed the new Lead Form record. No job or estimate was created, no HCP settings changed, and marketing consent remained unchecked. Automatic reply delivery itself was not verified. The temporary live-form test server was stopped afterwards. This change remains in draft PR3 and is not deployed.

The test exposed a native HCP validation limit of 100 characters in Service details. Both inquiry pages now explain the short-description limit. Collecting detailed installation scope is still part of the separate future intake/quote project; the native form is a basic callback request.

A second owner-approved test on October 19 used a separate business-owned test number. The installed website iframe created the expected HCP lead. The customer thread showed its automatic acknowledgement, and the receiving carrier log independently confirmed both the opt-in notice and acknowledgement arrived with matching text. Customer SMS acknowledgement is now verified end to end; email delivery was not separately inspected. Marketing consent remained unchecked. No manual messages, appointments, estimates, or HCP configuration changes were made. The temporary form-check server was stopped after the test. The normal preview remains isolated, and the website changes are not yet published.

EV fact check, October 19: the two load-sharing/solar bullets were narrowed to match the specific US equipment. ChargePoint Home Flex requires a dedicated circuit for each unit (https://www.chargepoint.com/drivers/home/installation/flex). Compatible Wallbox Pulsar Plus units support power sharing subject to installation requirements (https://support.wallbox.com/wp-content/uploads/ht_kb/2023/11/20231121_Power-Sharing-US_Multilingual.pdf). Wallbox solar-surplus charging needs a compatible meter and is limited to single-charger installations (https://wallbox.com/en_us/pulsar-plus-ev-charger). The original recommendations and surrounding copy remain intact.

The earlier guided intake remains as non-executable source at `staging/prototypes/get-help-guided.html.txt`, with question definitions in `js/intake.js`, for the separate future quote project. It is not an AI quoting engine and does not calculate or email prices. Service-call rates and future quote rules are private business context in Braindump, not public source. Automated prices require approved scope, labor/material rules and review gates.

Research references: https://a2electric.com/ , https://jdelectricllc.com/ , https://www.vedderelectric.com/ , https://haleymechanical.com/electrical-service/ . Opportunities: genuine job photos, simpler service selection, clearer estimate process, local proof without invented claims. No ranking guarantee.

Manufacturer footer preview, October 19: Brent confirmed the exact designations **Generac Aligned Partner** and **SPAN Certified Installer**. Use those titles without broadening them into authorized dealer status or other certifications. The footer shows original Generac, SPAN, Square D and Siemens logos; Square D and Siemens have no credential labels. Official source URLs and checksums are in `images/manufacturers/provenance.json`. Keep this bank in staging until publication is approved. The preview has been checked at 1280px desktop and 390px phone widths; the full test suite has 20 passing checks. The installed customer-voice skill and its repository copy contain the same confirmed wording.

Readiness follow-up, October 19: corrected the two generator pages' five-year **limited** warranty wording and replaced square-footage promises with load-dependent sizing. The pages link to Generac's official warranty and sizing guidance. All public pages now reference the existing SVG favicon; the three obsolete `mobile-menu.js` references are removed because the shared `design.js` already handles the current navigation. Two additional checks cover local asset references and generator claim boundaries. Brent's later instruction is to preserve his existing copy, so unconfirmed business dates, bonding, installation counts, timing and workmanship claims remain unchanged for his confirmation on Braindump card 1698. This is a narrow staging correction, not a broader copy rewrite or a production release.
