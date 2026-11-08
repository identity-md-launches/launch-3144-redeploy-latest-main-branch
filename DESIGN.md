# Echo Ledger design system

## Overview

Echo Ledger is a keyboard and touch game about coordinating recorded routes beneath Squeektoshi’s wheel. The existing Burrow Protocol identity is retained: a dark burrow, amber wheel, cyan echo paths and a lime courier. A compact telemetry strip precedes the game; the title screen presents the two modes and one primary “Enter the burrow” action. The footer reads “Built by @XiaoLingEr888” (`index.html:283`); the separate title-surface credit reads “Built by 0xRicher”. This release changes only the footer text and rebuilds the existing export.

The source of truth is `style.css`, with structure in `index.html` and state in `game.js`. The Canvas renderer retains upstream’s three biome palettes and original gameplay geometry. This document describes the implemented source, not a proposed redesign.

## Colors

Colors use the project’s existing hex notation. Root tokens are in `style.css:1`.

| Token | Value | Implemented role |
| --- | --- | --- |
| `--bg` | `#0d1120` | Page background |
| `--panel` | `#151e30` | Telemetry, ledger receipts, dialog surfaces |
| `--surface` | `#1b293b` | Secondary buttons and key caps |
| `--white` | `#edf3f6` | Primary interface text |
| `--muted` | `#a7b7cb` | Instructions, labels and secondary text |
| `--line` | `#3e5068` | Control structure and empty meters |
| `--cyan` | `#62efdc` | Echo energy, live signal, selected state and links |
| `--lime` | `#d4fa8a` | Primary action, courier and personal best |
| `--focus` | `#d4fa8a` | Two-pixel keyboard focus outline |
| `--red` | `#ff7f9c` | Integrity and boss damage |
| `--gold` | `#ffce77` | Memory/currency, simulated signal, highlighted title |
| `--purple` | `#bc9aff` | Purge and ledger receipt details |

Supporting surfaces use `#111e30` for the title, `#111e28` for the arena, `#173b3d` for selected/live controls, `#3a3022` for simulation, and `#19393b` for messages. Primary button text is `#1a3029`; descriptive text is `#c1d0de`. These values are present in their component rules rather than a second palette.

Measured by the final rendered probe at 390: primary button text/fill 11.90:1, title text/background 14.97:1, gold title/background 11.46:1, lead/background 10.66:1, telemetry secondary text/background 8.16:1 and simulated badge 8.82:1. The updated footer uses `--muted` on `--bg` and measured 9.19:1 at both 390 and 1440. These measurements concern those DOM pairs, not every pixel of Canvas art. Live, simulated, selected and earned states include words or symbols in addition to color.

Canvas biome definitions live in `game.js` (`biomes`): copper Wheel Core, violet Mempool Tunnels and jade Settlement Vaults. The game uses hue and shape together: relay rings, vault rectangles, fragment diamonds and distinct enemy silhouettes.

## Typography

The interface uses locally available `Arial, Helvetica, sans-serif`, with weights 400 and 700. There are no font downloads. The brand mark, keyboard key caps and original Canvas labels use monospace. Font rendering and availability follow the platform’s installed system fonts.

Six role tokens are defined at the root: small 13px, label 14px, body 16px, subhead 20px, heading 32px and display 64px (rem equivalents in source). At 700px and below, display becomes 40px. Heading hierarchy is h1 for the title, h2 for dialogs/ledger, h3 for codex entries. Dialog h2 uses 32px; the ledger h2 uses 20px as secondary game context.

Body line-height is 1.5; long descriptions use 1.6. H1 is 1.06 with −0.04em tracking, and modal headings 1.1 with −0.025em. Prose and labels otherwise keep natural spacing and case. Headings balance; the title description uses pretty wrapping and a 47ch maximum. Changing numbers use tabular figures. No critical value is ellipsized. Content remains selectable except on touch movement/action surfaces. Canvas labels retain the game’s compact original art typography and are outside the DOM scale.

## Layout

The spacing reference values are 4, 8, 12, 16, 24 and 32px (`--space-*`); existing component rules use these values directly. Controls have at least a 44px minimum height. Button groups use 8–12px gaps; sections and dialog groups generally use 24px. The shell is centered with a 1460px maximum and 32px inline padding.

The title uses a 62% text column and a decorative 38% wheel/route illustration. At 900px and below the art is omitted and copy spans the surface. The play arena is centered, capped at 1180px and uses a 1000:720 ratio. At 700px and below it uses 640:800, matching the renderer’s mobile camera. Title layout uses natural content height rather than a clipped fixed-height overlay.

Implemented breakpoints:

- **1180px:** telemetry becomes one grid column; stats wrap; title wheel art becomes smaller.
- **900px:** shell padding is 20px, decorative title art disappears, score HUD is omitted, upgrades become two columns.
- **700px:** shell padding is 12px; header utilities may wrap; help uses a named “?” button; title type becomes 40px. HUD contract occupies its own row, mode/actions wrap, guide and codex become one column, summary becomes two columns, and dialogs use 12px outer margins.
- **359px:** shell padding is 8px, brand mark is omitted, title actions wrap and upgrades become one column.
- **Coarse pointers or width ≤700px:** a 94px movement pad and a two-by-two Pause/Purge/Dash/Record grid appear. Starting a mobile run scrolls the HUD, arena and touch controls into the play area.

