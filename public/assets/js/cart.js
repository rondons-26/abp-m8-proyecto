document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("cartItemsContainer");
    const subtotalEl = document.getElementById("cartSubtotal");
    const totalEl = document.getElementById("cartTotal");
    const checkoutBtn = document.getElementById("checkoutBtn");

    const renderCart = () => {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];

        if (cart.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <p class="text-muted mb-3">Tu carrito está vacío.</p>
                    <a href="/shop" class="btn btn-outline-primary rounded-3">Ir a la Tienda</a>
                </div>
            }`;

            subtotalEl.textContent = "$0";
            totalEl.textContent = "$0";

            if (checkoutBtn) checkoutBtn.disabled = true;
      
            window.dispatchEvent(new Event('storage'));
            return;
        }

        let total = 0;
        container.innerHTML = cart
        .map((item) => {
          const itemTotal = item.price * item.quantity;
            total += itemTotal;
        
            const priceFormatted = Number(item.price).toLocaleString("es-CL");
            const itemTotalFormatted = Number(itemTotal).toLocaleString("es-CL");

            const isMin = item.quantity <= 1;
            const isMax = item.quantity >= 10;

            return `
                <div class="border-bottom py-3">
                    <div class="d-flex align-items-center justify-content-between">
                        <div class="d-flex align-items-center">
                            <img src="${item.image}" alt="${item.name}" class="rounded-3 object-fit-cover me-3" style="width: 60px; height: 60px;">
                            <div>
                                <h6 class="mb-0 fw-bold">${item.name}</h6>
                                <small class="text-muted">$${priceFormatted} c/u</small>
                            </div>
                        </div>
                        <div class="d-flex align-items-center gap-3">
                             <!-- CONTROLES CANTIDAD -->
                            <div class="input-group input-group-sm" style="width: 100px;">
                                <button class="btn btn-outline-secondary decrease-btn" data-id="${item.id}" type="button" ${isMin ? 'disabled' : ''}>-</button>
                                <input type="text" class="form-control text-center bg-white fw-bold" value="${item.quantity}" readonly>
                                <button class="btn btn-outline-secondary increase-btn" data-id="${item.id}" type="button">+</button>
                            </div>

                            <span class="fw-bold text-dark" style="min-width: 90px; text-align: right;">$${itemTotalFormatted}</span>
              
                            <button class="btn btn-sm btn-outline-danger border-0 remove-btn" data-id="${item.id}" title="Eliminar producto">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                    <!-- MENSAJE TEMPORAL-->
                    <div id="max-msg-${item.id}" class="text-danger small mt-1 ms-5 ps-2 d-none">
                        <i class="bi bi-exclamation-circle me-1"></i>Has alcanzado el límite máximo de 10 unidades para este producto.
                    </div>
                </div>
            `;
        })
        .join("");

        const totalCartFormatted = `$${Number(total).toLocaleString("es-CL")}`;
        subtotalEl.textContent = totalCartFormatted;
        totalEl.textContent = totalCartFormatted;
    
        if (checkoutBtn) checkoutBtn.disabled = false;

        window.dispatchEvent(new Event('storage'));

        // ASIGNACIÓN EVENTOS

        // BOTÓN INCREMENTAR (+) Y AVISO SI INTENTA SUPERAR 10
        document.querySelectorAll(".increase-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const id = e.currentTarget.dataset.id;
                let cart = JSON.parse(localStorage.getItem("cart")) || [];
                const product = cart.find((item) => String(item.id) === String(id));
        
                if (product) {
                    if (product.quantity < 10) {
                         product.quantity += 1;
                        localStorage.setItem("cart", JSON.stringify(cart));
                        renderCart();

                    } else {
                        const msgEl = document.getElementById(`max-msg-${id}`);
                        if (msgEl) {
                            msgEl.classList.remove("d-none");

                            if (msgEl.dataset.timeoutId) {
                                clearTimeout(Number(msgEl.dataset.timeoutId));
                            }

                            const timeoutId = window.setTimeout(() => {
                                msgEl.classList.add("d-none");
                            }, 3000);

                            msgEl.dataset.timeoutId = String(timeoutId);
                        }
                    }
                }
            });
        });

        // BOTÓN DISMINUIR (-)
        document.querySelectorAll(".decrease-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const id = e.currentTarget.dataset.id;
                let cart = JSON.parse(localStorage.getItem("cart")) || [];
                const product = cart.find((item) => String(item.id) === String(id));

                if (product && product.quantity > 1) {
                    product.quantity -= 1;
                    localStorage.setItem("cart", JSON.stringify(cart));
                    renderCart();
                }
            });
        });

        // BOTÓN ELIMINAR
        document.querySelectorAll(".remove-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const id = e.currentTarget.dataset.id;
                let updatedCart = JSON.parse(localStorage.getItem("cart")) || [];
                updatedCart = updatedCart.filter((item) => String(item.id) !== String(id));
                localStorage.setItem("cart", JSON.stringify(updatedCart));
                renderCart();
            });
        });
    };

    // CHECKOUT
    checkoutBtn?.addEventListener("click", async () => {
        const token = localStorage.getItem("token");
    
        if (!token) {
            localStorage.setItem("redirectAfterLogin", "/cart");
      
            if (typeof Swal !== "undefined") {
                await Swal.fire({
                    icon: "info",
                    title: "Inicia sesión",
                    text: "Es necesario iniciar sesión para confirmar tus datos y validar que estén correctos.",
                    confirmButtonText: "Ir a Iniciar Sesión",
                    confirmButtonColor: "#0d6efd",
                    width: "380px",
                    buttonsStyling: true,
                    customClass: {
                        popup: "rounded-4 shadow-sm px-3 py-3",
                        title: "fs-5 fw-bold",
                        htmlContainer: "small text-muted"
                    }
                });

            } else {
                alert("Es necesario iniciar sesión para confirmar sus datos y validar que estén correctos y completos.");
            }

            window.location.href = "/login";
            return;
        }

        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        if (cart.length === 0) return;

        try {
            checkoutBtn.disabled = true;
            checkoutBtn.textContent = "Procesando...";

            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify({ items: cart })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Error al procesar la compra.");
            }

            if (typeof Swal !== "undefined") {
                await Swal.fire({
                    icon: "success",
                    title: "¡Pedido Procesado!",
                    html: `<b>N° de Orden:</b> ${data.orderNumber}<br><p class="text-muted mt-2 small">Se ha registrado de manera exitosa su pedido.</p>`,
                    confirmButtonText: "Aceptar",
                    width: "400px"
                });

            } else {
                alert(`¡Pedido procesado con éxito!\nN° de Orden: ${data.orderNumber}`);
            }

            localStorage.removeItem("cart");
            window.location.href = "/shop";

        } catch (error) {
            console.error("Error en el checkout:", error);
            alert(error.message || "Ocurrió un error inesperado al procesar tu orden.");
            checkoutBtn.disabled = false;
            checkoutBtn.innerHTML = '<i class="bi bi-credit-card me-2"></i> Confirmar y Pagar';
        }
    });

    renderCart();
});