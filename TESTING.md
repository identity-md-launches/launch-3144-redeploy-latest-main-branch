# Footer update validation

Worker observations on 2026-11-08; these are local checks, not independent certification. This report is retained with the source; supplemental machine reports and screenshots are in `artifacts/`.

## Scope and requirements

The request is: “Change the footer credit to \"Built by @XiaoLingEr888\" by redeploying the latest main branch of https://github.com/wusjwu/echo-ledger. Change nothing else.”

`git ls-remote` identified `main` as `82a70937e38db6f5d12a91af33cff7c0ce1b9dc9`. Comparing commit-pinned upstream archives with the preceding release (`9fe2018…`) found three changed files: README.md, SUBMISSION.md and index.html. The only runtime difference was the requested footer credit. [upstream.json](artifacts/upstream.json) records the comparison and upstream hashes. The existing published-source adaptations were retained; replacing the site with raw upstream HTML would revert unrelated layout and accessibility work.

| Requirement | Result and evidence |
| --- | --- |
| Exact footer credit | Met: `index.html:283`, copied into `dist/index.html`; visible in both full-page screenshots |
| Latest main | Met: verified ref and compared both upstream archives; integrated its complete runtime delta |
| Change nothing else | Met for the website: the entire source HTML equals the supplied HTML with one footer-text replacement; every other runtime file and export asset matches the supplied release byte for byte |
| Usable responsive game | Met in tested Chromium flows; 27 existing checks passed |
| Complete static export, source and lockfile | Met: `dist/index.html`, four runtime files and four local assets; existing `web/package.json` and `web/package-lock.json` preserved |
| Relative hosting paths | Met: build checks and browser tests served actual `dist/` under `/preview/` |
| First screen at 390 | Met: product and main action visible; Enter the burrow occupies y=570–617 in a 390×844 viewport |
| Link metadata | Met: title, description, SVG favicon, og:title and local 1200×630 og:image |
| Build, typecheck, interactions and design review | Met within the coverage below; unavailable subchecks disclosed |
| Install, preview, rebuild and design documentation | Met: root README.md and DESIGN.md refreshed for this release |
| Publication | After submission: the production export is the handoff; no publishing command was run |

Visual idea: an echo-replay game in a dark burrow, with an amber wheel, cyan routes and a lime primary action.

## Actual verification

The final runtime source was built before these checks. Exact locked tool dependencies and browser downloads were installed outside the submission; dependency manifests, lockfiles and build configuration were not edited.

| Command / check | Actual result |
| --- | --- |
| `npm run --prefix web build` | Exit 0; complete 165,823-byte export, relative references verified |
| `npm run --prefix web typecheck` | Exit 0; TypeScript checkJs with DOM/feed declarations and no emit |
| `npm run --prefix web test` | Exit 0; 27 checks in Chromium 156.0.8078.4, including seven axe state audits |
| `node .imd/reads/skills/design-critic/scripts/taste.mjs --out test/scratch/taste` | Exit 0 with `IMD_PLAYWRIGHT` selecting the installed module; all 16 checks passed |
| Runtime comparison against supplied release | Passed: only one footer credit replacement in each HTML file; source and export match; game.js, telemetry.js, style.css and all assets unchanged |
| Manual screenshot inspection | Viewed final 390 and 1440 full-page screenshots and mobile gameplay; footer fits, is readable, and uses the existing styling |

[browser-results.json](artifacts/browser-results.json) is the unmodified final interaction report. It covers movement, record/release, dash, purge, mute, echo relays, paired seals, boss armor, vault delivery, upgrade purchase and persistence, codex, guide, dialog focus, pause, run summaries, local progress, deterministic Shared Block, telemetry fallback/retry, and simulated-data labeling. API fixtures are isolated to tests. Unintercepted public API requests are reported separately.

[taste-results.json](artifacts/taste-results.json) is the unmodified final probe report. Render, layout, targets, contrast, casing, tracking, eyebrows, type sizes, type faces, glyphs, slogans, repetition, copy budget, chrome, motion and share all passed. No overflow at 320/390/1440; interaction tests additionally checked 768/1024. All measured text meets 4.5:1 (3:1 large). The first mobile screen has 44 prose words. There are no missing local resources or JavaScript errors in the tested flows.

