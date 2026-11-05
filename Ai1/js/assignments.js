(async function () {
  const ctx = await CampusLayout.mount();
  if (!ctx) return;
  const { api, toast, formatWhen } = CampusAPI;

  async function load() {
    const status = document.getElementById("statusFilter").value;
    const sort = document.getElementById("sortFilter").value;
    const course = document.getElementById("courseFilter").value.trim();
    const qs = new URLSearchParams({ sort, limit: "50" });
    if (status) qs.set("status", status);
    if (course) qs.set("course", course);
    try {
      const res = await api(`/api/assignments?${qs}`);
      const rows = res.data;
      document.getElementById("list").innerHTML = rows.length
        ? rows
            .map((a) => {
              const badge =
                a.computedStatus === "completed"
                  ? "ok"
                  : a.computedStatus === "overdue"
                    ? "danger"
                    : "warn";
              const action = a.completed
                ? `<button class="ghost" data-uncomplete="${a.id}">Mark incomplete</button>`
                : `<button class="primary" data-complete="${a.id}">Mark completed</button>`;
              return `<article class="card"><div class="toolbar"><span class="badge ${badge}">${a.computedStatus}</span><span class="muted">${a.courseCode} · ${a.groupCode}</span></div>
                <h3>${a.title}</h3>
                <p>${a.description || ""}</p>
                <p class="muted">Published ${formatWhen(a.publishedAt)} · Deadline ${formatWhen(a.deadline)}</p>
                ${a.attachmentUrl ? `<p><a href="${a.attachmentUrl}" target="_blank" rel="noopener">Attachment</a></p>` : ""}
                <div class="row-actions">${action}</div></article>`;
            })
            .join("")
        : `<p class="empty">No assignments match these filters.</p>`;
    } catch (err) {
      toast(err.message);
    }
  }

  document.getElementById("list").addEventListener("click", async (e) => {
    const complete = e.target.getAttribute("data-complete");
    const uncomplete = e.target.getAttribute("data-uncomplete");
    try {
      if (complete) await api(`/api/assignments/${complete}/complete`, { method: "POST", body: {} });
      if (uncomplete) await api(`/api/assignments/${uncomplete}/complete`, { method: "DELETE" });
      if (complete || uncomplete) load();
    } catch (err) {
      toast(err.message);
    }
  });

  ["statusFilter", "sortFilter", "courseFilter"].forEach((id) => {
    document.getElementById(id).addEventListener("change", load);
  });
  load();
})();
