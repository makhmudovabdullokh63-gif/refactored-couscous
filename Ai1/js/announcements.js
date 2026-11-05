(async function () {
  const ctx = await CampusLayout.mount();
  if (!ctx) return;
  const { api, toast, formatWhen } = CampusAPI;

  async function load() {
    const q = document.getElementById("q").value.trim();
    try {
      const [ann, ev] = await Promise.all([
        api(`/api/announcements?${new URLSearchParams(q ? { q } : {})}`),
        api(`/api/events?${new URLSearchParams(q ? { q } : {})}`),
      ]);
      document.getElementById("ann").innerHTML = ann.data.length
        ? ann.data
            .map(
              (a) => `<article class="card"><span class="badge">${a.category}</span>
              <h3>${a.title}</h3><p>${a.description}</p>
              <p class="muted">${formatWhen(a.publishedAt)}${a.location ? " · " + a.location : ""}</p>
              ${a.link ? `<p><a href="${a.link}" target="_blank" rel="noopener">Link</a></p>` : ""}</article>`
            )
            .join("")
        : `<p class="empty">No announcements.</p>`;
      document.getElementById("evt").innerHTML = ev.data.length
        ? ev.data
            .map(
              (e) => `<article class="card"><span class="badge purple">${e.category}</span>
              <h3>${e.title}</h3><p>${e.description}</p>
              <p class="muted">${e.eventDate || ""} ${e.startTime || ""} · ${e.location || ""}</p></article>`
            )
            .join("")
        : `<p class="empty">No events.</p>`;
    } catch (err) {
      toast(err.message);
    }
  }
  document.getElementById("q").addEventListener("input", () => {
    clearTimeout(load._t);
    load._t = setTimeout(load, 200);
  });
  load();
})();
