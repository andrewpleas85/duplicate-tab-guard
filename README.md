# Duplicate Tab Guard

Private Chrome extension (Manifest V3) that keeps exactly one tab per exact URL.
Local only: permission `tabs` and nothing else, no network code, no storage, no content scripts.

## Install
1. Open `chrome://extensions`
2. Turn on **Developer mode**
3. **Load unpacked** and select this folder

It never auto-updates because it is not from the Web Store. Re-load it after editing. The welcome page only appears on a fresh install, so to see it again, remove the extension and load it again.

## Behavior
- Opening a URL that is already open (any window) closes the new tab and focuses the original.
- Navigating a tab into a URL open elsewhere closes the other copies.
- On first install, a welcome page lists the duplicates already open and asks whether to close them all, review them one by one, or leave them. The extension starts in Manual mode, so nothing else closes unless you ask.
- Clicking the toolbar icon opens a popup with three modes and a session counter:
  - **Automatic**: duplicates close as they appear.
  - **Manual** (default): nothing closes by itself. The popup lists every set of identical tabs; tick the ones to merge and click Merge selected (oldest tab of each is kept).
  - **Off**: paused. The badge shows OFF.
  - The toolbar badge shows how many duplicate tabs are open right now: green for 1-2, yellow for 3-5, red for 6 or more, grey OFF when paused. The popup shows the same number.
  - Shows how many duplicates were closed this browser session. Mode and count reset when Chrome restarts.
- Never touched: non-web pages (chrome://, chrome-extension://, about:blank, New Tab), pinned tabs, tabs with no final URL yet.
- Matching is exact (query string and hash count).
- Allow-list of hosts where duplicates are fine: `ALLOW_LIST` at the top of `background.js`.
