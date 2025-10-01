document.addEventListener("DOMContentLoaded", () => {
    let currentLang = "en";
    let currentPage = "home";
    let translations = {};
    let aosInitialized = false;

    // đọc URL params
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("lang")) currentLang = urlParams.get("lang");
    if (urlParams.get("page")) currentPage = urlParams.get("page");

    // --- UTILS ---
    function getValueByPath(obj, path) {
        return path.split('.').reduce((acc, key) => acc && acc[key], obj);
    }

    function updateURL() {
        const params = new URLSearchParams();
        if (currentLang !== "en") params.set("lang", currentLang);
        if (currentPage !== "home") params.set("page", currentPage);
        const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
        window.history.replaceState({}, "", newUrl);
    }

    // --- i18n ---
    async function loadLanguage(lang) {
        try {
            const res = await fetch(`lang/${lang}.json`);
            if (!res.ok) throw new Error("Language file not found: " + res.status);
            translations = await res.json();
            currentLang = lang;
            applyTranslations(); // header/footer + content (nếu đã load)
        } catch (err) {
            console.error("loadLanguage error:", err);
        }
    }

    function applyTranslations() {
        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            const text = getValueByPath(translations, key);
            if (text !== undefined && text !== null) {
                // Nếu là placeholder hoặc alt thì set attribute tương ứng
                if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
                    el.setAttribute("placeholder", text);
                } else if (el.tagName === "IMG") {
                    el.setAttribute("alt", text);
                } else {
                    el.textContent = text;
                }
            }
        });

        // content/size có thể thay đổi -> cần refresh AOS
        refreshAOS();
    }

    // --- PARTIALS (header + footer) ---
    async function loadPartials() {
        try {
            const headerHtml = await fetch("partials/header.html").then(r => r.text());
            const footerHtml = await fetch("partials/footer.html").then(r => r.text());
            document.getElementById("header").innerHTML = headerHtml;
            document.getElementById("footer").innerHTML = footerHtml;
            attachHeaderEvents(); // gắn nav + lang switch
            applyTranslations(); // header vừa load, áp dụng i18n
        } catch (err) {
            console.error("loadPartials error:", err);
        }
    }

    function attachHeaderEvents() {
        // nav links
        document.querySelectorAll("nav a[data-page]").forEach(link => {
            link.addEventListener("click", e => {
                e.preventDefault();
                const page = link.dataset.page;
                loadPage(page);
            });
        });

        // lang switch
        document.querySelectorAll(".lang-switch button[data-lang]").forEach(btn => {
            btn.addEventListener("click", () => {
                const lang = btn.dataset.lang;
                // giữ page hiện tại, chỉ đổi ngôn ngữ
                loadLanguage(lang).then(() => {
                    updateURL();
                });
            });
        });
    }

    // --- PAGES ---
    async function loadPage(page) {
        try {
            currentPage = page;
            const html = await fetch(`partials/pages/${page}.html`).then(r => {
                if (!r.ok) throw new Error("Page not found: " + r.status);
                return r.text();
            });
            document.getElementById("content").innerHTML = html;
            // Áp dụng i18n cho nội dung vừa load
            applyTranslations();
            // Refresh AOS sau khi nội dung động đã vào DOM
            // refreshAOS();
            initAOS();
            // update URL (ghi lang/page)
            updateURL();
            // highlight active nav
            highlightActiveNav();
            // scroll top
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (err) {
            console.error("loadPage error:", err);
            document.getElementById("content").innerHTML = "<p>Không thể tải trang.</p>";
        }
    }

    function highlightActiveNav() {
        document.querySelectorAll("nav a[data-page]").forEach(a => {
            a.classList.toggle("active", a.dataset.page === currentPage);
        });
    }

    // --- AOS helpers ---
    function initAOS() {
        if (typeof AOS === "undefined") {
            console.warn("AOS is not loaded. Make sure aos.js is included before app.js");
            return;
        }
        if (!aosInitialized) {

            console.log('init AOS')
            AOS.init({
                duration: 700,
                once: true
            });
            aosInitialized = true;
        } else {
            // nếu đã init trước đó, chỉ refresh (khi nội dung mới được inject)
            AOS.refreshHard(); // hoặc AOS.refresh() nếu muốn nhẹ nhàng
        }
    }

    function refreshAOS() {
        // gọi defer để chắc DOM paint xong

        console.log('refreshAOS')
        setTimeout(() => {
            if (typeof AOS !== "undefined") {
                if (!aosInitialized) initAOS();
                else AOS.refresh(); // recalc offsets và attach animation
            }
        }, 50);
    }

    // --- INIT FLOW ---
    (async function init() {
        await loadPartials();
        await loadLanguage(currentLang); // load i18n trước để header footer có text
        await loadPage(currentPage);     // load page theo param/def
        initAOS(); // init AOS sau khi toàn bộ content ban đầu đã có
    })();
});
