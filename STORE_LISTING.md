# Chrome Web Store listing: Duplicate Tab Guard

Free, unlisted. Paste these into the Developer Dashboard.

**Name:** Duplicate Tab Guard

**Summary (<=132 chars, same as manifest description):**
Keeps one tab per exact URL. Local only, no network, no data collected.

**Category:** Productivity

## Detailed description

Duplicate Tab Guard keeps exactly one tab per web page.

Open a link that is already open - in any Chrome window - and the new tab closes and the existing tab is focused instead. Navigate a tab to a page that is already open somewhere else and the duplicates collapse to one. No prompts, no confirmations: it just happens.

Click the toolbar icon to clean up duplicates you already have: every tab with the same exact URL collapses to the oldest one, across all windows. A badge on the icon shows how many duplicates have been closed.

Duplicates are matched on the exact URL, including query string and hash. Pinned tabs are never closed. Gmail and Google Docs are allow-listed (multiple tabs allowed), editable in one line at the top of background.js.

Privacy: this extension runs entirely on your machine. It uses only the Chrome tabs permission - no site access, no content scripts, no storage, no network calls, no analytics, no data collected or sent anywhere. The full source is under 100 lines.

## Single-purpose statement (Privacy tab)

The extension's single purpose is to detect tabs with identical URLs and close the duplicates, focusing the tab that is kept.

## Permission justification: tabs

The tabs permission is required to list open tabs and their URLs across all Chrome windows, detect exact-URL duplicates when a tab is created or navigated, focus the tab that is kept, and close the duplicate tabs. URLs are compared in memory only. Nothing is read from page content, stored, logged, or transmitted.

## Privacy policy URL

Andrew must host PRIVACY.md at a public URL (a public GitHub repo page for this project is fine) and paste that URL into the dashboard Privacy tab. Add the developer contact email to PRIVACY.md first.