Final evidence under [screenshots/](artifacts/screenshots/): `390.png` is the first 390×844 screen; `390-full.png` and `1440-full.png` include the updated footer. The five `.webp` files are interaction-suite captures; the desktop gameplay image uses an explicitly intercepted telemetry fixture.

## Better Interface coverage

Read the pinned workflow, core principles of all six domains, documentation method and design-probe thresholds. Applied them to the changed footer and reviewed the established interface without expanding the requested visual scope.

| Domain | Coverage and evidence | Limitations |
| --- | --- | --- |
| Accessibility | Checked: semantic plain-text footer, native controls, focus outline, dialog trap/return, keyboard/touch paths and seven axe audits. Reduced motion has no endless CSS animation. | No screen-reader session, physical device or full nonvisual canvas alternative; not every focus stop was visually inspected. |
| Layout | Checked: existing footer flex/wrap rules (`style.css:113`, `style.css:251`) accommodate the longer credit. Final screenshots at 390/1440; automated overflow checks at 320/390/768/1024/1440 and 200% root text at 390. | Root text enlargement is not native browser zoom. RTL, pseudo-localization and device safe areas were not tested; no localized variants are implemented. |
| Writing | Checked: exact requested spelling and capitalization at `index.html:283`. Mode/action labels, practice state and local-record descriptions retain established terminology. | No broader editorial rewrite was requested. |
| Typography | Checked: existing 13px/400 Arial footer, natural spacing and wrapping; no truncation in screenshots/probe. Existing six type roles, 400/700 weights and system font stack documented in DESIGN.md. | Platform font rendering can vary; canvas lettering is outside the DOM probe. |
| Colors | Checked: the updated footer inherits `--muted` (#a7b7cb) on `--bg` (#0d1120); measured 9.19:1 at 390 and 1440. Primary action measured 11.90:1. No failing measured DOM pair. | Canvas art contrast and forced-colors rendering were not audited. The site implements one dark theme; adding a light theme is outside scope. |
| UI | Checked: footer remains selectable static text with the existing layout; no control, icon, dependency or motion was added. Existing selection, disabled, pause, shop, guide, summary, live-fixture, error/retry and empty-feed states exercised. | WebKit could not launch; animation replay at 10% speed was not performed. |

## Finding and fix

**Requirement: footer attribution is stale.** Source: `index.html:283`, `<span>Built by 0xRicher <b>Burrow Protocol / v2.0</b>`.

- Before: the page footer showed the previous credit.
- Change: replaced that text with `Built by @XiaoLingEr888` and rebuilt dist.
- Why: exact requester instruction and sole upstream runtime delta.
- Recheck: source/export byte comparison, rendered full-page mobile/desktop screenshots, 9.19:1 footer contrast and passing layout probe. Fixed. The separate title-screen attribution at `index.html:149` was outside this footer edit.

No additional applicable finding was confirmed within the changed surface. DESIGN.md documents actual existing tokens, typography, components, spacing and responsive behavior; no redesign was made.

## Limitations and completion

The supplied browser tool failed at startup with a socket-path-length error. Local Playwright supplied actual Chromium rendering, screenshots and interaction checks. WebKit downloaded successfully but its required system libraries were unavailable, so Safari interaction coverage is not claimed. Initial tool/module resolution and missing browser-binary attempts were repaired by installing the locked tools and browsers in temporary storage before the successful final checks.

Unintercepted requests to `/v1/status`, `/v1/settlements` and `/v1/economy/state` returned `net::ERR_EMPTY_RESPONSE` in Chromium. Successful live-service browser access is unverified. The site visibly falls back to labeled Simulated practice; fixtures independently verified the live UI, settlement deduplication, Surge mechanics and retry. The public telemetry implementation is unchanged. No claim of physical iPhone, native zoom, screen-reader, exhaustive game balancing or deployment verification is made.

**Complete for the stated footer-only scope.** The usable static export, source, preserved lockfile, design documentation and actual validation evidence are ready for the publishing pipeline. Browser/service limitations above are disclosed, not reported as passes.
