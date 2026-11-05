(function (global) {
  async function api(path, options = {}) {
    const headers = Object.assign({ Accept: "application/json" }, options.headers || {});
    if (options.body && !(options.body instanceof FormData) && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }
    const res = await fetch(path, {
      credentials: "include",
      ...options,
      headers,
      body:
        options.body && !(options.body instanceof FormData) && typeof options.body !== "string"
          ? JSON.stringify(options.body)
          : options.body,
    });
    let payload = null;
    try {
      payload = await res.json();
    } catch {
      payload = null;
    }
    if (!res.ok) {
      const err = new Error((payload && payload.error) || `Request failed (${res.status})`);
      err.status = res.status;
      err.payload = payload;
      throw err;
    }
    return payload;
  }

  function toast(message, timeout = 4200) {
    let el = document.querySelector(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => {
      el.hidden = true;
    }, timeout);
  }

  function formatWhen(iso) {
    if (!iso) return "";
    return String(iso).replace("T", " ").slice(0, 16);
  }

  global.CampusAPI = { api, toast, formatWhen };
})(window);
