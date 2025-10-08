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

        applyLanguageVisibility();

        // content/size có thể thay đổi -> cần refresh AOS
        refreshAOS();
    }

    function applyLanguageVisibility() {
        document.querySelectorAll("[data-show-lang]").forEach(el => {
            const showLang = el.getAttribute("data-show-lang");
            el.style.display = (showLang === currentLang) ? "" : "none";
        });

        document.querySelectorAll("[data-hide-lang]").forEach(el => {
            const hideLang = el.getAttribute("data-hide-lang");
            el.style.display = (hideLang === currentLang) ? "none" : "";
        });
    }

    window.__ = function (key) {
        const value = getValueByPath(translations, key);
        return value !== undefined && value !== null ? value : key;
    };

    // --- PARTIALS (header + footer) ---
    async function loadPartials() {
        try {
            const headerHtml = await fetch("partials/header.html").then(r => r.text());
            const footerHtml = await fetch("partials/footer.html").then(r => r.text());
            document.getElementById("header").innerHTML = headerHtml;
            document.getElementById("footer").innerHTML = footerHtml;
            
            const urlParams = new URLSearchParams(window.location.search);
            const pageParam = urlParams.get("page");
            const bottomMenu = document.querySelector(".bottom-menu");

            console.log('pageParam', pageParam);

            // if (pageParam === "venue" || pageParam === "home" || pageParam === "album") {
            if (bottomMenu) {
                if (pageParam === "venue" || pageParam === "home" || pageParam === "album") {
                    bottomMenu.classList.add("active");
                } else {
                    bottomMenu.classList.remove("active");
                }
            }

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

            const bottomMenu = document.querySelector(".bottom-menu");
            if (bottomMenu) {
                if (currentPage === "venue" || currentPage === "home" || currentPage === "album") {
                    bottomMenu.classList.add("active");
                } else {
                    bottomMenu.classList.remove("active");
                }
            }

            if (currentPage === "rsvp") {
                import("./forms/rsvp.js").then((m) => m.default());
            }

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
                // Global settings:
                disable: false, // accepts following values: 'phone', 'tablet', 'mobile', boolean, expression or function
                startEvent: 'DOMContentLoaded', // name of the event dispatched on the document, that AOS should initialize on
                initClassName: 'aos-init', // class applied after initialization
                animatedClassName: 'aos-animate', // class applied on animation
                useClassNames: false, // if true, will add content of `data-aos` as classes on scroll
                disableMutationObserver: false, // disables automatic mutations' detections (advanced)
                debounceDelay: 50, // the delay on debounce used while resizing window (advanced)
                throttleDelay: 99, // the delay on throttle used while scrolling the page (advanced)
                
              
                // Settings that can be overridden on per-element basis, by `data-aos-*` attributes:
                offset: 120, // offset (in px) from the original trigger point
                delay: 1, // values from 0 to 3000, with step 50ms
                duration: 1000, // values from 0 to 3000, with step 50ms
                easing: 'ease', // default easing for AOS animations
                once: false, // whether animation should happen only once - while scrolling down
                mirror: false, // whether elements should animate out while scrolling past them
                anchorPlacement: 'top-bottom', // defines which position of the element regarding to window should trigger the animation
              
            });
            aosInitialized = true;
        } else {
            // nếu đã init trước đó, chỉ refresh (khi nội dung mới được inject)
            AOS.refreshHard(); // hoặc AOS.refresh() nếu muốn nhẹ nhàng
        }
    }

    function refreshAOS() {
        // gọi defer để chắc DOM paint xong
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
