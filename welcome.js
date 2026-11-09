"use strict";
const $ = (id) => document.getElementById(id);

chrome.runtime.sendMessage("count", (n) => {
  if (!n) { $("msg").textContent = "No duplicate tabs found. You're all set."; return; }
  $("msg").textContent = `You already have ${n} duplicate tab${n === 1 ? "" : "s"} open. Close ${n === 1 ? "it" : "them"} now? The oldest tab of each page is kept.`;
  $("buttons").hidden = false;
});

$("yes").onclick = () => chrome.runtime.sendMessage("clean", () => {
  $("buttons").hidden = true;
  $("msg").textContent = "Done. Duplicates closed.";
});
$("no").onclick = () => {
  $("buttons").hidden = true;
  $("msg").textContent = "OK, existing duplicates left alone. Only new ones are blocked.";
};
