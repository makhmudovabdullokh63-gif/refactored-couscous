(async function () {
  const ctx = await CampusLayout.mount();
  if (!ctx) return;
  const { api, toast } = CampusAPI;
  let cursor = new Date().toISOString().slice(0, 10);
  let view = "week";

  function shift(days) {
    const [y, m, d] = cursor.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d + days));
    cursor = dt.toISOString().slice(0, 10);
  }

  async function load() {
    const course = document.getElementById("courseFilter").value.trim();
    const qs = new URLSearchParams({ view, date: cursor });
    if (course) qs.set("course", course);
    try {
      const res = await api(`/api/schedule?${qs}`);
      const nextId = res.data.next && res.data.next.id;
      if (view === "week") {
        document.getElementById("rangeLabel").textContent = `Week of ${res.data.weekStart}`;
        document.getElementById("board").innerHTML = `<div class="timetable">${res.data.days
          .map((day) => {
            const body = day.classes.length
              ? day.classes
                  .map((c) => {
                    const cls = c.id === nextId ? "cls next" : "cls";
                    return `<article class="${cls}"><strong>${c.startTime}–${c.endTime}</strong><div>${c.courseCode}</div><div class="muted">${c.classroom} · ${c.building}</div></article>`;
                  })
                  .join("")
              : `<p class="empty">No classes</p>`;
            return `<div class="day-col"><h3>${day.date}</h3>${body}</div>`;
          })
          .join("")}</div>`;
      } else {
        document.getElementById("rangeLabel").textContent = cursor;
        const classes = res.data.classes || [];
        document.getElementById("board").innerHTML = classes.length
          ? `<table><thead><tr><th>Time</th><th>Course</th><th>Room</th><th>Lecturer</th></tr></thead><tbody>${classes
              .map(
                (c) =>
                  `<tr class="${c.id === nextId ? "cls next" : ""}"><td>${c.startTime}–${c.endTime}</td><td>${c.courseCode} ${c.courseName}</td><td>${c.building} ${c.classroom}</td><td>${c.lecturer}</td></tr>`
              )
              .join("")}</tbody></table>`
          : `<p class="empty">No classes scheduled for this day.</p>`;
      }
    } catch (err) {
      toast(err.message);
    }
  }

  document.getElementById("prevBtn").onclick = () => {
    shift(view === "week" ? -7 : -1);
    load();
  };
  document.getElementById("nextBtn").onclick = () => {
    shift(view === "week" ? 7 : 1);
    load();
  };
  document.getElementById("todayBtn").onclick = () => {
    cursor = new Date().toISOString().slice(0, 10);
    load();
  };
  document.getElementById("viewDay").onclick = () => {
    view = "day";
    load();
  };
  document.getElementById("viewWeek").onclick = () => {
    view = "week";
    load();
  };
  document.getElementById("courseFilter").onchange = load;
  load();
})();
