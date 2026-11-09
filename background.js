"use strict";
// Duplicate Tab Guard. Keeps one tab per exact URL (query and hash included).
// No network, no storage, no logging of URLs. Only state: in-memory sets, mode and count.

// Hosts where duplicate tabs are allowed. Subdomains match too. Edit by hand.
const ALLOW_LIST = ["mail.google.com", "docs.google.com"];

const MODES = ["auto", "manual", "off"];
let mode = "manual";       // manual (default): only on request. auto: close duplicates as they appear. off: nothing.
let closedCount = 0;       // duplicates closed this browser session
const webTabs = new Set(); // ids of tabs that already showed a normal web page

// Mode and count live in the toolbar button's tooltip. The browser keeps that while it
// runs, so it survives the service worker sleeping, needs no storage permission, and
// resets when the browser restarts (one browser session).
const TITLE = /^Duplicate Tab Guard \((\w+)\): (\d+) closed/;
function saveState() {
  chrome.action.setTitle({ title: `Duplicate Tab Guard (${mode}): ${closedCount} closed this session` });
  refreshBadge();
}

// Badge = duplicate tabs open right now. Green 1-2, yellow 3-5, red 6+, grey OFF when paused.
// Debounced: a burst of tab events (e.g. restoring a big session) costs one refresh.
let badgeTimer;
function refreshBadge() { clearTimeout(badgeTimer); badgeTimer = setTimeout(drawBadge, 300); }
async function drawBadge() {
  await ready;
  let n = 0;
  if (mode !== "off") for (const g of await dupGroups()) n += closable(g);
  const color = mode === "off" ? "#6b7280" : n > 5 ? "#dc2626" : n > 2 ? "#eab308" : "#16a34a";
  chrome.action.setBadgeText({ text: mode === "off" ? "OFF" : n ? String(n) : "" });
  chrome.action.setBadgeBackgroundColor({ color });
}

function parse(url) {
  try { return new URL(url); } catch { return null; }
}

// Only normal web pages. chrome://, chrome-extension://, about:blank, and the
// New Tab page are never web pages, so they are never touched.
function isWeb(url) {
  const u = parse(url);
  return !!u && (u.protocol === "https:" || u.protocol === "http:");
}

function isManaged(url) {
  if (!isWeb(url)) return false;
  const host = parse(url).hostname;
  return !ALLOW_LIST.some((h) => host === h || host.endsWith("." + h));
}

// Rebuilt whenever the service worker wakes up, so no storage permission needed.
const ready = Promise.all([chrome.tabs.query({}), chrome.action.getTitle({})]).then(([tabs, title]) => {
  for (const t of tabs) if (isWeb(t.url)) webTabs.add(t.id);
  const m = TITLE.exec(title);
  if (m && MODES.includes(m[1])) { mode = m[1]; closedCount = +m[2]; }
});

// Close every tab in `group` except the keeper. Pinned tabs are never closed,
// and an existing pinned tab is preferred as the keeper. Returns the keeper.
async function collapse(group, preferred) {
  if (group.length < 2) return group[0];
  const keeper = group.find((t) => t.pinned) || preferred;
  const doomed = group.filter((t) => t.id !== keeper.id && !t.pinned);
  await Promise.all(doomed.map((t) => chrome.tabs.remove(t.id).catch(() => {})));
  closedCount += doomed.length;
  saveState();
  return keeper;
}

async function focus(tab) {
  await chrome.tabs.update(tab.id, { active: true }).catch(() => {});
  await chrome.windows.update(tab.windowId, { focused: true }).catch(() => {});
}

chrome.tabs.onCreated.addListener(refreshBadge); // also wakes the worker early so `ready` can run

chrome.tabs.onUpdated.addListener(async (id, change) => {
  if (!change.url) return; // wait for the final URL of a loading tab
  await ready;
  const wasWeb = webTabs.has(id);
  if (isWeb(change.url)) webTabs.add(id); else webTabs.delete(id);
  if (mode !== "auto" || !isManaged(change.url)) return refreshBadge();

  const same = (await chrome.tabs.query({})).filter((t) => t.url === change.url);
  const self = same.find((t) => t.id === id);
  if (!self || same.length < 2) return refreshBadge();
  const others = same.filter((t) => t.id !== id).sort((a, b) => a.id - b.id);

  if (wasWeb) {
    // Existing tab navigated into a duplicate: keep this tab, close the others.
    await collapse(same, self);
  } else {
    // Brand new tab opened a duplicate: close it, focus the original.
    await focus(await collapse(same, others[0]));
  }
});

chrome.tabs.onRemoved.addListener((id) => { webTabs.delete(id); refreshBadge(); });

// How many tabs of a duplicate group would close (never the keeper, never pinned).
function closable(g) {
  const keeper = g.find((t) => t.pinned) || g[0];
  return g.filter((t) => t.id !== keeper.id && !t.pinned).length;
}

// Groups of exact duplicates across all windows, oldest first.
async function dupGroups() {
  await ready;
  const groups = new Map();
  for (const t of await chrome.tabs.query({})) {
    if (!isManaged(t.url)) continue;
    if (!groups.has(t.url)) groups.set(t.url, []);
    groups.get(t.url).push(t);
  }
  return [...groups.values()].filter((g) => g.length > 1).map((g) => g.sort((a, b) => a.id - b.id));
}

// Close duplicates, keeping the oldest (or a pinned tab). `urls` limits it to those pages.
async function sweep(urls) {
  for (const g of await dupGroups()) if (!urls || urls.includes(g[0].url)) await collapse(g, g[0]);
}

// Fresh install only (not updates): ask once, on a page bundled with the extension.
const WELCOME = chrome.runtime.getURL("welcome.html");
const POPUP = chrome.runtime.getURL("popup.html");
chrome.runtime.onInstalled.addListener((d) => {
  if (d.reason === "install") chrome.tabs.create({ url: WELCOME });
});

// Only our own two pages may talk to us. Every message gets the current state back.
chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  if (sender.url !== WELCOME && sender.url !== POPUP) return;
  (async () => {
    await ready;
    if (msg.type === "mode" && MODES.includes(msg.mode)) { mode = msg.mode; saveState(); }
    if (msg.type === "clean") await sweep(msg.urls);
    const groups = (await dupGroups()).map((g) => {
      const keeper = g.find((t) => t.pinned) || g[0];
      return { title: keeper.title, url: keeper.url, copies: g.length, close: closable(g) };
    });
    reply({ mode, closed: closedCount, groups: groups.filter((g) => g.close > 0) });
  })();
  return true; // reply is async
});

ready.then(refreshBadge); // badge is right after the worker wakes
