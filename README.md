# Echo Ledger

Built by 0xRicher.

An original, self-contained browser game. Record a route, then let an echo replay it to power relays, distract auditors and unlock memory vaults. Salvage fragments and upgrade your courier between increasingly dangerous procedural sectors.

## Run
Open `index.html` in a modern browser, or serve this directory with any static web server:

    python3 -m http.server 8080

No build step, external libraries, account, wallet, backend, or internet connection is required. For a public deployment, upload index.html, style.css and game.js to a static website host. This package does not claim an affiliation with any platform.

## Controls
- WASD / arrows: move
- Space / R: start recording; press again to release the route
- Shift: dash (3-second cooldown)
- Esc / P: pause
- M: mute / unmute
- Touch devices: movement pad, REC, DASH and pause buttons

## How to play
Record a route through the cyan relay rings. An echo loops the recorded movement; only the echo can power a relay. Travel near the center of each ring, or linger briefly in it while recording. Relays stay powered after your echo expires. Power all relays, touch the unlocked amber vaults, and reach the green uplink at the right edge. Buy upgrades with fragments between sectors. One integrity is restored after clearing a sector.

Red auditors pursue the courier, but prefer echoes. Purple sentinels patrol until an echo enters their detection range. Hazard tiles pulse red when dangerous. Dashing briefly protects you. Pick up green fragments and red repair chips. Replay energy regenerates outside recording; a recording ends automatically after 12 seconds or when its energy runs out. Base echo life is 14 seconds. Creating a new echo replaces your oldest one unless you buy Parallel Memory upgrades.

There are six upgrade types with three levels each, eight cycling sector names, eight recovered-memory story fragments, gradually rising relay/enemy/hazard counts, randomized connected layouts and persistent local top-five scores. No ending is forced: see how deep you can reach.

## Privacy & credits
All art is drawn in Canvas/CSS and all effects are synthesized with WebAudio. System fonts only. No third-party assets, network requests, trackers or analytics. High scores and sound preferences are stored only in this browser's localStorage. Muting is available at all times. If storage is disabled, the game remains playable without persistence.

Original design and implementation for this project; no claim is made that no other game has ever explored recording or replay mechanics.
