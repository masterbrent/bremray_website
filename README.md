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

EV footer preview, October 19: added original Wallbox and ChargePoint logos to the existing four equipment brands on all 18 public pages. Both brands already appear on the EV service page; neither receives a certification or partnership caption. The bank uses three columns on desktop and two on phones, preserving original logo proportions and colors. Wallbox's PNG comes from its official media-toolkit archive; ChargePoint's SVG comes from its official branding-page header. Source URLs, archive member and unchanged asset checksums are in `images/manufacturers/provenance.json`. ChargePoint's published guidelines require written brand-use approval; this preview does not establish production permission. Tesla was not added because an original asset could not be retrieved through the available public sources without the media-gallery usage representation. New tests check the same six brands and only the confirmed Generac/SPAN credential captions on every page, plus all six asset checksums. Root browser review and production publication remain separate.

Panel reference photos, October 19: the panel page now includes two real, licensed identification examples: Federal Pacific Stab-Lok by Repeater-reclaim (CC BY-SA 4.0), and an older Murray fuse box by p.Gordon, cropped by Gazebo (CC BY 2.0). Both use unchanged Wikimedia 960px renditions, 423 KB combined, lazy loading, visible attribution/license links, and full-image links. Sources and checksums are in `images/panels/provenance.json`. They are explicitly reference images, not Bremray projects or proof of a particular installation's condition. No usable licensed Zinsco photo was found. Captions do not suggest all fuse boxes require replacement. The nearby FPE paragraph replaces an unsupported universal failure percentage and insurer claim with the CPSC notice's actual findings; its closed investigation made no safety determination. General fuse guidance is supported by the CPSC Home Wiring Hazards guide. This is a narrow accuracy correction alongside photos, not an electrical-code audit of the rest of the page.

Latest customer-voice direction: lead with the issue and the result the customer needs, using everyday English without talking down to them. Brands stay in supporting information; SPAN remains last in the footer. The panel opening was adjusted narrowly, and the tracked/installed voice skill updated. Existing copy otherwise remains the baseline.

Panel explanation follow-up, October 19: per Brent, removed the unnecessary "not Bremray projects" sentence and moved required author/source/license/change notes into a compact bottom-of-page disclosure. The page now explains failed breaker protection (FPE and Zinsco test evidence), fuse-box overrating/bypass risks, extra electrical demand, and intelligent load management as a possible alternative to a larger utility service. A service upgrade remains distinct from replacing faulty equipment. Updated the matching FAQ and removed the automatic 200A scope assumption. Sources are linked in the disclosure. Red/blue handles are only an identification clue; no unverified connection to Sears homes is stated.

Generator positioning follow-up: Brent supplied the phrase "Home energy resilience," replacing the initial "Power resilience" preview. The hero pairs it with "Keep the essentials running when the power goes out." The selected phrase is recorded in the customer-voice skill. The rest of the generator copy is unchanged.
The panel contact prompt now matches the actual HCP form: it requests a description and follow-up, not an unavailable photo upload or immediate direct electrician connection. Removed the generic free-assessment button wording in line with Brent's existing preference.

Publication fixes, October 19: the footer retains six equipment brands with five original logos and a plain-text ChargePoint name. The ChargePoint image has been removed from public files because written brand-use approval was not established; its original provenance remains under excluded_assets. Narrow corrections on the panel and grounding pages now distinguish a qualifying water-pipe electrode (with its supplemental electrode) from the bonded fault-current path back to the electrical source. Ground rods/earth alone do not provide that protective path. Sources: NFPA 70 sections 250.4(A)(5), 250.52(A)(1), and 250.53(D)(2); NFPA explanation at https://www.nfpa.org/news-blogs-and-articles/blogs/2024/03/14/how-grounding-and-bonding-are-achieved . Other owner copy is unchanged. Root owns final integration and publication.

