# Bremray Electrical website

## Current production operations

The live site is a static DigitalOcean App Platform deployment of `masterbrent/bremray_website`, branch `main`. A push to `main` deploys automatically. The historical setup and staging notes below are not the current publication state.

- Canonical origin: `https://bremray.com`. The `www.bremray.com` alias is managed in the existing DigitalOcean DNS zone. Its host-specific ingress rule returns a permanent 301 to HTTPS `bremray.com`, preserving the request path and query. Keep this rule before the general site route; never redirect the apex back to `www`.
- App Platform owns DNS/certificate activation. Check domain status and real HTTPS responses after an infrastructure change; a successful app deployment alone does not prove a newly added certificate is ready.
- Homepage and `get-help.html` use the lightweight adaptive intake. It sends to the separate Bremray intake service at `https://bots.propfirmbot.com/bremray-intake/v1/requests`; its private implementation and operator runbook live in `masterbrent/bremray-hcp-relay-codex`. Keep HCP credentials and customer records out of this public repo. `contact.html` retains the native HCP form as a fallback. Website email links use the public `contact@bremray.com` address with Cloudflare `email_off` guards.
- Run the protected preview from this checkout with `GOMAXPROCS=2 go run staging/server.go`, then `node --test --test-concurrency=1 tests/*.test.cjs`. Preview tests require port 8766. The preview strips live intake endpoints, HCP embeds and measurement, and blocks external submissions. `BREMRAY_PREVIEW_ADDR` accepts another loopback port if needed. The old independent 8767 checkout is superseded by this integrated release. On a memory-constrained Mac, build the preview binary on the existing remote build host for Darwin/arm64 instead of running local Go builds.
- Before publishing, check source diffs and phone/desktop navigation. After publishing, check the deployed commit, sitemap URLs, canonical/indexing directives, email links, error-page recovery, intake endpoint availability, native fallback and HTTPS redirects. Do not submit a customer request as part of a routine smoke check.

The October 20 intake release preserves service copy and technical SEO repairs. It makes section topics prominent and keeps the tap-to-call number beside the logo at every screen size. The custom form preserves job answers and contact preferences, only confirms success after HCP acceptance, and records a sanitized `generate_lead` event only with analytics consent. Estimates and automated text/email follow-up are separate work; public service-call prices remain absent. Customer request IDs and form contents stay in memory in the browser, so reloading loses an unfinished request's local recovery state. Backend idempotency protects retries using the same request ID; it is not cross-device deduplication.

Owner service-scope clarification, October 20: Bremray works mostly on residential jobs, occasionally on smaller commercial projects such as small stores and small schools, and does very little industrial work. Keep commercial/industrial promotion off the homepage. The Services page may briefly describe the confirmed smaller commercial work. Do not infer broad three-phase, industrial equipment, retail/office buildout, warehouse/machine-shop or standalone trenching capabilities from that clarification. The old broad list was removed. Existing generator site-preparation explanations were preserved.

Owner clarification, October 20: Bremray does electrical work for spas, hot tubs and saunas. The old Services We Do Not Provide/referral block was inaccurate and removed. Do not reintroduce that exclusion or claim a referral program. Pool and solar installation scope remains unspecified; do not infer an offering or exclusion.

SPAN positioning: Brent reiterated that SPAN installations are rare. Keep the confirmed certification in the footer; do not list SPAN under “What We Do Best” or promote it as a specialty. The About-page specialty bullet was removed.

The shared palette is defined at the top of `css/design.css`: dark green `#173239`, cream `#faf8f3`, and gold `#efbd66`. Legacy `assets-src/css/main.css` aliases these tokens; regenerate its production copy with the existing asset builder. Keep warning/status colors distinct and use dark text on gold buttons. Build on the remote host when the Mac is memory constrained.

## Shared asset build

Edit `assets-src/css/main.css`, `assets-src/js/analytics.js` and `assets-src/js/generator-tabs.js` for these three shared files. Generate their compact production copies at the existing `css/` and `js/` URLs with:

```sh
GOMAXPROCS=2 go run tools/build-assets.go
GOMAXPROCS=2 go run tools/build-assets.go --check
```

The build uses esbuild **v0.28.2**, pinned in the Go wrapper. The first run downloads that Go module; subsequent runs use the local Go cache. No npm installation, bundling, source maps, property-name mangling, or runtime dependency is added. Commit both the readable sources and generated files. Other CSS/JavaScript files remain directly authored at their existing paths.

