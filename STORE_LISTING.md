# Chrome Web Store listing: Duplicate Tab Guard

Free, unlisted. Paste these into the Developer Dashboard. Sections follow the order of a Store page: tagline, overview, key features, details, privacy.

**Name:** Duplicate Tab Guard

**Tagline:** One tab per page. Manual by default, automatic if you want. Nothing leaves your browser.

**Summary (<=132 chars, same as manifest description):**
Keeps one tab per exact URL. Local only, no network, no data collected.

**Category:** Productivity

## Detailed description (paste into the Description box)

Stop tab clutter without giving up control.

Duplicate Tab Guard shows you the duplicate tabs you have open and lets you pick which ones to merge. Want it hands-off? Switch to Automatic mode and it keeps exactly one tab per web page: open a link you already have open, in any window, and the older copy closes, so you always land on the freshest page instead of a stale one.

Tired of finding the same page open five times, in three windows, and not knowing which one is current?

KEY FEATURES

Automatic mode
Switch it on and it is hands-off. Set it and forget it. Open a page that is already open and the older copy closes and you land on the new one, even if the old copy was in another window. Navigate a tab to a page that is open elsewhere and the other copies close.

Manual mode (the default)
Nothing closes by itself. Click the toolbar icon and see every set of identical tabs, with page titles and URLs. Untick any you want to keep and click Merge selected. The newest tab of each set is kept, so you always see the latest version of a page.

Off switch
Pause everything with one click. The badge shows OFF so you always know.

Clean up on install
The first time you install it, a welcome page lists the duplicates you already have open and asks whether to close them all at once, review them one by one, or leave them alone.

Live count and stats
The toolbar badge shows how many duplicate tabs are open right now: green for 1-2, yellow for 3-5, red for 6 or more. The popup shows the same number, plus how many duplicates were closed during this browser session.

Safe by design
Pinned tabs are never closed, and a pinned tab always wins as the one to keep. Browser pages (chrome://, new tab) are never touched. Matching is on the exact URL, query string and hash included, so two different searches or two different articles are never mixed up. Gmail and Google Docs are allow-listed (multiple tabs allowed), editable in one line at the top of background.js in the source.

PRIVACY FIRST

It runs entirely on your machine. The only permission is Chrome's tabs permission, used to read tab URLs in memory so duplicates can be spotted. No site access, no content scripts, no storage, no network requests, no analytics, no accounts, no ads. No data is collected or sent anywhere. The mode and the session count are kept by the browser only until you restart it.

Free. No payment, no sign-in.

## Details (for reference)

- Version: 1.1.0
- Languages: English
- Permissions: tabs only
- Price: free

## Single-purpose statement (Privacy tab)

The extension's single purpose is to detect tabs with identical URLs and close the duplicates, focusing the tab that is kept.

## Permission justification: tabs

The tabs permission is required to list open tabs and their URLs across all Chrome windows, detect exact-URL duplicates when a tab is created or navigated, focus the tab that is kept, and close the duplicate tabs. URLs and page titles are used in memory only, and are shown only to the user in the extension's own popup and welcome page so they can choose which duplicates to close. Nothing is read from page content, stored, logged, or transmitted.

## Privacy policy URL

Andrew must host PRIVACY.md at a public URL (a public GitHub repo page for this project is fine) and paste that URL into the dashboard Privacy tab. Add the developer contact email to PRIVACY.md first.

## Screenshots to take (1280x800, up to 5)

1. The popup in Manual mode with a few duplicate sets listed.
2. The welcome page listing existing duplicates.
3. The popup showing the modes and the session count.
4. A browser window with the badge showing a count.
