# Duplicate Tab Guard

Private Chrome extension (Manifest V3) that keeps one tab per exact URL. Owner: Andrew. Claude builds; a separate agent, Muse, reviews before Andrew loads or uploads anything.

## Hard rules (the point of the project, do not break)
- Manifest permissions: ONLY `"tabs"`. No host_permissions, `<all_urls>`, storage, webNavigation, history, cookies, scripting.
- No network code (fetch, XMLHttpRequest, WebSocket, sendBeacon) and no http:// or https:// strings in manifest.json or background.js.
- No content scripts, no analytics, no logging of URLs. Only in-memory state.
- Plain JavaScript, no build step, no npm dependencies. background.js stays small (~90 lines now; keep under ~150).
- Free, unlisted Store listing. No payment or licensing code.
- Do not change background.js unless Andrew asks. It was not changed in the 1.1.0 packaging round.

## Files
- `manifest.json`: version 1.1.0, icons, action default_icon.
- `background.js`: all logic (144 lines, near the ~150 cap). `welcome.html/js` (install prompt) and `popup.html/js` (modes UI) are display only. `ALLOW_LIST` constant at the top (mail.google.com, docs.google.com).
- `images/make_icons.py`: pure-stdlib generator for icon16/32/48/128.png (Pillow is not installed). Run `python3 images/make_icons.py`.
- `STORE_LISTING.md`, `PRIVACY.md`: copy for the Chrome Web Store dashboard.
- `README.md`: unpacked install steps.

## Behavior summary
- New tab opening an already-open exact URL: close the new tab, focus the original and its window.
- Existing tab navigating into a duplicate: close the other copies, keep the navigated tab.
- Toolbar icon opens popup.html with modes: Automatic (rules above apply only in this mode), Manual (DEFAULT; nothing auto-closes; popup lists duplicate groups, user ticks which to merge, oldest/pinned kept), Off (badge OFF, grey). Badge = duplicate tabs open now: green 1-2, yellow 3-5, red 6+ (refreshBadge in background.js); popup shows the same number and the closed count this browser session.
- Mode and closed count are stored in the action tooltip (title "Duplicate Tab Guard (mode): N closed this session"), read back via chrome.action.getTitle when the worker wakes. No storage permission. Resets on browser restart.
- Fresh install opens welcome.html listing existing duplicates; user picks Close all, Review one by one (per-group Close/Keep), or Keep them. Extension defaults to Manual mode. Only welcome.html and popup.html may message background.js (sender.url check).
- Never touched: non-http(s) pages, pinned tabs (a pinned tab wins as keeper), tabs with no final URL, allow-listed hosts.
- Known edge: with no storage permission, the "already showed a web page" set is rebuilt when the service worker wakes. A rare wake-up race can close the original instead of the new tab (still ends with one tab).

## Status
- v1.0.0 built and committed (unpacked build Andrew runs). Browser acceptance tests (5x example.com, two windows, navigate-into-duplicate, Wikipedia Chicago vs Chicago_Bulls, two Gmail tabs, icon click with 5 pairs over 2 windows) have NOT been run; Claude cannot drive Chrome. Privacy grep was zero hits; `node --check` passes.
- v1.1.0 packaging, Part A: done = icons generated (icon128 shown to Andrew for approval, awaiting his OK), manifest changes, STORE_LISTING.md, PRIVACY.md.
- **Next, after Andrew approves the icon:** create `dist/duplicate-tab-guard-1.1.0.zip` containing ONLY manifest.json, background.js, welcome.html, welcome.js, popup.html, popup.js, images/icon16.png, icon32.png, icon48.png, icon128.png at the zip root (keep images/ folder for icons; no README/docs/.git/scripts). Then report: unzip listing with sizes, packaged manifest.json, privacy grep on packaged files (expect zero hits), `node --check background.js`. Then tell Andrew Part B is his.
- Part B (Andrew only): 1280x800 screenshot, developer registration ($5), create unlisted free listing, host PRIVACY.md publicly and add his email, then replace unpacked copy with Store install and re-test.

## Conventions
- No Co-Authored-By trailer or other attribution lines in commit messages (Andrew's call).
- Commit only when Andrew asks.