Run the existing Node suite after building; analytics consent and generator controls are exercised against the actual production JavaScript. The `--check` command rebuilds into a temporary directory and fails if committed outputs are stale. Minification reduces transfer bytes but does not address Housecall Pro's iframe execution cost.

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
- `/book-now` - Scheduling page with calendar

## Performance

This site is optimized for speed:
- No frameworks or heavy libraries
- Minimal CSS and JavaScript
- System fonts; no external font downloads
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

EV footer preview, October 19: added original Wallbox and ChargePoint logos to the existing four equipment brands on all 18 public pages. Both brands already appear on the EV service page; neither receives a certification or partnership caption. The bank uses three columns on desktop and two on phones, preserving original logo proportions and colors. Wallbox's PNG comes from its official media-toolkit archive; ChargePoint's SVG comes from its official branding-page header. Source URLs, archive member and unchanged asset checksums are in `images/manufacturers/provenance.json`. ChargePoint's published guidelines require written brand-use approval; this preview does not establish production permission. Tesla was not added because an original asset could not be retrieved through the available public sources without the media-gallery usage representation. New tests check the same six brands and only the confirmed Generac/SPAN credential captions on every page, plus all six asset checksums. Root browser review and production publication remain separate.

Panel reference photos, October 19: the panel page now includes two real, licensed identification examples: Federal Pacific Stab-Lok by Repeater-reclaim (CC BY-SA 4.0), and an older Murray fuse box by p.Gordon, cropped by Gazebo (CC BY 2.0). Both use unchanged Wikimedia 960px renditions, 423 KB combined, lazy loading, visible attribution/license links, and full-image links. Sources and checksums are in `images/panels/provenance.json`. They are explicitly reference images, not Bremray projects or proof of a particular installation's condition. No usable licensed Zinsco photo was found. Captions do not suggest all fuse boxes require replacement. The nearby FPE paragraph replaces an unsupported universal failure percentage and insurer claim with the CPSC notice's actual findings; its closed investigation made no safety determination. General fuse guidance is supported by the CPSC Home Wiring Hazards guide. This is a narrow accuracy correction alongside photos, not an electrical-code audit of the rest of the page.

Latest customer-voice direction: lead with the issue and the result the customer needs, using everyday English without talking down to them. Brands stay in supporting information; SPAN remains last in the footer. The panel opening was adjusted narrowly, and the tracked/installed voice skill updated. Existing copy otherwise remains the baseline.

Panel explanation follow-up, October 19: per Brent, removed the unnecessary "not Bremray projects" sentence and moved required author/source/license/change notes into a compact bottom-of-page disclosure. The page now explains failed breaker protection (FPE and Zinsco test evidence), fuse-box overrating/bypass risks, extra electrical demand, and intelligent load management as a possible alternative to a larger utility service. A service upgrade remains distinct from replacing faulty equipment. Updated the matching FAQ and removed the automatic 200A scope assumption. Sources are linked in the disclosure. Red/blue handles are only an identification clue; no unverified connection to Sears homes is stated.

Generator positioning follow-up: Brent supplied the phrase "Home energy resilience," replacing the initial "Power resilience" preview. The hero pairs it with "Keep the essentials running when the power goes out." The selected phrase is recorded in the customer-voice skill. The rest of the generator copy is unchanged.
The panel contact prompt now matches the actual HCP form: it requests a description and follow-up, not an unavailable photo upload or immediate direct electrician connection. Removed the generic free-assessment button wording in line with Brent's existing preference.

Publication fixes, October 19: the footer retains six equipment brands with five original logos and a plain-text ChargePoint name. The ChargePoint image has been removed from public files because written brand-use approval was not established; its original provenance remains under excluded_assets. Narrow corrections on the panel and grounding pages now distinguish a qualifying water-pipe electrode (with its supplemental electrode) from the bonded fault-current path back to the electrical source. Ground rods/earth alone do not provide that protective path. Sources: NFPA 70 sections 250.4(A)(5), 250.52(A)(1), and 250.53(D)(2); NFPA explanation at https://www.nfpa.org/news-blogs-and-articles/blogs/2024/03/14/how-grounding-and-bonding-are-achieved . Other owner copy is unchanged. Root owns final integration and publication.
