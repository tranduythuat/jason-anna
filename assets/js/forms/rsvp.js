export default function handleContactForm() {
    const form = document.forms["rsvp-form"];
    if (!form) return;

    const params = new URLSearchParams(window.location.search);
    const lang = params.get("lang") || "en";

    const SHEET_ENDPOINTS = {
        vi: "https://script.google.com/macros/s/AKfycbxJ-habe4e_RCn0E3AtsfYoVK6cMIAckh8fdqq9d0VHrbsMowt0jPeHDDEoe__Qa2SO/exec?sheet=vi",
        en: "https://script.google.com/macros/s/AKfycbxJ-habe4e_RCn0E3AtsfYoVK6cMIAckh8fdqq9d0VHrbsMowt0jPeHDDEoe__Qa2SO/exec?sheet=en",
    };

    const sheetURL = SHEET_ENDPOINTS[lang] || SHEET_ENDPOINTS.en;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        console.log("🚀 ~ handleFormSubmit ~ data:", data);

        const {
            name: name,
            attendance: attendance,
            arrival_date: arrival_date,
            guests_number: guests_number,
            restrictions: restrictions,
            assistance: assistance,
        } = data;
        console.log("🚀 ~ handleFormSubmit 2~ data:", data);

        // Thông báo khi bắt đầu gửi
        Swal.fire({
            title: __("alert.proccesingText"),
            text: __("alert.proccesingTitle"),
            icon: "info",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        try {
            const res = await fetch(sheetURL, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    name,
                    attendance,
                    arrival_date,
                    guests_number,
                    restrictions,
                    assistance,
                }),
            });

            const result = await res.json().catch(() => ({}));
            console.log("Server response:", result);

            form.reset();

            // Thông báo thành công
            Swal.fire({
                title: __("alert.successTitle"),
                text: __("alert.successText"),
                icon: "success",
                confirmButtonText: __("alert.close"),
                confirmButtonColor: "#3f4122ff",
            });
        } catch (error) {
            console.error("Error:", error);

            // Thông báo lỗi
            Swal.fire({
                title: __("alert.errorTitle"),
                text: __("alert.errorText"),
                icon: "error",
                confirmButtonText: __("alert.retry"),
                confirmButtonColor: "#3f4122ff",
            });
        }
    });
}