Telemetry fields remain available on narrow screens, including projected height and supply. Ledger receipts scroll horizontally within their own region with the next receipt peeking into view; the page itself does not scroll horizontally. Dialogs scroll within the viewport; no critical action is clipped. The mobile minimap starts at canvas y=110 so it clears the overlaid mode/seed labels.

Rendered layouts were checked at 320, 390, 768, 1024 and 1440 CSS pixels, plus 200% root text at 390. This is not a claim about native 200% browser zoom or localized/RTL layouts; the game is English-only.

## Elevation & Depth

The interface uses flat tonal surfaces and structural borders without card shadows. The title illustration uses a double wheel ring and dashed echo route. Canvas retains its original glow effects.

The arena establishes an isolated stacking context. Gameplay messages use z-index 4 and title overlay 5. Modal backdrops are fixed with an almost opaque `#090e20ed` fill; dialogs use 20, with guide/codex at 21 for nested information. Background interaction is inert while a dialog is open. The skip link uses 50. There is no blur dependency for readability.

## Shapes

Shared controls use 6px corners; arena, title and telemetry use 8px; modal panels use 12px. Selection uses a cyan border and filled dark teal surface. Meters use 3px corners. Touch controls are circular/oval with generous targets. Decorative paths and the movement pad use circles; these are game-specific shapes, not general card patterns.

## Components

| Pattern | Source and use | States and behavior |
| --- | --- | --- |
| Buttons | `style.css:15`, `.primary`, `.selected` | One lime primary action per main view; neutral secondary actions; disabled, hover, active, visible focus. Hover is pointer-gated. Mode/category selection and sound expose `aria-pressed`. |
| Telemetry strip | `index.html` `.network`, `game.js` `updateNetwork()` | Explicit Live/Simulated badge, settled/projected distinction, energy effect, retry. Refresh is busy/disabled during a manual read; explicit offline practice disables it. |
| Gameplay HUD | `.hud`, `.meter`, `updateHud()` | Stable numbers, textual integrity/energy/currency, objective. Title state hides the inactive HUD. |
| Dialogs | `.modal`, `.panel`, `game.js` `syncUI()` | Guide, codex, pause, shop and summary. Named dialog semantics, focus entry/trap/return, Escape paths, inert background and scrolling. Nested guide/codex preserve the prior game state. |
| Touch actions | `.touch-controls`, pointer handlers | Captured drag movement; native click/tap actions for Record, Dash, Purge and Pause; keyboard alternatives remain available. |
| Codex | `.codex-tabs`, `.codex-card`, `renderCodex()` | Three button categories; locked, available and earned entries use labels, not color alone. |
| Upgrade grid | `.upgrade-grid`, `renderShop()` | Eight branches, three ranks; price and rank shown. Unaffordable/maxed controls are disabled without hiding their description. |
| Ledger feed | `.ledger-feed`, `.ledger-entry`, `renderLedger()` | Real receipts are external links with safe new-tab attributes. Cached receipt status remains visible. No receipts produces a plain empty-state sentence, without invented transactions. |
| Toast | `.toast`, `toast()` | Stable polite live region, 4.5-second gameplay feedback, no action embedded. Persistent network status stays in the strip. |

`assets/favicon.svg`, `assets/hamster.svg` and `assets/courier.svg` are local vectors. `assets/share.svg` is the share artwork source and `assets/share.png` is the 1200×630 runtime share card. Illustration images are decorative and have empty alt text. The game canvas has a descriptive name, keyboard instructions and objective association; it is still a visual action game, not a complete nonvisual alternative.

CSS motion is enabled only for `prefers-reduced-motion: no-preference`. Button feedback is 150ms with `cubic-bezier(.2,0,0,1)` and a 0.96 pressed scale. With reduced motion, cosmetic canvas particles/shake are suppressed, decorative rotations/bobbing freeze, and invulnerability flicker is removed. Essential game movement and hazard timing remain.

## Do’s and Don’ts

- Reuse the root palette, six type roles and `.shell` alignment. Preserve the dark burrow, amber wheel and cyan echo identity.
- Use `.primary` for the next gameplay action, `.selected` plus `aria-pressed` for selection, and neutral buttons for utilities.
- Keep directions next to their controls. Preserve settled versus projected, local versus shared progress, and real versus simulated data distinctions.
- Keep every runtime asset local and relative. Never add wallet controls, transaction flows or visitor analytics to this release.
- For another information view, reuse `.modal > .panel`, a named h2 and the existing guide/codex state handling. Add any new modal to focus/background management and validate its keyboard and touch return path.
- Do not put tracked uppercase labels above headings, nest decorative cards, or replace essential labels with color alone. Do not hide failed live data behind a fabricated “Live” state.

Design review used the pinned Better Interface guide, adapted from [Jakub Krehel’s Better Interface](https://github.com/jakubkrehel/skills/tree/267330e1adfc66a718fb65fa6918c1f06d0a689e/skills/better-interface) (MIT). The documentation method follows [Paul Bakaus’s Impeccable document reference](https://github.com/pbakaus/impeccable/blob/9d715cc4f5564a990ca8345abfdd5df6dc9b41c8/skill/reference/document.md) (Apache-2.0). Coverage and limitations are in [TESTING.md](TESTING.md), with supplemental evidence in `artifacts/`.
