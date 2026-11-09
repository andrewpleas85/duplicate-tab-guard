"use strict";
const $ = (id) => document.getElementById(id);
const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
const HINTS = {
  auto: "Duplicates close as soon as they appear.",
  manual: "Nothing closes by itself. Pick duplicates to merge below.",
  off: "Paused. Nothing is being closed.",
};
let groups = [];

const send = (msg) => new Promise((res) => chrome.runtime.sendMessage(msg, res));

function render(state) {
  groups = state.groups;
  for (const l of document.querySelectorAll("#modes label")) {
    l.classList.toggle("on", l.dataset.m === state.mode);
  }
  $("hint").textContent = HINTS[state.mode];
  const dups = groups.reduce((n, g) => n + g.close, 0);  // same colors as the toolbar badge
  const pill = $("pill");
  pill.hidden = state.mode === "off";
  pill.textContent = `${plural(dups, "duplicate")} open`;
  pill.className = dups > 5 ? "" : dups > 2 ? "warn" : "";
  pill.style.background = dups > 5 ? "#dc2626" : dups > 2 ? "#eab308" : "#16a34a";
  $("stats").textContent = `${plural(state.closed, "duplicate tab")} closed this browser session.`;

  const show = state.mode !== "off" && groups.length > 0;
  $("found").hidden = !show;
  $("list").replaceChildren();
  if (!show) return;
  const total = groups.reduce((n, g) => n + g.close, 0);
  $("count").textContent = `${plural(total, "duplicate tab")} open`;
  groups.forEach((g, i) => {  // textContent only: titles and URLs are untrusted
    const li = document.createElement("li");
    const cb = document.createElement("input");
    cb.type = "checkbox"; cb.checked = true; cb.dataset.i = i;
    cb.onchange = updateButton;
    const box = document.createElement("div");
    const t = document.createElement("div"); t.className = "t"; t.textContent = g.title || g.url;
    const u = document.createElement("div"); u.className = "u"; u.textContent = g.url;
    const n = document.createElement("div"); n.className = "n"; n.textContent = `${g.copies} open, ${g.close} would close`;
    box.append(t, u, n);
    li.append(cb, box);
    $("list").append(li);
  });
  updateButton();
}

const boxes = () => [...document.querySelectorAll("#list input")];
function updateButton() {
  const on = boxes().filter((b) => b.checked);
  $("merge").disabled = !on.length;
  $("all").textContent = on.length === boxes().length ? "Select none" : "Select all";
}

for (const l of document.querySelectorAll("#modes label")) {
  l.onclick = async () => render(await send({ type: "mode", mode: l.dataset.m }));
}
$("all").onclick = () => {
  const all = boxes().every((b) => b.checked);
  boxes().forEach((b) => (b.checked = !all));
  updateButton();
};
$("merge").onclick = async () => {
  const urls = boxes().filter((b) => b.checked).map((b) => groups[b.dataset.i].url);
  render(await send({ type: "clean", urls }));
};

send({ type: "state" }).then(render);
