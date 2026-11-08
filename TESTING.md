# Local verification

Tested using headless Chromium through Playwright, served by Python's static HTTP server. Verification completed on November 8, 2026 (JST).

## Browser smoke tests
- Desktop: 1440 × 1100 viewport.
- Mobile emulation: 390 × 844 viewport, touch enabled.
- Opened title, field guide and About; verified creator credit.
- Simulated several seconds of keyboard movement and recording/release; verified echo creation and energy use.
- Exercised dash, pause/resume and mute.
- Exercised mobile recording and a real pointer drag with capture on the movement pad; verified courier movement.
- Mobile document has no horizontal overflow.
- Inspected title and gameplay screenshots; separately checked small-screen title content does not overlap its footer.
- Final browser runs reported zero JavaScript or console errors.

## System fixture tests
Fixtures were injected only into a test browser's intercepted JavaScript response. Production JavaScript was not modified with test cheats.
- Keyboard recording creates an echo which charges a relay and leaves it online.
- Upgrade shop purchase deducts the exact price and applies an energy capacity upgrade.
- Field guide can open over the shop and returns to the same state.
- Next-sector transition preserves the upgrade and uses its increased energy cap.
- Fatal damage opens the game-over screen and saves a local high score.
- Restart resets run-specific upgrades and sector number.
- Reload restores the saved personal best.

## Fixes during verification
- Raised field guide/About above later overlays so they remain usable from the shop and game-over screens.
- Increased relay charging speed so a clean traversal through a relay ring can activate it during one echo pass.
- Tightened local score validation.

Screenshots are in `screenshots/`. Tests are smoke/system coverage, not exhaustive difficulty balancing or a guarantee of compatibility with every browser.
