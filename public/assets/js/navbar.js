document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");

    let userStr = localStorage.getItem("user");

    const cartIconLink = document.getElementById("cartIconLink");
    const userContainer = document.getElementById("userMenuContainer");

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
    };

    const updateBadge = () => {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
        const badge = document.getElementById("navCartBadge");
        if (badge) badge.textContent = totalItems;
    };

    if (token) {

        try {
            const res = await fetch("/api/users/profile", {
                headers: { "Authorization": `Bearer ${token}` }
            });

            const data = await res.json();

            if (res.ok && data.user) {
                userStr = JSON.stringify(data.user);
                localStorage.setItem("user", userStr);
            }

        } catch (e) {
            console.error("No se pudo refrescar el perfil en el navbar:", e);
        }
    }

    // OCULTA EL CARRITO SI ES ADMIN
    if (userStr && token) {

        try {
            const user = JSON.parse(userStr);

            if (user.role === "admin" && cartIconLink) {
                cartIconLink.style.setProperty("display", "none", "important");
            }

        } catch (e) {
            console.error("Error al parsear usuario:", e);
        }
    }

    if (userStr && token && userContainer) {
        const user = JSON.parse(userStr);
        const isAdmin = user.role === "admin";

        if (isAdmin) {

            if (cartIconLink) {
                cartIconLink.style.setProperty("display", "none", "important");
            }

            userContainer.innerHTML = `
                <div class="d-flex align-items-center gap-2">
                    <a href="/admin/dashboard" class="btn btn-warning btn-sm rounded-pill px-3 py-1 fw-semibold d-flex align-items-center gap-1 shadow-sm">
                        <i class="bi bi-speedometer2"></i>
                        <span class="small">Panel Admin</span>
                    </a>
                    <button id="navLogoutBtn" class="btn btn-outline-danger btn-sm rounded-pill px-3 py-1 fw-semibold d-flex align-items-center gap-1">
                        <i class="bi bi-box-arrow-right"></i>
                        <span class="small">Cerrar Sesión</span>
                    </button>
                </div>
            `;

        } else {

            const avatarSrc = user.profileImage;

            const avatarHtml = avatarSrc 
            ? `<img src="${avatarSrc}" alt="Avatar" class="rounded-circle object-fit-cover" style="width: 24px; height: 24px;">`
            : `<i class="bi bi-person-circle fs-6 text-dark"></i>`;

            const rawName = user.firstname || user.name || "Mi Cuenta";
            const firstNameOnly = rawName.split(" ")[0];

            userContainer.innerHTML = `
                <div class="dropdown">
                    <button class="btn btn-light btn-sm rounded-pill px-3 py-1 d-flex align-items-center gap-2 border shadow-sm" type="button" data-bs-toggle="dropdown">
                        ${avatarHtml}
                        <span class="small fw-semibold text-dark">${firstNameOnly}</span>
                        <i class="bi bi-chevron-down text-muted" style="font-size: 0.7rem;"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end shadow-sm rounded-3 mt-2 small">
                        <li><a class="dropdown-item py-2" href="/clientProfile"><i class="bi bi-person me-2 text-primary"></i>Mi Perfil</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><button id="navLogoutBtn" class="dropdown-item text-danger py-2"><i class="bi bi-box-arrow-right me-2"></i>Cerrar Sesión</button></li>
                    </ul>
                </div>
            `;
        }
    }

    document.getElementById("navLogoutBtn")?.addEventListener("click", handleLogout);
    document.getElementById("adminNavLogoutBtn")?.addEventListener("click", handleLogout);

    updateBadge();
});