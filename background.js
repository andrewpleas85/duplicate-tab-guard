"use strict";
// Duplicate Tab Guard. Keeps one tab per exact URL (query and hash included).
// No network, no storage, no logging of URLs. Only state: in-memory sets/count.

// Hosts where duplicate tabs are allowed. Subdomains match too. Edit by hand.
const ALLOW_LIST = ["mail.google.com", "docs.google.com"];

let closedCount = 0;      // in-memory count of duplicates closed
const webTabs = new Set(); // ids of tabs that already showed a normal web page

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
const ready = chrome.tabs.query({}).then((tabs) => {
  for (const t of tabs) if (isWeb(t.url)) webTabs.add(t.id);
});

// Close every tab in `group` except the keeper. Pinned tabs are never closed,
// and an existing pinned tab is preferred as the keeper. Returns the keeper.
async function collapse(group, preferred) {
  if (group.length < 2) return group[0];
  const keeper = group.find((t) => t.pinned) || preferred;
  const doomed = group.filter((t) => t.id !== keeper.id && !t.pinned);
  await Promise.all(doomed.map((t) => chrome.tabs.remove(t.id).catch(() => {})));
  closedCount += doomed.length;
  chrome.action.setBadgeText({ text: closedCount ? String(closedCount) : "" });
  return keeper;
}

async function focus(tab) {
  await chrome.tabs.update(tab.id, { active: true }).catch(() => {});
  await chrome.windows.update(tab.windowId, { focused: true }).catch(() => {});
}

chrome.tabs.onCreated.addListener(() => {}); // wakes the worker early so `ready` can run

chrome.tabs.onUpdated.addListener(async (id, change) => {
  if (!change.url) return; // wait for the final URL of a loading tab
  await ready;
  const wasWeb = webTabs.has(id);
  if (isWeb(change.url)) webTabs.add(id); else webTabs.delete(id);
  if (!isManaged(change.url)) return;

  const same = (await chrome.tabs.query({})).filter((t) => t.url === change.url);
  const self = same.find((t) => t.id === id);
  if (!self || same.length < 2) return;
  const others = same.filter((t) => t.id !== id).sort((a, b) => a.id - b.id);

  if (wasWeb) {
    // Existing tab navigated into a duplicate: keep this tab, close the others.
    await collapse(same, self);
  } else {
    // Brand new tab opened a duplicate: close it, focus the original.
    await focus(await collapse(same, others[0]));
  }
});

chrome.tabs.onRemoved.addListener((id) => webTabs.delete(id));

// Toolbar icon: close all exact duplicates in all windows, keeping the oldest.
chrome.action.onClicked.addListener(async () => {
  await ready;
  const groups = new Map();
  for (const t of await chrome.tabs.query({})) {
    if (!isManaged(t.url)) continue;
    if (!groups.has(t.url)) groups.set(t.url, []);
    groups.get(t.url).push(t);
  }
  for (const g of groups.values()) {
    g.sort((a, b) => a.id - b.id);
    await collapse(g, g[0]);
  }
});
