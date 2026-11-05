(async function () {
  const ctx = await CampusLayout.mount();
  if (!ctx) return;
  const { api, toast, formatWhen } = CampusAPI;
  const { t, lang } = CampusI18n;
  const box = document.getElementById("messages");

  function addBubble(role, text, meta) {
    const el = document.createElement("div");
    el.className = `bubble ${role === "user" ? "user" : "bot"}`;
    el.textContent = text;
    if (meta) {
      const m = document.createElement("div");
      m.className = "muted";
      m.style.marginTop = "8px";
      m.textContent = meta;
      el.appendChild(m);
    }
    box.appendChild(el);
    box.scrollTop = box.scrollHeight;
  }

  try {
    const status = await api("/api/ai/status");
    document.getElementById("ai-mode").textContent = status.data.llm ? t("llm") : t("fallback");
    const hist = await api("/api/ai/history");
    hist.data.forEach((m) => {
      addBubble("user", m.question, formatWhen(m.createdAt));
      addBubble("bot", m.answer, `${m.mode} · ${formatWhen(m.createdAt)}`);
    });
  } catch (err) {
    toast(err.message);
  }

  async function send(text) {
    const message = String(text || "").trim();
    if (!message) return;
    addBubble("user", message);
    document.getElementById("loading").hidden = false;
    document.getElementById("retry").dataset.last = message;
    try {
      const res = await api("/api/ai/chat", {
        method: "POST",
        body: { message, language: lang() },
      });
      const meta = `${res.data.mode === "llm" ? t("llm") : t("fallback")} · ${formatWhen(res.data.createdAt)}`;
      addBubble("bot", res.data.answer, meta);
    } catch (err) {
      addBubble("bot", `Could not reach the assistant: ${err.message}`);
      toast(err.message);
    } finally {
      document.getElementById("loading").hidden = true;
    }
  }

  document.getElementById("chat-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("prompt");
    const value = input.value;
    input.value = "";
    send(value);
  });
  document.getElementById("retry").onclick = () => send(document.getElementById("retry").dataset.last);
  document.getElementById("clear").onclick = async () => {
    try {
      await api("/api/ai/history", { method: "DELETE" });
      box.innerHTML = "";
    } catch (err) {
      toast(err.message);
    }
  };
  document.querySelectorAll("[data-suggest]").forEach((btn) => {
    btn.onclick = () => send(btn.getAttribute("data-suggest"));
  });
})();
