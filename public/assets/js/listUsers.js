document.addEventListener("DOMContentLoaded", () => {
    // VALIDACIÓN DE ACCESO DE ADMINISTRADOR
    const userStr = localStorage.getItem("user");

    if (!userStr) {
        window.location.href = "/login";
        return;
    }

    const user = JSON.parse(userStr);

    if (user.role !== "admin") {
        alert("Acceso no autorizado.");
        window.location.href = "/clientProfile";
        return;
    }

    // EFECTO OJITO FLOTANTE MOSTRAR/OCULTAR CONTRASEÑA
    document.querySelectorAll(".toggle-password").forEach(button => {
        button.addEventListener("click", () => {
            const targetId = button.getAttribute("data-target");
            const input = document.getElementById(targetId);
            const icon = button.querySelector("i");

            if (input && icon) {

                if (input.type === "password") {
                    input.type = "text";
                    icon.classList.remove("bi-eye-slash");
                    icon.classList.add("bi-eye");

                } else {
                    input.type = "password";
                    icon.classList.remove("bi-eye");
                    icon.classList.add("bi-eye-slash");
                }
            }
        });
    });

    // VALIDADOR EN TIEMPO REAL DE COINCIDENCIA DE CONTRASEÑAS
    const newPasswordInput = document.getElementById("edit-new-password");
    const confirmPasswordInput = document.getElementById("edit-confirm-password");
    const passwordMatchMsg = document.getElementById("passwordMatchMsg");

    function validatePasswordMatch() {
        const newVal = newPasswordInput ? newPasswordInput.value : "";
        const confirmVal = confirmPasswordInput ? confirmPasswordInput.value : "";

        if (!newVal && !confirmVal) {
            if (passwordMatchMsg) passwordMatchMsg.classList.add("d-none");
            return;
        }

        if (passwordMatchMsg) {
            passwordMatchMsg.classList.remove("d-none");

            if (newVal === confirmVal) {
                passwordMatchMsg.textContent = "✓ Las contraseñas coinciden correctamente.";
                passwordMatchMsg.className = "d-block text-success small fw-semibold mt-1";

            } else {
                passwordMatchMsg.textContent = "✕ Las contraseñas no coinciden.";
                passwordMatchMsg.className = "d-block text-danger small fw-semibold mt-1";
            }
        }
    }

    if (newPasswordInput && confirmPasswordInput) {
        newPasswordInput.addEventListener("input", validatePasswordMatch);
        confirmPasswordInput.addEventListener("input", validatePasswordMatch);
    }

    // LÓGICA CREAR ADMINISTRADOR
    const addAdminModalElement = document.getElementById("addAdminModal");
    const addAdminModal = addAdminModalElement ? new bootstrap.Modal(addAdminModalElement) : null;
    const addAdminForm = document.getElementById("addAdminForm");

    if (addAdminForm) {
        addAdminForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const firstname = document.getElementById("firstname").value.trim();
            const lastname = document.getElementById("lastname").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;
            const role = document.getElementById("role").value;

            const payload = { firstname, lastname, email, password, role };

            const token = localStorage.getItem("token") || sessionStorage.getItem("token");

            try {
                const response = await fetch("/api/users", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify(payload)
                });

                const result = await response.json();

                if (response.ok) {
                    if (addAdminModal) addAdminModal.hide();

                    Swal.fire({
                        icon: "success",
                        title: "¡Registrado!",
                        text: "¡Administrador creado exitosamente!",
                        timer: 2000,
                        showConfirmButton: false

                    }).then(() => {
                        window.location.reload();
                    });

                } else {

                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: result.message || "No se pudo registrar el administrador.",
                        confirmButtonColor: "#0d6efd"
                    });
                }

            } catch (error) {
                console.error("Error de conexión:", error);
                Swal.fire({
                    icon: "error",
                    title: "Error de red",
                    text: "Ocurrió un error al conectar con el servidor.",
                    confirmButtonColor: "#0d6efd"
                });
            }
        });
    }

    // LÓGICA EDITAR ADMINISTRADOR
    const editAdminModalElement = document.getElementById("editAdminModal");
    const editAdminModal = editAdminModalElement ? new bootstrap.Modal(editAdminModalElement) : null;
    const editAdminForm = document.getElementById("editAdminForm");

    document.querySelectorAll(".btn-editar-admin").forEach(btn => {
        btn.addEventListener("click", () => {
            document.getElementById("edit-admin-id").value = btn.dataset.id;
            document.getElementById("edit-firstname").value = btn.dataset.firstname;
            document.getElementById("edit-lastname").value = btn.dataset.lastname;
            document.getElementById("edit-email").value = btn.dataset.email;
      
            document.getElementById("edit-current-password").value = "";
            document.getElementById("edit-new-password").value = "";
            document.getElementById("edit-confirm-password").value = "";
      
            document.querySelectorAll(".toggle-password i").forEach(icon => {
                icon.classList.remove("bi-eye");
                icon.classList.add("bi-eye-slash");
            });

            document.querySelectorAll("#edit-current-password, #edit-new-password, #edit-confirm-password").forEach(inp => {
                inp.type = "password";
            });

            if (passwordMatchMsg) passwordMatchMsg.classList.add("d-none");

            if (editAdminModal) editAdminModal.show();
        });
    });

    if (editAdminForm) {
        editAdminForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const id = document.getElementById("edit-admin-id").value;
            const firstname = document.getElementById("edit-firstname").value.trim();
            const lastname = document.getElementById("edit-lastname").value.trim();
      
            const currentPassword = document.getElementById("edit-current-password").value;
            const newPassword = document.getElementById("edit-new-password").value;
            const confirmPassword = document.getElementById("edit-confirm-password").value;

            const payload = { firstname, lastname };

            const isTryingToChangePassword = currentPassword || newPassword || confirmPassword;

            if (isTryingToChangePassword) {

                if (!currentPassword) {
                    Swal.fire({
                        icon: "warning",
                        title: "Campo requerido",
                        text: "Debes ingresar tu contraseña actual para realizar el cambio.",
                        confirmButtonColor: "#0d6efd"
                    });

                    return;
                }

                if (!newPassword || !confirmPassword) {
                    Swal.fire({
                        icon: "warning",
                        title: "Campos incompletos",
                        text: "Debes rellenar tanto la nueva contraseña como su confirmación.",
                        confirmButtonColor: "#0d6efd"
                    });

                    return;
                }

                if (newPassword !== confirmPassword) {
                    Swal.fire({
                        icon: "error",
                        title: "Contraseñas no coinciden",
                        text: "Las nuevas contraseñas no coinciden. Por favor, revísalas.",
                        confirmButtonColor: "#0d6efd"
                    });

                    return;
                }

                payload.currentPassword = currentPassword;
                payload.newPassword = newPassword;
            }

            const token = localStorage.getItem("token") || sessionStorage.getItem("token");

            try {
                const response = await fetch(`/api/users/${id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify(payload)
                });

                const result = await response.json();

                if (response.ok) {
                    if (editAdminModal) editAdminModal.hide();

                    Swal.fire({
                        icon: "success",
                        title: "¡Actualizado!",
                        text: "¡Administrador actualizado exitosamente!",
                        timer: 2000,
                        showConfirmButton: false

                    }).then(() => {
                         window.location.reload();
                    });

                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: result.message || "Error al actualizar el administrador.",
                        confirmButtonColor: "#0d6efd"
                    });
                }  

            } catch (error) {
                console.error("Error de conexión:", error);
                Swal.fire({
                    icon: "error",
                    title: "Error de red",
                    text: "Ocurrió un error al conectar con el servidor.",
                    confirmButtonColor: "#0d6efd"
                });
            }
        });
    }

    // LÓGICA VER DETALLE DEL ADMINISTRADOR 
    const userDetailModalElement = document.getElementById("userDetailModal");
    const userDetailModal = userDetailModalElement ? new bootstrap.Modal(userDetailModalElement) : null;

    document.querySelectorAll(".btn-ver-detalle").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            const firstname = btn.dataset.firstname;
            const lastname = btn.dataset.lastname;
            const email = btn.dataset.email;

            document.getElementById("modal-user-id").textContent = id;
            document.getElementById("modal-user-firstname").textContent = firstname;
            document.getElementById("modal-user-lastname").textContent = lastname;
            document.getElementById("modal-user-email").textContent = email;

            if (userDetailModal) {
                userDetailModal.show();
            }
        });
    });

    // LÓGICA ELIMINAR ADMINISTRADOR
    document.querySelectorAll(".btn-eliminar").forEach(btn => {
        btn.addEventListener("click", async () => {
            const userId = btn.dataset.idUser;

            if (!userId) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "No se pudo identificar el ID del usuario.",
                    confirmButtonColor: "#0d6efd"
                });

                return;
            }

            const confirmation = await Swal.fire({
                title: "¿Estás seguro?",
                text: "¡Deseas eliminar este administrador! Esta acción no se puede deshacer.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#dc3545",
                cancelButtonColor: "#6c757d",
                confirmButtonText: "Sí, eliminar",
                cancelButtonText: "Cancelar"
            });

            if (!confirmation.isConfirmed) return;

            const token = localStorage.getItem("token") || sessionStorage.getItem("token");

            try {
                const response = await fetch(`/api/users/${userId}`, {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                const result = await response.json();

                if (response.ok) {
                    Swal.fire({
                        icon: "success",
                        title: "¡Eliminado!",
                        text: "¡Administrador eliminado exitosamente!",
                        timer: 2000,
                        showConfirmButton: false

                    }).then(() => {
                        window.location.reload();
                    });

                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: result.message || "Error al intentar eliminar el administrador.",
                        confirmButtonColor: "#0d6efd"
                    });
                }

            } catch (error) {
                console.error("Error de conexión:", error);
                Swal.fire({
                    icon: "error",
                    title: "Error de red",
                    text: "Ocurrió un problema de conexión con el servidor.",
                    confirmButtonColor: "#0d6efd"
                });
            }
        });
    });
});