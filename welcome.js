"use strict";
const $ = (id) => document.getElementById(id);
const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
const send = (msg) => new Promise((res) => chrome.runtime.sendMessage(msg, res));
let groups = [];

const total = () => groups.reduce((n, g) => n + g.close, 0);

function finish(text) {
  $("buttons").hidden = true;
  $("list").hidden = true;
  $("msg").textContent = text;
}

function summary() {
  $("msg").textContent = `You have ${plural(total(), "duplicate tab")} across ${plural(groups.length, "page")}. The newest tab of each page is kept. How do you want to handle them?`;
}

function addRow(g, oneByOne) {  // textContent only: page titles and URLs are untrusted
  const li = document.createElement("li");
  const box = document.createElement("div");
  const title = document.createElement("strong");
  title.textContent = g.title || g.url;
  const url = document.createElement("div");
  url.className = "url";
  url.textContent = g.url;
  const note = document.createElement("div");
  note.className = "note";
  note.textContent = `${g.copies} open, ${g.close} would close`;
  box.append(title, url, note);
  li.append(box);
  if (oneByOne) {
    const close = document.createElement("button");
    close.className = "primary";
    close.textContent = `Close ${g.close}`;
    const keep = document.createElement("button");
    keep.textContent = "Keep";
    const resolve = () => {
      li.remove();
      groups = groups.filter((x) => x !== g);
      if (groups.length) summary(); else finish("All reviewed.");
    };
    close.onclick = async () => { close.disabled = keep.disabled = true; await send({ type: "clean", urls: [g.url] }); resolve(); };
    keep.onclick = resolve;
    li.append(close, keep);
  }
  $("list").append(li);
}

function showList(oneByOne) {
  $("list").replaceChildren();
  groups.forEach((g) => addRow(g, oneByOne));
  $("list").hidden = false;
}

send({ type: "state" }).then((state) => {
  groups = state.groups;
  if (!groups.length) { $("msg").textContent = "No duplicate tabs found. You're all set."; return; }
  summary();
  showList(false);
  $("buttons").hidden = false;
});

$("all").onclick = async () => {
  const n = total();
  await send({ type: "clean" });
  finish(`Done. ${plural(n, "duplicate tab")} closed.`);
};
$("one").onclick = () => {
  $("buttons").hidden = true;
  showList(true);
};
$("no").onclick = () => finish("OK, your existing tabs are left alone. Duplicate Tab Guard is in Manual mode: click the toolbar icon whenever you want to merge duplicates.");
