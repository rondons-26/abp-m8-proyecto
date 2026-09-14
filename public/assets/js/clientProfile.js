document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "/login";
        return;
    }

    let user = {};

    try {
        // PIDE SIEMPRE LOS DATOS AL SERVIDOR
        const res = await fetch("/api/users/profile", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const data = await res.json();
        if (res.ok && data.user) {
            user = data.user;
            localStorage.setItem("user", JSON.stringify(user));

        } else {
            throw new Error("No se pudo obtener el perfil");
        }

    } catch (err) {
        console.error("Error al sincronizar perfil:", err);
        const userStr = localStorage.getItem("user");

        if (!userStr) {
            window.location.href = "/login";
            return;
        }

        user = JSON.parse(userStr);
    }

    window.currentUserId = user._id || user.id;

    // CARGA DATOS BASICOS DEL CLIENTE
    const fullName = `${user.firstname || user.name || ""} ${user.lastname || ""}`.trim();
    document.getElementById("cardName").textContent = fullName || "Usuario";
    document.getElementById("cardEmail").textContent = user.email || "";
    document.getElementById("cardRole").textContent = (user.role || "cliente").toUpperCase();

    // PRECARGA INPUTS EDITAR INFORMACIÓN
    const inputFirstname = document.getElementById("inputFirstname");
    const inputLastname = document.getElementById("inputLastname");
    const inputEmail = document.getElementById("inputEmail");
    const inputRut = document.getElementById("inputRut");
    const inputPhone = document.getElementById("inputPhone");
    const inputRegion = document.getElementById("inputRegion");
    const inputCommune = document.getElementById("inputCommune");
    const inputAddress = document.getElementById("inputAddress");
    const inputRole = document.getElementById("inputRole");

    if (inputFirstname) inputFirstname.value = user.firstname || user.name || "";
    if (inputLastname) inputLastname.value = user.lastname || "";
    if (inputEmail) inputEmail.value = user.email || "";
  
    // LÓGICA BLOQUEO RUT SI YA ESTÁ REGISTRADO
     if (inputRut) {
        inputRut.value = user.rut || "";

        if (user.rut && user.rut.trim().length > 5) {
            inputRut.disabled = true;
            inputRut.classList.add("bg-light");
            inputRut.title = "El RUT ya se encuentra registrado y no se puede modificar.";
        }
    }

    if (inputPhone) inputPhone.value = user.phone || "";
    if (inputRegion) inputRegion.value = user.region || "";
    if (inputCommune) inputCommune.value = user.commune || "";
    if (inputAddress) inputAddress.value = user.address || "";
    if (inputRole) inputRole.value = user.role === "admin" ? "Administrador" : "Cliente Comercial";

    // MANEJO AVATAR INICIAL
    const avatarImg = document.getElementById("profileAvatarImg");
    const defaultIcon = document.getElementById("defaultAvatarIcon");

    if (user.profileImage) {
        if (avatarImg && defaultIcon) {
            avatarImg.src = user.profileImage;
            avatarImg.classList.remove("d-none");
            defaultIcon.classList.add("d-none");
        }
    }

    const avatarContainer = document.getElementById("avatarContainer");
    const hiddenAvatarInput = document.getElementById("hiddenAvatarInput");

    if (avatarContainer && hiddenAvatarInput) {
        avatarContainer.addEventListener("click", () => hiddenAvatarInput.click());
    
        hiddenAvatarInput.addEventListener("change", async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();

            reader.onload = (uploadEvent) => {
                avatarImg.src = uploadEvent.target.result;
                avatarImg.classList.remove("d-none");
                if (defaultIcon) defaultIcon.classList.add("d-none");
            };

            reader.readAsDataURL(file);

            const formData = new FormData();
            formData.append("profileImage", file);

            try {
                const res = await fetch("/api/users/profile", {
                    method: "PUT",
                    headers: { "Authorization": `Bearer ${token}` },
                    body: formData
                });

                const data = await res.json();

                if (res.ok) {
                    if (data.user) {
                        localStorage.setItem("user", JSON.stringify(data.user));
                    }

                    Swal.fire({
                        icon: "success",
                        title: "¡Foto Actualizada!",
                        text: "Tu imagen de perfil se cambió con éxito.",
                        timer: 1500,
                        showConfirmButton: false
                    });

                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: data.message || "Error al subir la foto de perfil."
                    });
                }

            } catch (err) {
                console.error("Error de red:", err);
                Swal.fire({
                    icon: "error",
                    title: "Error de red",
                    text: "Error de conexión al intentar actualizar la foto."
                });
            }
        });
    }

    // PESTAÑAS
    const tabButtons = document.querySelectorAll("#profileTabs button");

    tabButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            tabButtons.forEach(b => b.classList.remove("border-bottom", "border-2", "border-primary", "text-dark"));
            e.target.classList.add("border-bottom", "border-2", "border-primary", "text-dark");
        });
    });

    // ORDENES DE COMPRA CLIENTE
    const ordersContainer = document.getElementById("ordersContainer");

    try {
        const response = await fetch("/api/orders/my-orders", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
            const result = await response.json();
            const orders = result.data || [];

            if (orders.length === 0) {
                ordersContainer.innerHTML = `
                    <div class="text-center py-4">
                        <i class="bi bi-receipt display-4 text-muted"></i>
                        <p class="text-muted mt-2">Aún no has realizado ninguna compra.</p>
                        <a href="/shop" class="btn btn-sm btn-primary rounded-3">Explorar Tienda</a>
                    </div>
                `;

            } else {
                let html = `
                    <div class="table-responsive">
                        <table class="table table-hover align-middle">
                            <thead class="table-light">
                                <tr>
                                    <th>N° Orden</th>
                                    <th>Fecha</th>
                                    <th>Total</th>
                                    <th>Estado</th>
                                    <th class="text-end">Acciones</th>
                                </tr>
                            </thead>
                        <tbody>
                `;

                orders.forEach((order, index) => {
                    const dateFormatted = new Date(order.createdAt).toLocaleDateString("es-CL", {
                        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                    });

                    let badgeClass = "bg-secondary bg-opacity-10 text-secondary";
                    if (order.status === "Enviado") badgeClass = "bg-info bg-opacity-10 text-info";
                    if (order.status === "Entregado") badgeClass = "bg-success bg-opacity-10 text-success";
                    if (order.status === "Procesando") badgeClass = "bg-warning bg-opacity-10 text-warning";

                    html += `
                        <tr>
                            <td class="fw-bold text-primary">#${order.orderNumber}</td>
                            <td class="text-muted small">${dateFormatted}</td>
                            <td class="fw-semibold">$${Number(order.totalAmount).toLocaleString("es-CL")}</td>
                            <td><span class="badge ${badgeClass} px-2 py-1">${order.status}</span></td>
                            <td class="text-end">
                                <button class="btn btn-sm btn-outline-primary rounded-3 px-3" data-bs-toggle="modal" data-bs-target="#orderModal${index}">
                                    <i class="bi bi-eye me-1"></i> Ver
                                </button>
                            </td>
                        </tr>`;
                });

                html += `</tbody></table></div>`;

                orders.forEach((order, index) => {
                    const dateFormatted = new Date(order.createdAt).toLocaleDateString("es-CL", {
                        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                    });

                    const hasTracking = order.status === "Enviado" || order.status === "Entregado";
                    const trackingNumberVal = order.trackingNumber || "Sin número registrado";

                    let itemsHtml = order.items.map(i => `
                        <tr>
                            <td class="ps-2 py-2">
                                <span class="fw-semibold text-dark d-block text-truncate" style="max-width: 180px;">${i.product}</span>
                                <span class="badge bg-light text-secondary border font-monospace px-1 py-0" style="font-size: 0.65rem;">
                                    ${i.sku || 'SKU-N/D'}
                                </span>
                            </td>
                            <td class="text-center py-2 text-muted">${i.quantity} u.</td>
                            <td class="text-end pe-2 py-2 fw-bold text-dark">$${Number(i.amount).toLocaleString("es-CL")}</td>
                        </tr>
                    `).join("");

                    html += `
                    <div class="modal fade" id="orderModal${index}" tabindex="-1" aria-hidden="true">
                        <div class="modal-dialog modal-xl modal-dialog-centered">
                            <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                          
                                <div class="modal-header bg-light border-bottom px-4 py-3">
                                    <div>
                                        <h5 class="fw-bold text-dark mb-0"><i class="bi bi-box-seam me-2 text-primary"></i>Detalle de la Orden #${order.orderNumber}</h5>
                                        <small class="text-muted">Realizada el ${dateFormatted}</small>
                                    </div>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>

                                <div class="modal-body p-4 bg-light bg-opacity-50">
                                    <div class="row g-4">
                                        <div class="col-lg-5">
                                            <div class="d-flex flex-column gap-3">
                                                <div class="card border-0 shadow-sm rounded-4 p-3 bg-white">
                                                    <h6 class="fw-bold text-dark mb-3"><i class="bi bi-info-circle me-2 text-primary"></i>Estado General</h6>
                                                    <div class="row g-2">
                                                        <div class="col-6">
                                                            <span class="text-muted small d-block">Estado del Pedido</span>
                                                            <span class="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle px-2 py-1 mt-1">
                                                                ${order.status}
                                                            </span>
                                                        </div>
                                                        <div class="col-6">
                                                            <span class="text-muted small d-block">Pago</span>
                                                            <span class="badge bg-success bg-opacity-10 text-success border border-success-subtle px-2 py-1 mt-1">
                                                                Completado
                                                            </span>
                                                        </div>
                                                    </div>

                                                    ${hasTracking ? `
                                                        <div class="mt-3 pt-3 border-top">
                                                            <label class="form-label text-muted small fw-bold mb-1">
                                                                <i class="bi bi-truck me-1"></i> Número de Seguimiento
                                                            </label>
                                                            <div class="input-group input-group-sm">
                                                                <input type="text" class="form-control bg-light font-monospace text-primary fw-bold" value="${trackingNumberVal}" disabled>
                                                                <span class="input-group-text bg-white text-muted"><i class="bi bi-shield-check"></i></span>
                                                            </div>
                                                            <small class="text-muted d-block mt-1" style="font-size: 0.75rem;">
                                                                ${order.status === 'Entregado' ? 'Este pedido ya ha sido entregado exitosamente.' : 'Tu paquete está en camino.'}
                                                            </small>
                                                        </div>
                                                        ` : `
                                                        <div class="mt-3 pt-3 border-top">
                                                            <span class="text-muted small d-block">Número de Seguimiento</span>
                                                            <span class="badge bg-secondary bg-opacity-10 text-secondary border px-2 py-1 mt-1">
                                                                Se asignará al despachar
                                                            </span>
                                                        </div>
                                                    `}
                                                </div>

                                                <div class="card border-0 shadow-sm rounded-4 p-3 bg-primary text-white">
                                                    <div class="d-flex justify-content-between align-items-center">
                                                        <span class="opacity-75 small fw-bold">Monto Total Pagado</span>
                                                        <h4 class="fw-bold mb-0">$${Number(order.totalAmount).toLocaleString("es-CL")}</h4>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="col-lg-7">
                                            <div class="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
                                                <div class="d-flex justify-content-between align-items-center mb-3">
                                                    <h6 class="fw-bold text-dark mb-0">
                                                        <i class="bi bi-basket me-2 text-primary"></i>Productos Comprados 
                                                        <span class="badge bg-light text-secondary border ms-1">${order.items.length}</span>
                                                    </h6>
                                                    <small class="text-muted">Desglose de artículos</small>
                                                </div>

                                                <div class="table-responsive pe-1" style="max-height: 320px; overflow-y: auto;">
                                                    <table class="table table-sm align-middle mb-0">
                                                        <thead class="table-light sticky-top">
                                                            <tr>
                                                                <th class="ps-2 py-2">Producto & SKU</th>
                                                                <th class="text-center py-2">Cant.</th>
                                                                <th class="text-end pe-2 py-2">Subtotal</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            ${itemsHtml}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="modal-footer bg-light border-top px-4 py-3">
                                    <button type="button" class="btn btn-outline-secondary btn-sm rounded-3 px-4" data-bs-dismiss="modal">Cerrar</button>
                                </div>
                            </div>
                        </div>
                    </div>`;
                });

                ordersContainer.innerHTML = html;
            }

        } else {
            ordersContainer.innerHTML = `<p class="text-muted">No se pudieron obtener las órdenes de compra.</p>`;
        }

    } catch (error) {
        console.error("Error al cargar pedidos:", error);
        ordersContainer.innerHTML = `<p class="text-danger small">Error de conexión con el servidor.</p>`;
    }

    // ACTUALIZAR PERFIL
    const updateForm = document.getElementById("updateProfileForm");
    if (updateForm) {
        updateForm.addEventListener("submit", async (e) => {
            e.preventDefault();
      
            const formData = new FormData(updateForm);

            if (inputRut && inputRut.disabled && user.rut) {
                formData.set("rut", user.rut);
            }

            try {
                const res = await fetch("/api/users/profile", {
                    method: "PUT",
                    headers: { "Authorization": `Bearer ${token}` },
                    body: formData
                });

                const data = await res.json();

                if (res.ok) {
                    if (data.user) {
                        localStorage.setItem("user", JSON.stringify(data.user));
                    }

                    Swal.fire({
                        icon: "success",
                        title: "¡Perfil Actualizado!",
                        text: "Tus datos se han guardado correctamente.",
                        timer: 2000,
                        showConfirmButton: false
                    }).then(() => {
                        window.location.reload();
                    });

                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: data.message || "Error al actualizar el perfil."
                    });
                }

            } catch (err) {
                console.error("Error:", err);
                Swal.fire({
                    icon: "error",
                    title: "Error de red",
                    text: "Error de conexión al intentar actualizar el perfil."
                });
            }
        });
    }

    // LÓGICA CAMBIO DE CONTRASEÑA (MODAL)
    document.querySelectorAll(".toggle-password").forEach(button => {
        button.addEventListener("click", () => {
            const targetId = button.getAttribute("data-target");
            const input = document.getElementById(targetId);
            const icon = button.querySelector("i");

            if (input.type === "password") {
                input.type = "text";
                icon.classList.remove("bi-eye");
                icon.classList.add("bi-eye-slash");

            } else {
                input.type = "password";
                icon.classList.remove("bi-eye-slash");
                icon.classList.add("bi-eye");
            }
        });
    });

    const newPasswordInput = document.getElementById("newPassword");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const clientPasswordMatchMsg = document.getElementById("clientPasswordMatchMsg");

    function validateClientPasswordMatch() {
        const newVal = newPasswordInput ? newPasswordInput.value : "";
        const confirmVal = confirmPasswordInput ? confirmPasswordInput.value : "";

        if (!newVal && !confirmVal) {
            if (clientPasswordMatchMsg) clientPasswordMatchMsg.classList.add("d-none");
            return;
        }

        if (clientPasswordMatchMsg) {
            clientPasswordMatchMsg.classList.remove("d-none");

            if (newVal === confirmVal) {
                clientPasswordMatchMsg.textContent = "✓ Las contraseñas coinciden correctamente.";
                clientPasswordMatchMsg.className = "d-block text-success small fw-semibold mt-1";

            } else {
                clientPasswordMatchMsg.textContent = "✕ Las contraseñas no coinciden.";
                clientPasswordMatchMsg.className = "d-block text-danger small fw-semibold mt-1";
            }
        }
    }

    if (newPasswordInput && confirmPasswordInput) {
        newPasswordInput.addEventListener("input", validateClientPasswordMatch);
        confirmPasswordInput.addEventListener("input", validateClientPasswordMatch);
    }

    const changePasswordForm = document.getElementById("changePasswordForm");
    const changePasswordModalEl = document.getElementById("changePasswordModal");
    const changePasswordModal = changePasswordModalEl ? new bootstrap.Modal(changePasswordModalEl) : null;

    if (changePasswordForm) {
        changePasswordForm.addEventListener("submit", async (e) => {
             e.preventDefault();

            const currentPassword = document.getElementById("currentPassword").value;
            const newPassword = document.getElementById("newPassword").value;
            const confirmPassword = document.getElementById("confirmPassword").value;

            if (newPassword !== confirmPassword) {
                Swal.fire({
                    icon: "warning",
                    title: "Contraseñas no coinciden",
                    text: "La nueva contraseña y la confirmación deben ser iguales."
                });

                return;
            }

            const userId = window.currentUserId || localStorage.getItem("userId");

            if (!userId) {
                Swal.fire({
                    icon: "error",
                    title: "Sesión inválida",
                    text: "No se pudo identificar el ID del usuario. Vuelve a iniciar sesión."
                });

                return;
            }

            try {
                const response = await fetch(`/api/users/${userId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        currentPassword,
                        newPassword
                    })
                });

                const result = await response.json();

                if (response.ok) {
                    Swal.fire({
                        icon: "success",
                        title: "¡Contraseña Actualizada!",
                        text: "Tu contraseña ha sido modificada con éxito.",
                        timer: 2000,
                        showConfirmButton: false
                    });

                    changePasswordForm.reset();
                    if (clientPasswordMatchMsg) clientPasswordMatchMsg.classList.add("d-none");
                    if (changePasswordModal) changePasswordModal.hide();

                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: result.message || "Error al actualizar la contraseña."
                    });
                }

            } catch (error) {
                console.error("Error de conexión:", error);
                Swal.fire({
                    icon: "error",
                    title: "Error de red",
                    text: "Ocurrió un problema de conexión con el servidor."
                });
            }
        });
    }

    // CERRAR SESIÓN
    document.getElementById("logoutBtn")?.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
    });
});