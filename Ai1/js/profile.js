(async function () {
  const ctx = await CampusLayout.mount();
  if (!ctx) return;
  const { api, toast } = CampusAPI;
  const user = ctx.user;
  document.getElementById("name").value = user.name;
  document.getElementById("email").value = user.email;
  document.getElementById("language").value = user.language || "en";
  if (ctx.group) document.getElementById("groupCode").value = ctx.group.code;

  document.getElementById("profile-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const body = {
        name: document.getElementById("name").value,
        language: document.getElementById("language").value,
        groupCode: document.getElementById("groupCode").value,
      };
      const pw = document.getElementById("password").value;
      if (pw) body.password = pw;
      await api("/api/auth/profile", { method: "PATCH", body });
      CampusI18n.setLang(body.language);
      toast("Profile saved");
      location.reload();
    } catch (err) {
      toast(err.message);
    }
  });
})();
