document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    const formAlert = document.getElementById("formAlert");
    const formAlertText = document.getElementById("formAlertText");

    let alertTimeout = null;

    registerForm?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const firstname = document.getElementById("firstname")?.value.trim();
        const lastname = document.getElementById("lastname")?.value.trim();
        const email = document.getElementById("email")?.value.trim();
        const password = document.getElementById("password")?.value.trim();
        const submitBtn = registerForm.querySelector("button[type='submit']");

        // LIMPIA CUALQUIER TEMPORIZADOR ANTERIOR
        if (alertTimeout) clearTimeout(alertTimeout);
        formAlert?.classList.add("d-none");

        if (!firstname || !lastname || !email || !password) {
            formAlertText.textContent = "Debes completar todos los campos.";
            formAlert?.classList.remove("d-none");

            alertTimeout = setTimeout(() => {
                formAlert?.classList.add("d-none");
            }, 4000);

            return;
        }

        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status"></span>Registrando...`;

            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ firstname, lastname, email, password }),
            });

            const result = await response.json();

            if (response.ok) {
                Swal.fire({
                    icon: "success",
                    title: "¡Cuenta creada!",
                    text: "Te has registrado exitosamente. Redirigiendo al inicio de sesión...",
                    timer: 2000,
                    showConfirmButton: false,

                }).then(() => {
                    window.location.href = "/login";
                });

            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error de registro",
                    text: result.message || "No se pudo registrar la cuenta.",
                    confirmButtonColor: "#198754",
                });

                submitBtn.disabled = false;
                submitBtn.innerHTML = `<span>Registrarse</span><i class="bi bi-check-circle ms-1 fs-5 align-middle"></i>`;
            }

        } catch (error) {
            console.error("Error en el registro:", error);
            Swal.fire({
                icon: "error",
                title: "Error de conexión",
                text: "Ocurrió un problema de conexión con el servidor.",
                confirmButtonColor: "#198754",
            });

            submitBtn.disabled = false;
            submitBtn.innerHTML = `<span>Registrarse</span><i class="bi bi-check-circle ms-1 fs-5 align-middle"></i>`;
        }
    });
});