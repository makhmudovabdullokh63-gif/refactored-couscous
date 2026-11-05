(function (global) {
  const dict = {
    en: {
      app: "CampusAI",
      tag: "University assistant",
      dashboard: "Dashboard",
      timetable: "Timetable",
      homework: "Homework",
      campus: "Campus",
      assistant: "AI assistant",
      news: "Announcements",
      profile: "Profile",
      admin: "Admin",
      logout: "Log out",
      login: "Log in",
      register: "Create account",
      welcome: "Welcome",
      nextClass: "Next class",
      today: "Today",
      upcomingHw: "Upcoming homework",
      announcements: "Announcements",
      events: "Events",
      empty: "Nothing stored for this view yet.",
      save: "Save",
      language: "Language",
      fallback: "Rule-based answer (no LLM key)",
      llm: "LLM answer grounded in university data",
    },
    ru: {
      app: "CampusAI",
      tag: "Университетский ассистент",
      dashboard: "Панель",
      timetable: "Расписание",
      homework: "Домашние задания",
      campus: "Кампус",
      assistant: "ИИ-ассистент",
      news: "Объявления",
      profile: "Профиль",
      admin: "Админ",
      logout: "Выйти",
      login: "Войти",
      register: "Регистрация",
      welcome: "Добро пожаловать",
      nextClass: "Следующее занятие",
      today: "Сегодня",
      upcomingHw: "Ближайшие задания",
      announcements: "Объявления",
      events: "События",
      empty: "В базе пока нет данных для этого раздела.",
      save: "Сохранить",
      language: "Язык",
      fallback: "Ответ по правилам (без ключа LLM)",
      llm: "Ответ модели только по данным университета",
    },
    uz: {
      app: "CampusAI",
      tag: "Universitet yordamchisi",
      dashboard: "Boshqaruv paneli",
      timetable: "Dars jadvali",
      homework: "Uy vazifalari",
      campus: "Kampus",
      assistant: "AI yordamchi",
      news: "E'lonlar",
      profile: "Profil",
      admin: "Admin",
      logout: "Chiqish",
      login: "Kirish",
      register: "Ro'yxatdan o'tish",
      welcome: "Xush kelibsiz",
      nextClass: "Keyingi dars",
      today: "Bugun",
      upcomingHw: "Yaqin vazifalar",
      announcements: "E'lonlar",
      events: "Tadbirlar",
      empty: "Bu bo'lim uchun bazada ma'lumot yo'q.",
      save: "Saqlash",
      language: "Til",
      fallback: "Qoida asosidagi javob (LLM kaliti yo'q)",
      llm: "LLM javobi faqat universitet ma'lumotlaridan",
    },
  };

  function lang() {
    return localStorage.getItem("campusai.lang") || "en";
  }

  function t(key) {
    const pack = dict[lang()] || dict.en;
    return pack[key] || dict.en[key] || key;
  }

  function setLang(next) {
    localStorage.setItem("campusai.lang", next);
  }

  global.CampusI18n = { dict, t, lang, setLang };
})(window);
