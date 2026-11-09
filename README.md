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
- On first install, a welcome page shows how many duplicates are already open and asks whether to close them. After that, new duplicates are handled automatically.
- Clicking the toolbar icon closes all existing duplicates, keeping the oldest tab per URL.
- Never touched: non-web pages (chrome://, chrome-extension://, about:blank, New Tab), pinned tabs, tabs with no final URL yet.
- Matching is exact (query string and hash count).
- Allow-list of hosts where duplicates are fine: `ALLOW_LIST` at the top of `background.js`.
