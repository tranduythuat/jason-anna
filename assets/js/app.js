document.addEventListener("DOMContentLoaded", () => {
    let currentLang = "en";
    let currentPage = "home";
    let translations = {};

    // 🔹 Lấy param từ URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("lang")) currentLang = urlParams.get("lang");
    if (urlParams.get("page")) currentPage = urlParams.get("page");
  
    async function loadPartials() {
      document.getElementById("header").innerHTML = await fetch("partials/header.html").then(r => r.text());
      document.getElementById("footer").innerHTML = await fetch("partials/footer.html").then(r => r.text());
  
      attachEvents(); // gắn sự kiện sau khi load header/footer
    }
  
    async function loadPage(page) {
      currentPage = page;
      const html = await fetch(`partials/pages/${page}.html`).then(r => r.text());
      document.getElementById("content").innerHTML = html;
      applyTranslations();
      updateURL();
    }
  
    async function loadLanguage(lang) {
      translations = await fetch(`lang/${lang}.json`).then(r => r.json());
      currentLang = lang;
      applyTranslations();
    }
  
    function getValueByPath(obj, path) {
      return path.split('.').reduce((acc, key) => acc && acc[key], obj);
    }
  
    function applyTranslations() {
      document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        const text = getValueByPath(translations, key);
        if (text) el.textContent = text;
      });   
    }
  
    function attachEvents() {
      document.querySelectorAll("nav a").forEach(link => {
        link.addEventListener("click", e => {
          e.preventDefault();
          loadPage(link.dataset.page);
        });
      });
  
      document.querySelectorAll(".lang-switch button").forEach(btn => {
        btn.addEventListener("click", () => {
          loadLanguage(btn.dataset.lang);
          loadPage(currentPage);
        });
      });
    }

    function updateURL() {
        let params = new URLSearchParams();
      
        // chỉ thêm lang nếu khác default
        if (currentLang !== "en") {
          params.set("lang", currentLang);
        }
      
        // chỉ thêm page nếu KHÁC home
        if (currentPage !== "home") {
          params.set("page", currentPage);
        }
      
        const newUrl = params.toString()
          ? `${window.location.pathname}?${params.toString()}`
          : window.location.pathname;
      
        window.history.replaceState({}, "", newUrl);
      }
  
    // init
    loadPartials().then(() => {
      loadLanguage(currentLang).then(() => {
          loadPage(currentPage);
      });
    });
  });
  