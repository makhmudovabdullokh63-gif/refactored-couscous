(async function () {
  const ctx = await CampusLayout.mount();
  if (!ctx) return;
  const { api, toast, formatWhen } = CampusAPI;
  const { t } = CampusI18n;

  function esc(s) {
    return String(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }

  try {
    const res = await api("/api/dashboard");
    const d = res.data;
    document.getElementById("welcome").textContent = `${t("welcome")}, ${d.user.name}`;
    document.getElementById("today-date").textContent = `${d.now.date} ${d.now.time} (${d.now.timezone})`;
    document.getElementById("group-line").textContent = d.group ? `${d.group.name} (${d.group.code})` : "No group assigned";
    document.getElementById("uni-line").textContent = (d.university && d.university.universityName) || "CampusAI";

    const next = d.nextClass;
    document.getElementById("next-class").innerHTML = next
      ? `<p class="kpi">${esc(next.startTime)}–${esc(next.endTime)}</p>
         <p>${esc(next.courseCode)} ${esc(next.courseName)}</p>
         <p class="muted">${esc(next.building)} ${esc(next.classroom)} · ${esc(next.date)}</p>`
      : `<p class="empty">${t("empty")}</p>`;

    document.getElementById("today-list").innerHTML = d.todayClasses.length
      ? `<ul>${d.todayClasses
          .map(
            (c) =>
              `<li><strong>${esc(c.startTime)}–${esc(c.endTime)}</strong> ${esc(c.courseName)} · ${esc(c.classroom)}</li>`
          )
          .join("")}</ul>`
      : `<p class="empty">No classes today.</p>`;

    document.getElementById("hw-list").innerHTML = d.upcomingAssignments.length
      ? d.upcomingAssignments
          .map(
            (a) =>
              `<div class="cls"><strong>${esc(a.title)}</strong><div class="muted">${esc(a.courseCode)} · due ${esc(
                formatWhen(a.deadline)
              )}</div></div>`
          )
          .join("")
      : `<p class="empty">${t("empty")}</p>`;

    if (d.overdueAssignments.length) {
      document.getElementById("overdue").innerHTML = `<span class="badge danger">${d.overdueAssignments.length} overdue</span>`;
    }

    document.getElementById("ann-list").innerHTML = d.announcements.length
      ? d.announcements.map((a) => `<div class="cls"><strong>${esc(a.title)}</strong><p class="muted">${esc(a.description)}</p></div>`).join("")
      : `<p class="empty">${t("empty")}</p>`;

    document.getElementById("evt-list").innerHTML = d.events.length
      ? d.events.map((e) => `<div class="cls"><strong>${esc(e.title)}</strong><p class="muted">${esc(e.eventDate)} ${esc(e.location || "")}</p></div>`).join("")
      : `<p class="empty">${t("empty")}</p>`;
  } catch (err) {
    toast(err.message);
  }
})();
