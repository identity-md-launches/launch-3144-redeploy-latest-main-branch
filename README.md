# Echo Ledger: Burrow Protocol

**Built by 0xRicher.** A Squeekchain Genesis community game; not officially affiliated.

This static release updates the existing site to [upstream main at `9fe2018604e4462836198e13da282286f52bc6ac`](https://github.com/wusjwu/echo-ledger/commit/9fe2018604e4462836198e13da282286f52bc6ac), the v2 Burrow Protocol release. The original Canvas, CSS and JavaScript stack is retained. `telemetry.js` is included unchanged from that commit. Interface changes improve mobile controls, readable type, dialog focus, reduced motion and link previews.

The complete production site is in **`dist/`**. Serve its contents together, including `dist/assets/`. All local asset URLs are relative (`./…`), and the release was tested under `/preview/`. No server rewrites, build service, wallet, account or private credentials are needed. Publication of this export happens outside this repository task.

## Install, build and preview

Use Node.js 20 or newer and npm. From the repository root:

```sh
npm ci --prefix web
npm run --prefix web typecheck
npm run --prefix web build
npm run --prefix web preview
```

Open **http://127.0.0.1:4173/preview/**. Stop the preview with Ctrl+C. An optional port is accepted: `npm run --prefix web preview -- 8080`.

The build copies the four runtime source files and local assets into a clean `dist/`, then checks relative references. There are no runtime npm dependencies, CDNs, fonts or remote artwork. Tool dependencies and their exact versions are in `web/package.json` and `web/package-lock.json`; generated dependencies are not part of the deliverable. To preview without Node, serve `dist/` using any static HTTP server.

## Play

Record a route through cyan relays, release an echo, recover amber memory vaults, and reach the green uplink. Only echoes power relays. Standing on a relay while making a short recording is useful. Two echoes can hold different seals simultaneously; every fifth sector pits them against the Auditor General’s three armor plates.

| Action | Keyboard | Touch |
| --- | --- | --- |
| Move | WASD / arrows | Drag the movement pad |
| Record / release | R / Space | Record / Release |
| Dash | Shift | Dash |
| Purge nearby threats | E | Purge |
| Pause / resume | P / Escape | Pause, then Resume |
| Codex | C | Codex or Open codex |
| Sound | M | Sound on / off |

Sound starts muted. Losing focus pauses the game. Dialogs hold keyboard focus and return it when closed. Guide and codex actions remain available from pause and the workbench.

All v2 content is retained: three rotating biomes; five ordinary enemy types plus the Auditor General; six pickup types; eight upgrade branches with three ranks; nine codex chapters, six threat entries and twelve achievements; Story and Shared Block modes; local records and run summaries. Recording costs 6 energy upfront plus 6 per second, lasts at most 10 seconds, and produces a base 32-second echo. Shared Block uses settled height plus the Tokyo date; it is a local deterministic challenge, not multiplayer or a shared leaderboard.

## Squeekchain public data

`telemetry.js` reads these public endpoints directly, using CORS and omitting credentials:

- [Status](https://api.squeekchain.com/v1/status): wheel activity/RPM boosts regeneration; new work and settled height provide energy; real distance unlocks lore and a vault-score bonus.
- [Settlements](https://api.squeekchain.com/v1/settlements): newly observed safe/confirmed/finalized receipts can trigger 12-second Settlement Surges. Initial history is a baseline and receipt IDs are deduplicated. Receipt links open Sepolia Etherscan.
- [Economy](https://api.squeekchain.com/v1/economy/state): public SQK supply context.

Status and settlements poll every 10 seconds; economy every 30 seconds. Requests time out after 7 seconds. Stale hardware, failed requests or a 22-second heartbeat timeout switch to **Simulated** practice. Cached receipts are labeled **Cached**. Simulated surges occur every 45 seconds, never create transaction links, and never award real-distance unlocks. Settled and projected heights remain distinct. Refresh retries public reads; explicit offline practice disables refresh.

Game SQK is fictional, cannot be redeemed and is unrelated to a wallet balance. No wallet discovery, connection, signatures, transactions or chain writes are implemented. Local storage holds scores, lore, achievements and sound preference; if storage is unavailable, play continues without persistence. “Telemetry” here means public wheel data, not visitor tracking or analytics.

## Verification

Actual worker checks on 2026-11-08:

| Check | Result |
| --- | --- |
| `npm run --prefix web build` | Passed; complete relative static export |
| `npm run --prefix web typecheck` | Passed; TypeScript `checkJs`, DOM and feed declarations, no emit |
| `npm run --prefix web test` | Passed; 27 Chromium browser checks, including 7 axe state audits |
| Pinned `taste.mjs --out test/scratch/taste` | 16/16 checks passed at 320, 390 and 1440 wide |
| Additional layout checks | No page overflow at 768/1024 or with 200% root text at 390 |
| First 390×844 screen | Product title visible; Enter the burrow spans y=654–701 |

The browser suite serves the **production export at a subpath**, and exercises keyboard and touch input, echo puzzles, paired seals, boss defeat, vault delivery, upgrade purchase/persistence, codex tabs, pause/focus, summaries, local records, Shared Block, fallback and retry. It also makes separate, unintercepted public API observations. It never presents fixture tests as successful live service access.

To run it locally after installing browser binaries:

```sh
npm exec --prefix web -- playwright install chromium webkit
npm run --prefix web test
```

Results and temporary screenshots go to `test/scratch/browser-checks/`. The committed worker evidence is [artifacts/validation.md](artifacts/validation.md), [browser-results.json](artifacts/browser-results.json), [taste-results.json](artifacts/taste-results.json) and [screenshots](artifacts/screenshots/). [DESIGN.md](DESIGN.md) records the final implementation.

**Limitations:** direct public API requests returned HTTP 200 with permissive CORS headers in an HTTP client, but Chromium requests returned `net::ERR_EMPTY_RESPONSE` here. Live-service browser access therefore remains unverified; isolated API fixtures verified its UI and gameplay behavior. The supplied browser tool failed to launch, so local Playwright supplied Chromium rendering and interaction evidence. WebKit could not run because required system libraries were missing. No physical iPhone, screen reader, native browser zoom, exhaustive difficulty balance or full nonvisual canvas accessibility is claimed. See validation for details.

## Diagnostics and source

- `?offline=1` skips public requests and explicitly selects practice.
- `?sector=5` opens a boss practice run; sector practice does not enter records or earn achievements.
- `?test=1` enables upstream debug helpers for test-only teleport, protection, fragments and practice Surges. These runs are unranked. Helpers are absent on ordinary URLs.
- `window.echoLedger.snapshot()` and `window.squeekFeed.snapshot()` return diagnostic copies.

Runtime source: `index.html`, `style.css`, `game.js`, `telemetry.js`, `assets/`. Build and tool configuration: `web/`. Repeatable interaction checks: `tests/interactions.mjs`. Source provenance: [artifacts/upstream.json](artifacts/upstream.json). Earlier v1 screenshots under `screenshots/` are historical; current v2 evidence is under `artifacts/screenshots/`.

Game and creator credit are from [wusjwu/echo-ledger](https://github.com/wusjwu/echo-ledger). The hamster-powered protocol premise and public data come from [Squeekchain](https://squeekchain.com) and [Squeekchain Genesis](https://squeekchain.com/genesis/code). Burrow narrative is community fiction.
