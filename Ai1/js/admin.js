(async function () {
  const ctx = await CampusLayout.mount();
  if (!ctx) return;
  const { api, toast, formatWhen } = CampusAPI;
  if (ctx.user.role !== "admin") {
    toast("Administrator access required");
    location.href = "/dashboard.html";
    return;
  }

  const state = { courses: [], groups: [], tab: "overview" };

  function showTab(name) {
    state.tab = name;
    document.querySelectorAll("[data-tab]").forEach((el) => {
      el.hidden = el.getAttribute("data-tab") !== name;
    });
    document.querySelectorAll("[data-tab-btn]").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-tab-btn") === name);
    });
  }

  async function refreshMeta() {
    const [c, g] = await Promise.all([api("/api/courses"), api("/api/groups")]);
    state.courses = c.data;
    state.groups = g.data;
    document.querySelectorAll("select[data-courses]").forEach((sel) => {
      sel.innerHTML = state.courses.map((x) => `<option value="${x.id}">${x.code} — ${x.name}</option>`).join("");
    });
    document.querySelectorAll("select[data-groups]").forEach((sel) => {
      sel.innerHTML = state.groups.map((x) => `<option value="${x.id}">${x.code}</option>`).join("");
    });
  }

  async function loadOverview() {
    const s = await api("/api/admin/stats");
    const d = s.data;
    document.getElementById("kpis").innerHTML = [
      ["Students", d.students],
      ["Courses", d.courses],
      ["Classes", d.schedules],
      ["Assignments", d.assignments],
      ["Locations", d.locations],
      ["Logins", d.logins],
      ["AI queries", d.aiQueries],
      ["Completions", d.completions],
    ]
      .map(([l, v]) => `<article class="card"><p class="muted">${l}</p><p class="kpi">${v}</p></article>`)
      .join("");
    const canvas = document.getElementById("usageChart");
    if (window.Chart && canvas) {
      if (loadOverview.chart) loadOverview.chart.destroy();
      loadOverview.chart = new Chart(canvas, {
        type: "bar",
        data: {
          labels: ["Students", "Schedules", "Homework", "AI queries", "Logins"],
          datasets: [
            {
              label: "Campus usage (demo + live)",
              data: [d.students, d.schedules, d.assignments, d.aiQueries, d.logins],
              backgroundColor: ["#3b82f6", "#8b5cf6", "#34d399", "#60a5fa", "#f59e0b"],
            },
          ],
        },
        options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } },
      });
    }
  }

  function bindCrud({ listUrl, deleteUrl, listEl, render, after }) {
    return async function () {
      const res = await api(listUrl);
      document.getElementById(listEl).innerHTML = render(res.data);
      if (after) after(res.data);
    };
  }

  const loadCourses = bindCrud({
    listUrl: "/api/admin/courses",
    listEl: "courseList",
    render: (rows) =>
      `<table><thead><tr><th>Code</th><th>Name</th><th>Lecturer</th><th></th></tr></thead><tbody>${rows
        .map(
          (r) =>
            `<tr><td>${r.code}</td><td>${r.name}</td><td>${r.lecturer}</td><td class="row-actions">
            <button class="ghost" data-edit-course='${JSON.stringify(r)}'>Edit</button>
            <button class="danger" data-del="/api/admin/courses/${r.id}">Delete</button></td></tr>`
        )
        .join("")}</tbody></table>`,
  });

  const loadSchedules = bindCrud({
    listUrl: "/api/admin/schedules",
    listEl: "scheduleList",
    render: (rows) =>
      `<div class="table-wrap"><table><thead><tr><th>Course</th><th>Group</th><th>When</th><th>Room</th><th></th></tr></thead><tbody>${rows
        .map(
          (r) =>
            `<tr><td>${r.courseCode}</td><td>${r.groupCode}</td><td>${r.recurring ? "weekday " + r.weekday : r.date} ${r.startTime}–${r.endTime}</td><td>${r.building} ${r.classroom}</td>
            <td><button class="danger" data-del="/api/admin/schedules/${r.id}">Delete</button></td></tr>`
        )
        .join("")}</tbody></table></div>`,
  });

  const loadAssignments = bindCrud({
    listUrl: "/api/admin/assignments",
    listEl: "assignmentList",
    render: (rows) =>
      rows
        .map(
          (r) =>
            `<article class="card"><div class="toolbar"><strong>${r.title}</strong><button class="danger" data-del="/api/admin/assignments/${r.id}">Delete</button></div>
            <p class="muted">${r.courseCode} · ${r.groupCode} · due ${formatWhen(r.deadline)}</p><p>${r.description || ""}</p></article>`
        )
        .join("") || "<p class='empty'>No assignments</p>",
  });

  const loadLocations = bindCrud({
    listUrl: "/api/admin/locations",
    listEl: "locationList",
    render: (rows) =>
      rows
        .map(
          (r) =>
            `<article class="card"><div class="toolbar"><strong>${r.name}</strong><button class="danger" data-del="/api/admin/locations/${r.id}">Delete</button></div>
            <p>${r.building} ${r.room || ""} · ${r.openTime || "—"}–${r.closeTime || "—"}</p></article>`
        )
        .join(""),
  });

  const loadNews = async () => {
    const [a, e] = await Promise.all([api("/api/admin/announcements"), api("/api/admin/events")]);
    document.getElementById("newsList").innerHTML = `
      <h3>Announcements</h3>
      ${a.data.map((r) => `<div class="cls"><strong>${r.title}</strong> <button class="danger" data-del="/api/admin/announcements/${r.id}">Delete</button><p class="muted">${r.description}</p></div>`).join("")}
      <h3>Events</h3>
      ${e.data.map((r) => `<div class="cls"><strong>${r.title}</strong> ${r.eventDate} <button class="danger" data-del="/api/admin/events/${r.id}">Delete</button></div>`).join("")}
    `;
  };

  const loadStudents = bindCrud({
    listUrl: "/api/admin/students",
    listEl: "studentList",
    render: (rows) =>
      `<table><thead><tr><th>Name</th><th>Email</th><th>Group</th><th></th></tr></thead><tbody>${rows
        .map(
          (r) =>
            `<tr><td>${r.name}</td><td>${r.email}</td><td>${r.groupId || ""}</td>
            <td><button class="danger" data-del="/api/admin/students/${r.id}">Remove</button></td></tr>`
        )
        .join("")}</tbody></table>`,
  });

  document.body.addEventListener("click", async (e) => {
    const tab = e.target.getAttribute("data-tab-btn");
    if (tab) showTab(tab);
    const del = e.target.getAttribute("data-del");
    if (del && confirm("Delete this record?")) {
      try {
        await api(del, { method: "DELETE" });
        toast("Deleted");
        await reloadAll();
      } catch (err) {
        toast(err.message);
      }
    }
  });

  document.getElementById("courseForm").onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api("/api/admin/courses", {
        method: "POST",
        body: { code: fd.get("code"), name: fd.get("name"), lecturer: fd.get("lecturer") },
      });
      e.target.reset();
      await refreshMeta();
      await loadCourses();
    } catch (err) {
      toast(err.message);
    }
  };

  document.getElementById("scheduleForm").onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api("/api/admin/schedules", {
        method: "POST",
        body: {
          courseId: fd.get("courseId"),
          groupId: fd.get("groupId"),
          classroom: fd.get("classroom"),
          building: fd.get("building"),
          startTime: fd.get("startTime"),
          endTime: fd.get("endTime"),
          weekday: fd.get("weekday"),
          recurring: true,
          notes: fd.get("notes"),
        },
      });
      e.target.reset();
      await loadSchedules();
    } catch (err) {
      toast(err.message);
    }
  };

  document.getElementById("assignmentForm").onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api("/api/admin/assignments", {
        method: "POST",
        body: {
          title: fd.get("title"),
          description: fd.get("description"),
          courseId: fd.get("courseId"),
          groupId: fd.get("groupId"),
          deadline: fd.get("deadline"),
        },
      });
      e.target.reset();
      await loadAssignments();
    } catch (err) {
      toast(err.message);
    }
  };

  document.getElementById("locationForm").onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api("/api/admin/locations", {
        method: "POST",
        body: Object.fromEntries(fd.entries()),
      });
      e.target.reset();
      await loadLocations();
    } catch (err) {
      toast(err.message);
    }
  };

  document.getElementById("annForm").onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api("/api/admin/announcements", { method: "POST", body: Object.fromEntries(fd.entries()) });
      e.target.reset();
      await loadNews();
    } catch (err) {
      toast(err.message);
    }
  };

  document.getElementById("eventForm").onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api("/api/admin/events", { method: "POST", body: Object.fromEntries(fd.entries()) });
      e.target.reset();
      await loadNews();
    } catch (err) {
      toast(err.message);
    }
  };

  async function importFile(url, inputId, outId) {
    const file = document.getElementById(inputId).files[0];
    if (!file) return toast("Choose a CSV file");
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await api(url, { method: "POST", body: fd });
      document.getElementById(outId).textContent = JSON.stringify(res.data, null, 2);
      await reloadAll();
    } catch (err) {
      toast(err.message);
    }
  }

  document.getElementById("importSchedules").onclick = () =>
    importFile("/api/admin/import/schedules", "schedFile", "importOut");
  document.getElementById("importAssignments").onclick = () =>
    importFile("/api/admin/import/assignments", "hwFile", "importOut");
  document.getElementById("resetDemo").onclick = async () => {
    if (!confirm("Refresh labeled demo records? Non-demo data is kept.")) return;
    try {
      await api("/api/admin/demo/reset", { method: "POST", body: {} });
      toast("Demo data reset");
      await reloadAll();
    } catch (err) {
      toast(err.message);
    }
  };

  async function reloadAll() {
    try {
      await refreshMeta();
      await loadOverview();
      await loadCourses();
      await loadSchedules();
      await loadAssignments();
      await loadLocations();
      await loadNews();
      await loadStudents();
    } catch (err) {
      toast(err.message);
    }
  }

  showTab("overview");
  reloadAll();
})();
