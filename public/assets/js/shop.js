document.addEventListener("DOMContentLoaded", () => {
    // VALIDACIÓN DE ROL: BLOQUEA COMPRAS SI ES ADMIN
    const userStr = localStorage.getItem("user");
    let isAdmin = false;

    if (userStr) {
        try {
            const user = JSON.parse(userStr);

            if (user.role === "admin") {
                isAdmin = true;
            }

        } catch (e) {
            console.error("Error al parsear el usuario:", e);
        }
    }

    const updateCartBadge = () => {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
        const badge = document.getElementById("navCartBadge") || document.getElementById("cartBadge");
        if (badge) badge.textContent = totalItems;
    };

    // 1.MANEJO DE LOS BOTOS AUMENTAR Y DISMINUIR CANTIDAD
    document.querySelectorAll(".product-card").forEach((card) => {
        const btnMinus = card.querySelector(".btn-minus");
        const btnPlus = card.querySelector(".btn-plus");
        const qtyInput = card.querySelector(".product-qty");

        // SI ES ADMIN, SE BLOQUEAN LOS INPUTS Y BOTONES NUMÉRICOS
        if (isAdmin) {
            if (btnMinus) btnMinus.disabled = true;
            if (btnPlus) btnPlus.disabled = true;
            if (qtyInput) qtyInput.disabled = true;
        }

        if (btnMinus && btnPlus && qtyInput && !isAdmin) {
            let msgContainer = card.querySelector(".qty-error-msg");

            if (!msgContainer) {
                msgContainer = document.createElement("div");
                msgContainer.className = "qty-error-msg text-danger small mt-1 d-none";
                msgContainer.innerHTML = `<i class="bi bi-exclamation-circle me-1"></i>Límite máximo de 10 unidades.`;
                const inputParent = qtyInput.closest(".input-group") || qtyInput.parentElement;
                inputParent.insertAdjacentElement("afterend", msgContainer);
            }

            const showLimitMessage = () => {
                msgContainer.classList.remove("d-none");

                if (msgContainer.dataset.timeoutId) {
                    clearTimeout(Number(msgContainer.dataset.timeoutId));
                }

                const timeoutId = window.setTimeout(() => {
                    msgContainer.classList.add("d-none");
                }, 3000);

                msgContainer.dataset.timeoutId = String(timeoutId);
            };

            btnMinus.addEventListener("click", () => {
                let currentVal = parseInt(qtyInput.value) || 1;

                if (currentVal > 1) {
                    qtyInput.value = currentVal - 1;
                }
            });

            btnPlus.addEventListener("click", () => {
                let currentVal = parseInt(qtyInput.value) || 1;

                if (currentVal < 10) {
                    qtyInput.value = currentVal + 1;
                } else {
                    showLimitMessage();
                }
            });
        }
    });

    // 2. MANEJO BOTÓN "Añadir al Carrito"
    document.querySelectorAll(".add-to-cart-btn").forEach((button) => {
        // SI ES ADMIN SE BLOQUEA EL BOTÓN
        if (isAdmin) {
            button.disabled = true;
            button.classList.remove("btn-primary");
            button.classList.add("btn-secondary", "disabled", "opacity-75");
            button.innerHTML = '<i class="bi bi-lock-fill me-1"></i> Modo Administrador';
            return;
        }

        button.addEventListener("click", (e) => {
            const btn = e.currentTarget;
            const card = btn.closest(".product-card");
            const qtyInput = card ? card.querySelector(".product-qty") : null;
            const msgContainer = card ? card.querySelector(".qty-error-msg") : null;

            let quantityToAdd = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
            let cart = JSON.parse(localStorage.getItem("cart")) || [];

            const existingIndex = cart.findIndex((item) => String(item.id) === String(btn.dataset.id));

            let currentInCart = existingIndex > -1 ? cart[existingIndex].quantity : 0;

            // VALIDAR QUE LA SUMA TOTAL NO EXCEDA 10
            if (currentInCart + quantityToAdd > 10) {
                quantityToAdd = 10 - currentInCart;

                if (quantityToAdd <= 0) {

                    if (msgContainer) {
                        msgContainer.innerHTML = `<i class="bi bi-exclamation-circle me-1"></i>Ya tienes el máximo de 10 unidades en el carrito.`;
                        msgContainer.classList.remove("d-none");
                        setTimeout(() => msgContainer.classList.add("d-none"), 3000);
                    }

                    return;
                }
            }

            const product = {
                id: btn.dataset.id,
                name: btn.dataset.name,
                price: parseFloat(btn.dataset.price),
                image: btn.dataset.image,
                quantity: quantityToAdd,
            };

            if (existingIndex > -1) {
                cart[existingIndex].quantity += product.quantity;
            } else {
                cart.push(product);
            }

            localStorage.setItem("cart", JSON.stringify(cart));
            updateCartBadge();

            // FEEDBACK VISUAL EN EL BOTÓN
            const originalHTML = btn.innerHTML;
            btn.classList.replace("btn-primary", "btn-success");
            btn.innerHTML = `<i class="bi bi-check2"></i> ¡Agregado (${product.quantity})!`;
      
            setTimeout(() => {
                btn.classList.replace("btn-success", "btn-primary");
                btn.innerHTML = originalHTML;
            }, 1500);

            if (qtyInput) qtyInput.value = 1;
        });
    });

    updateCartBadge();
});