# Verification

The current v2 release was built, typechecked, rendered and exercised in Chromium on 2026-11-08. See [artifacts/validation.md](artifacts/validation.md) for the consolidated six-domain review, actual commands, source findings/fixes and limitations.

- [Browser results](artifacts/browser-results.json): 27 passing checks; public API transport observation and WebKit limitation are explicitly separate.
- [Design probe](artifacts/taste-results.json): 16/16 passing checks.
- [Current screenshots](artifacts/screenshots/): final title, mobile controls, fixture-based gameplay and boss practice.
- [README](README.md): installation, preview, rebuild and test commands.

The direct public endpoints were reachable from an HTTP client, but Chromium returned `net::ERR_EMPTY_RESPONSE`. No successful public live-service browser check is claimed. WebKit was unavailable because system libraries were missing. Screenshots under the original root `screenshots/` belong to the previous v1 release and are retained as history.
