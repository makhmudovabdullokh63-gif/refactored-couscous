(function () {
  const { api, toast } = CampusAPI;
  const { t, lang } = CampusI18n;

  const studentNav = [
    { href: "/dashboard.html", key: "dashboard" },
    { href: "/schedule.html", key: "timetable" },
    { href: "/assignments.html", key: "homework" },
    { href: "/campus.html", key: "campus" },
    { href: "/assistant.html", key: "assistant" },
    { href: "/announcements.html", key: "news" },
    { href: "/profile.html", key: "profile" },
  ];

  function navHtml(user) {
    const items = studentNav.map((item) => {
      const active = location.pathname.endsWith(item.href) ? "active" : "";
      return `<a class="${active}" href="${item.href}">${t(item.key)}</a>`;
    });
    if (user && user.role === "admin") {
      items.push(`<a class="${location.pathname.endsWith("/admin.html") ? "active" : ""}" href="/admin.html">${t("admin")}</a>`);
    }
    return items.join("");
  }

  async function mount() {
    const root = document.getElementById("app");
    if (!root) return null;
    let me = null;
    try {
      me = await api("/api/auth/me");
    } catch (err) {
      if (err.status === 401) {
        location.href = "/login.html";
        return null;
      }
      toast(err.message);
    }
    const user = me && me.data && me.data.user;
    document.documentElement.lang = (user && user.language) || lang();
    if (user && user.language) CampusI18n.setLang(user.language);

    root.innerHTML = `
      <a class="skip-link" href="#content">Skip to content</a>
      <aside class="sidebar" id="sidebar">
        <div class="brand">
          <div class="logo" aria-hidden="true">AI</div>
          <div>
            <h1>${t("app")}</h1>
            <p>${t("tag")}</p>
          </div>
        </div>
        <nav class="nav" aria-label="Main">${navHtml(user)}</nav>
        <div style="margin-top:auto;padding:16px 8px 0">
          <p class="muted">${user ? user.name : ""}</p>
          <button class="ghost" id="logoutBtn" type="button">${t("logout")}</button>
        </div>
      </aside>
      <div class="main">
        <div class="toolbar" style="margin-bottom:12px">
          <button class="hamburger icon-btn" id="menuBtn" type="button" aria-label="Open menu">☰</button>
        </div>
        <div id="content">${root.dataset.pageContent || ""}</div>
      </div>
    `;
    const page = document.getElementById("page-template");
    if (page) {
      document.getElementById("content").innerHTML = page.innerHTML;
    }
    document.getElementById("logoutBtn").addEventListener("click", async () => {
      await api("/api/auth/logout", { method: "POST", body: {} });
      location.href = "/login.html";
    });
    document.getElementById("menuBtn").addEventListener("click", () => {
      document.getElementById("sidebar").classList.toggle("open");
    });
    return me.data;
  }

  window.CampusLayout = { mount };
})();
