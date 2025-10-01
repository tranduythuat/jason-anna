document.addEventListener("DOMContentLoaded", function () {
    const lazyImages = document.querySelectorAll("img.lazy");

    if ("IntersectionObserver" in window) {
        let observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;

                    // thay data-src bằng src để browser load ảnh
                    img.src = img.dataset.src;

                    // xóa class lazy sau khi load
                    img.classList.remove("lazy");

                    // trigger AOS lại (vì ảnh mới load xong)
                    if (window.AOS) {
                        AOS.refreshHard();
                    }

                    obs.unobserve(img);
                }
            });
        }, {
            rootMargin: "100px", // preload trước khi tới viewport 100px
            threshold: 0.1
        });

        lazyImages.forEach(img => observer.observe(img));
    } else {
        // fallback: load tất cả ngay
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.classList.remove("lazy");
        });
    }
});
