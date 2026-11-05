(function () {
  const { api, toast } = CampusAPI;

  async function redirectIfAuthed() {
    try {
      const me = await api("/api/auth/me");
      const user = me.data.user;
      location.href = user.role === "admin" ? "/admin.html" : "/dashboard.html";
    } catch {
      /* stay */
    }
  }

  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    redirectIfAuthed();
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(loginForm);
      try {
        const res = await api("/api/auth/login", {
          method: "POST",
          body: { email: fd.get("email"), password: fd.get("password") },
        });
        location.href = res.data.user.role === "admin" ? "/admin.html" : "/dashboard.html";
      } catch (err) {
        toast(err.message);
      }
    });
  }

  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    redirectIfAuthed();
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(registerForm);
      try {
        await api("/api/auth/register", {
          method: "POST",
          body: {
            name: fd.get("name"),
            email: fd.get("email"),
            password: fd.get("password"),
            groupCode: fd.get("groupCode"),
            language: fd.get("language"),
          },
        });
        location.href = "/dashboard.html";
      } catch (err) {
        toast(err.message);
      }
    });
  }
})();
