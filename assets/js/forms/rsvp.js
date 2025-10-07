export default function handleContactForm() {
    const form = document.forms["rsvpForm"];
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const form = e.target;
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            console.log("🚀 ~ handleFormSubmit ~ data:", data);

            const {
                name: name,
                attendance: confirm,
                message: message,
            } = data;
            console.log("🚀 ~ handleFormSubmit 2~ data:", data);

            // Thông báo khi bắt đầu gửi
            Swal.fire({
                title: "Đang gửi /Sending/...",
                text: "Vui lòng chờ trong giây lát /Please wait a moment/",
                icon: "info",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const url = "";

            try {
                const res = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams({
                        name,
                        confirm,
                        message,
                    }),
                });

                const result = await res.json().catch(() => ({}));
                console.log("Server response:", result);

                form.reset();

                // Thông báo thành công
                Swal.fire({
                    title: "Thành công /Success/!",
                    text: "Cảm ơn bạn đã gửi phản hồi, thông tin đã được gửi đến dâu rể rồi nha /Thank you for your feedback, the information has been sent to the bride and groom./",
                    icon: "success",
                    confirmButtonText: "OK",
                    confirmButtonColor: "#3f4122ff",
                });
            } catch (error) {
                console.error("Error:", error);

                // Thông báo lỗi
                Swal.fire({
                    title: "Lỗi!",
                    text: "OPPS! Đã xảy ra lỗi: " + error.message,
                    icon: "error",
                    confirmButtonText: "Thử lại",
                    confirmButtonColor: "#3f4122ff",
                });
            }
        });
    }
}