Adaptive intake prototype, October 19: `adaptive-intake.html` is a local-only review page on `codex/adaptive-intake-preview-20261019`; it is not linked in production navigation or the sitemap. The first question asks the customer's intent: repair, installation, replacement/upgrade, or uncertainty. Relevant item choices follow, including lights, fans, outlets/switches, EV charging, backup power, appliance/equipment power, garage wiring and panels. Multiple jobs, unlisted work and uncertain choices have an optional plain-text description. Paths take two to five questions; the progress label does not promise a fixed total. Repairs collect observations, lighting asks about access only when wiring is absent or uncertain, and panel problems collect the symptom before timing. Unknowns remain unknown; reported wiring/access is not verified scope. The typing alternative preserves its separate draft when switching modes. Review/edit preserves applicable answers and drops answers from branches that no longer apply. Changing the intent or item clears the previous job's details. This is deterministic branching, not a model-generated form. It makes no network requests, persists no answers, calculates no job estimates and sends nothing to Housecall Pro. The final contact screen accepts preview details in memory only. A reload or Start over clears the draft.

For an independent local preview, run `GOMAXPROCS=2 BREMRAY_PREVIEW_ADDR=127.0.0.1:8767 go run staging/server.go`, then open `http://127.0.0.1:8767/adaptive-intake.html`. The address override accepts only a literal loopback IP with a valid port; the default remains `127.0.0.1:8766`. The existing noindex, CSP and live-widget removal rules remain intact. Run `BREMRAY_PREVIEW_URL=http://127.0.0.1:8767 node --test --test-concurrency=2 tests/*.test.cjs` and `GOMAXPROCS=2 go test staging/server.go staging/server_test.go`. Focused tests cover all branching paths, the five-question limit, uncertain answers, nested description exits, stale branch removal, draft switching and safe plain-text rendering. Production analytics/footer/navigation assertions exclude only the named preview page; asset and existing-logo checks still cover it. Keep this experiment off main until it has been reviewed and its eventual purpose/integrations are approved.

Visual intake homepage preview, October 19 (card 1718): owner clarified that the flat question-and-box layout looked like an FAQ page; changing its wording was not sufficient. The revised homepage uses a compact dark task area and three photographic choice buttons. Existing illustrative house, charger and panel images are decorative parts of the repair, install and upgrade controls; plain scope examples prevent those photographs from implying a narrow service list. The entire tile is one accessible button. Installation receives the existing warm gold accent. Phone layouts use compact image-and-text rows so all three primary choices are visible. Uncertainty and typing sit together underneath; uncertainty remains available after Back even when selected.

The existing prompt and conditional questions remain; photo choices appear only on the homepage's opening question. The standalone adaptive-intake.html retains its simple question layout. Prior choices remain editable. Follow-up, typing and review screens share the dark treatment with readable inputs and focus states. The redundant homepage location strip is hidden, navigation compacted, and supporting content spacing reduced. Original service, pricing, area and FAQ wording is still checksum-protected; original service photos, footer and links remain below. No new submission, HCP connection, job estimate or scheduling behavior exists. The preview states nothing is sent and identifies the illustrative imagery. Local review: http://127.0.0.1:8767/ on this Mac. Keep the branch off main until reviewed; publishing and real HCP delivery are separate work.

Intake ending preview, October 19 (card 1723): the final screen summarizes the reported job without diagnosing it, explains phone estimates versus an in-person look, and offers a name plus Call/Text/Email preference with only the relevant contact field required. ZIP is optional. Text reveals an unchecked request for a ballpark estimate, subject to review and further details or a visit. Brent reconfirmed $250 for the first hour of service-call labor, $195 per additional hour, and parts extra. Repairs show that rate; small replacements show it conditionally; installations, major upgrades and unknown jobs do not present it as a job estimate. Contact drafts survive answer editing and mode changes, remain in memory only, and clear on Start over or reload. Sending remains disabled with explicit preview labels. Focused closing tests cover factual summaries, scoped pricing and uncertain/typed paths; browser checks cover contact methods, editing and responsive layout. Real delivery and conversion measurement remain card 1719.
