(async function () {
  const ctx = await CampusLayout.mount();
  if (!ctx) return;
  const { api, toast } = CampusAPI;

  async function load() {
    const q = document.getElementById("q").value.trim();
    const category = document.getElementById("category").value;
    const qs = new URLSearchParams();
    if (q) qs.set("q", q);
    if (category) qs.set("category", category);
    try {
      const res = await api(`/api/locations?${qs}`);
      const items = res.data;
      document.getElementById("cards").innerHTML = items.length
        ? items
            .map(
              (l) => `<article class="card dir-card">
              <div class="toolbar"><h3>${l.name}</h3><span class="badge">${l.category}</span></div>
              <p>${l.building}${l.room ? `, room ${l.room}` : ""} · floor ${l.floor || "—"}</p>
              <p class="muted">${l.openTime && l.closeTime ? `${l.openTime}–${l.closeTime}` : "Hours not listed"}</p>
              <p>${l.description || ""}</p>
              <p><strong>Directions:</strong> ${l.directions || "Ask at the main gate."}</p>
              ${l.mapUrl ? `<p><a href="${l.mapUrl}" target="_blank" rel="noopener">External map link</a></p>` : ""}
            </article>`
            )
            .join("")
        : `<p class="empty">No matching campus locations.</p>`;
    } catch (err) {
      toast(err.message);
    }
  }

  document.getElementById("searchBtn").onclick = load;
  document.getElementById("q").addEventListener("keydown", (e) => {
    if (e.key === "Enter") load();
  });
  document.getElementById("category").onchange = load;
  load();
})();
