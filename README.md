# Bremray website

Production: https://bremray.com/ — private customer requests go through the separate intake relay into Housecall Pro. This repository is public. Do not commit credentials, customer requests, private contact details, or internal pricing rules.

## One shared template

All 18 public pages are generated from `site/layout.gohtml`. Do not edit the generated root, location, or generator HTML directly.

- `site/header.gohtml` and `site/footer.gohtml`: one header and footer for every page.
- `site/contact.gohtml`: the shared contact section on interior pages.
- `site/pages.json`: public paths, page keys, and page-specific scripts.
- `site/pages/*.head.gohtml`: page titles, descriptions, canonical URLs, Open Graph tags, and structured data.
- `site/pages/*.body.gohtml`: each page's existing content. These are trusted repository-owned HTML fragments, not templates for customer input.
- `css/site.css`: canonical fonts, colors, shared chrome, homepage modules, and homepage intake presentation.
- `css/content-pages.css`: interior content components using the same design tokens. No alternate skin or inline page styles.

Generate and check from the repository root:

```sh
GOMAXPROCS=2 go run tools/sitegen/main.go
GOMAXPROCS=2 go run tools/sitegen/main.go -check
GOMAXPROCS=2 go test tools/sitegen/main.go tools/sitegen/main_test.go
```

The generator uses only the Go standard library. It renders all pages before writing and rejects invalid or duplicate paths. Check mode does not change files. Commit both source fragments and generated HTML. GitHub Actions rejects stale output and checks that the template migration preserved page content, metadata, schemas, links, and intake hooks. Intentional future copy changes must update the relevant preservation fixture after review.

## Preview and validation

```sh
GOMAXPROCS=2 go run staging/server.go
```

Open http://127.0.0.1:8766. This loopback-only preview removes live analytics, strips form endpoints, substitutes a disabled HCP sample, blocks external frames/connections, and sends noindex. Do not enable sending in this preview.

With the preview running:

```sh
node --test --test-concurrency=1 tests/*.test.cjs
GOMAXPROCS=2 go test staging/server.go staging/server_test.go
```

Check phone and desktop layouts in a browser, including the phone link, generator tabs, panel references, homepage intake, and separate request page. Routine checks must not submit real leads.

## Compact production scripts

Edit `assets-src/js/analytics.js` or `assets-src/js/generator-tabs.js`, then run:

```sh
GOMAXPROCS=2 go run tools/build-assets.go
GOMAXPROCS=2 go run tools/build-assets.go -check
```

The wrapper pins esbuild v0.28.2. Commit readable sources and generated scripts. Other JavaScript and CSS are directly authored.

## Lead capture and privacy

`js/home-intake.js` uses `BremrayIntake.createSubmission` from `js/adaptive-intake.js`. The same delivery state machine serves the standalone request page. Success requires a confirmed delivery receipt; ambiguous requests check their status before retrying. Form contents remain in memory. No automatic price, appointment, or SMS delivery is promised. Only confirmed leads produce a sanitized analytics event, and only with prior analytics consent.

`contact.html` retains the native HCP fallback. Its source fragment includes the exact HCP start/end comments used by the protected preview. Do not load that iframe or booking script on the homepage or request page.

The header phone stays beside the actual Bremray logo at every width. Public service-call pricing remains absent. Generac Aligned Partner and SPAN Certified Installer are the confirmed credentials; do not imply Tesla certification or broaden dealer status. SPAN is a rare installation and must not become a headline specialty. Equipment logos are supporting information. ChargePoint is text because logo permission was not established.

Keep the owner's service copy. Bremray mainly serves residential customers, sometimes small stores and schools. It installs electrical work for spas, hot tubs, and saunas. Do not infer broader industrial work, pool/solar scope, or a referral program. Illustrative generated service images are not evidence of Bremray jobs. Panel reference photos retain their source and license links.

## Deployment

DigitalOcean App Platform builds from `main`, using `deploy/app-spec.json`. Only allowlisted public assets are copied to `_site`; templates, tests, source tools, staging, and documentation remain outside the published directory. Generated HTML is committed so the static deployment does not need a Go runtime or frontend framework. GitHub checks validate it before merging. Main automatically deploys after merge.

The Type design is the production design across the site. Earlier previews were removed and their URLs redirect to the homepage. Design history and the pre-Type site remain in Git history and tag `backup/pre-type-launch-20261020`.

After an authorized launch, verify the deployment commit, all public URLs, expected CSS, canonical tags, asset responses, and demo redirects. Confirm the homepage and request page contain the real relay endpoint without introducing the HCP embed. A real lead-delivery test requires explicit approval and is unnecessary for presentation-only changes.
