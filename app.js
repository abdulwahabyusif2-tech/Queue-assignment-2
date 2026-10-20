const vipQueue = new Queue();
const normalQueue = new Queue();
const agents = ["Abena", "Nana", "Kwesi"].map((name, i) => ({ id: i + 1, name, call: null }));
const handled = [];
let nextId = 1;

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const secs = (ms) => Math.max(0, Math.round(ms / 1000));

function addCall(caller, phone, issue, vip) {
  const call = { id: nextId++, caller, phone, issue, vip, arrived: Date.now(), answered: 0, ended: 0, agent: "" };
  (vip ? vipQueue : normalQueue).enqueue(call);
  if ($("auto").checked) dispatch();
  render();
}

function dispatch() {
  for (const agent of agents) {
    if (agent.call) continue;
    const call = vipQueue.dequeue() || normalQueue.dequeue();
    if (!call) break;
    call.answered = Date.now();
    call.agent = agent.name;
    agent.call = call;
  }
  render();
}

function endCall(agentId) {
  const agent = agents.find((a) => a.id === agentId);
  if (!agent || !agent.call) return;
  agent.call.ended = Date.now();
  handled.push(agent.call);
  agent.call = null;
  if ($("auto").checked) dispatch();
  render();
}

function queueHtml(queue) {
  const items = queue.toArray();
  if (!items.length) return '<li class="empty">No calls waiting</li>';
  return items.map((c) =>
    `<li class="${c.vip ? "vip" : ""}"><div><b>#${c.id} ${esc(c.caller)}</b>${c.vip ? '<span class="tag">VIP</span>' : ""}` +
    `<small>${esc(c.issue)}</small></div><span class="time">${secs(Date.now() - c.arrived)}s</span></li>`).join("");
}

function render() {
  $("vipList").innerHTML = queueHtml(vipQueue);
  $("normalList").innerHTML = queueHtml(normalQueue);
  $("vipCount").textContent = vipQueue.size;
  $("normalCount").textContent = normalQueue.size;

  $("agents").innerHTML = agents.map((a) => a.call
    ? `<div class="agent busy"><div class="avatar">${esc(a.name[0])}</div>` +
      `<div class="info"><b>${esc(a.name)}</b><small>#${a.call.id} ${esc(a.call.caller)} · ${secs(Date.now() - a.call.answered)}s</small></div>` +
      `<div class="side"><span class="pill">BUSY</span><button class="danger" data-end="${a.id}">End call</button></div></div>`
    : `<div class="agent free"><div class="avatar">${esc(a.name[0])}</div>` +
      `<div class="info"><b>${esc(a.name)}</b><small>Ready for the next call</small></div><span class="pill">AVAILABLE</span></div>`).join("");

  const n = handled.length;
  const avg = (f) => (n ? Math.round(handled.reduce((s, c) => s + f(c), 0) / n / 1000) : 0);
  $("sWaiting").textContent = vipQueue.size + normalQueue.size;
  $("sHandled").textContent = n;
  $("sWait").textContent = avg((c) => c.answered - c.arrived) + "s";
  $("sDur").textContent = avg((c) => c.ended - c.answered) + "s";

  $("logBody").innerHTML = n
    ? handled.slice().reverse().map((c) =>
        `<tr><td>${c.id}</td><td>${esc(c.caller)}</td><td>${esc(c.issue)}</td><td><span class="tag ${c.vip ? "" : "std"}" style="margin:0">${c.vip ? "VIP" : "Standard"}</span></td>` +
        `<td>${esc(c.agent)}</td><td>${secs(c.answered - c.arrived)}s</td><td>${secs(c.ended - c.answered)}s</td></tr>`).join("")
    : '<tr><td colspan="7" class="empty">No completed calls yet</td></tr>';
}

function exportCsv() {
  const q = (s) => `"${String(s).replace(/"/g, '""')}"`;
  const rows = [["id", "caller", "phone", "issue", "vip", "agent", "wait_sec", "duration_sec"].join(",")];
  handled.forEach((c) => rows.push([c.id, q(c.caller), q(c.phone), q(c.issue), c.vip ? "yes" : "no",
    q(c.agent), secs(c.answered - c.arrived), secs(c.ended - c.answered)].join(",")));
  const url = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: "call_log.csv" });
  a.click();
  URL.revokeObjectURL(url);
}

$("callForm").addEventListener("submit", (e) => {
  e.preventDefault();
  addCall($("name").value.trim(), $("phone").value.trim(), $("issue").value.trim(), $("vip").checked);
  e.target.reset();
  $("name").focus();
});
$("dispatchBtn").addEventListener("click", dispatch);
$("exportBtn").addEventListener("click", exportCsv);
$("agents").addEventListener("click", (e) => {
  const id = e.target.dataset.end;
  if (id) endCall(Number(id));
});
$("sampleBtn").addEventListener("click", () => {
  [["Ama Mensah", "0244000001", "Billing question", false],
   ["Kofi Boateng", "0244000002", "Network outage", true],
   ["Esi Owusu", "0244000003", "Password reset", false],
   ["Yaw Darko", "0244000004", "Cancel subscription", false],
   ["Akosua Frimpong", "0244000005", "Account locked", true]]
    .forEach((c) => addCall(...c));
});

setInterval(render, 1000);
render();
