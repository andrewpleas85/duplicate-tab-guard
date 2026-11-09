"use strict";
const $ = (id) => document.getElementById(id);
const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;

chrome.runtime.sendMessage({ type: "state" }, (state) => {
  const list = state.groups;
  if (!list.length) { $("msg").textContent = "No duplicate tabs found. You're all set."; return; }
  const total = list.reduce((n, g) => n + g.close, 0);
  $("msg").textContent = `You have ${plural(total, "duplicate tab")} across ${plural(list.length, "page")}. Close them now? The oldest tab of each page is kept.`;
  for (const g of list) {  // textContent only: page titles and URLs are untrusted
    const li = document.createElement("li");
    const title = document.createElement("strong");
    title.textContent = g.title || g.url;
    const url = document.createElement("div");
    url.className = "url";
    url.textContent = g.url;
    const note = document.createElement("div");
    note.className = "note";
    note.textContent = `${g.copies} open, ${g.close} would close`;
    li.append(title, url, note);
    $("list").append(li);
  }
  $("list").hidden = false;
  $("buttons").hidden = false;
});

function done(text) {
  $("buttons").hidden = true;
  $("list").hidden = true;
  $("msg").textContent = text;
}
$("yes").onclick = () => chrome.runtime.sendMessage({ type: "clean" }, () => done("Done. Duplicates closed."));
$("no").onclick = () => done("OK, existing duplicates left alone. Only new ones are blocked.");
