document.addEventListener("DOMContentLoaded", () => {
    // LÓGICA DE FILTRADO
    const searchInput = document.getElementById("orderSearchInput");
    const clearSearchBtn = document.getElementById("clearOrderSearch");
    const statusFilterSelect = document.getElementById("statusFilterSelect");
    const orderRows = document.querySelectorAll(".order-row");
    const noSearchMatchRow = document.getElementById("noSearchMatchRow");

    const filterOrders = () => {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
        const selectedStatus = statusFilterSelect ? statusFilterSelect.value : "";
        let visibleCount = 0;

        orderRows.forEach(row => {
            const orderNumber = row.dataset.ordernumber.toLowerCase();
            const orderStatus = row.dataset.status;

            const matchesQuery = orderNumber.includes(query);
            const matchesStatus = !selectedStatus || orderStatus === selectedStatus;

            if (matchesQuery && matchesStatus) {
                row.style.display = "";
                visibleCount++;

            } else {
                row.style.display = "none";
            }
        });

        if (clearSearchBtn) {
            clearSearchBtn.style.display = query ? "block" : "none";
        }

        if (noSearchMatchRow) {
            noSearchMatchRow.style.display = visibleCount === 0 ? "" : "none";
        }
    };

    if (searchInput) {
        searchInput.addEventListener("input", filterOrders);
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener("click", () => {
            if (searchInput) {
                searchInput.value = "";
                filterOrders();
                searchInput.focus();
            }
        });
    }

    if (statusFilterSelect) {
        statusFilterSelect.addEventListener("change", filterOrders);
    }

    // MOSTRAR OCULTAR INPUT ESTADO SEGUN EL SELECCIONADO
    document.querySelectorAll(".statusSelect").forEach(select => {
        select.addEventListener("change", (e) => {
            const form = e.target.closest("form");
            const trackingContainer = form.querySelector(".trackingContainer");
            const trackingInput = form.querySelector(".trackingInput");
            const value = e.target.value;

            if (value === "Enviado" || value === "Entregado") {
                trackingContainer.classList.remove("d-none");

                if (trackingInput && !trackingInput.disabled) {
                    trackingInput.focus();
                }

            } else {
                trackingContainer.classList.add("d-none");
                if (trackingInput) trackingInput.value = ""; 
            }
        });
    });

    // FORMULARIO ACTUALIZACIÓN ESTADO
    document.querySelectorAll(".statusUpdateForm").forEach(form => {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const orderNumber = form.dataset.ordernumber;
            const status = form.querySelector(".statusSelect").value;
            const trackingInput = form.querySelector(".trackingInput");
            const trackingNumber = trackingInput ? trackingInput.value.trim() : "";

            if ((status === "Enviado" || status === "Entregado") && !trackingNumber) {
                Swal.fire({
                    icon: "warning",
                    title: "Campo requerido",
                    text: "Por favor, ingresa el número de seguimiento antes de continuar.",
                    confirmButtonColor: "#0d6efd"
                });

                return;
            }

            const token = localStorage.getItem("token") || sessionStorage.getItem("token");

            try {
                const res = await fetch(`/api/orders/${orderNumber}/status`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ status, trackingNumber })
                });

                const data = await res.json();
                if (res.ok) {
                    Swal.fire({
                        icon: "success",
                        title: "¡Actualizado!",
                        text: "¡Estado y número de seguimiento actualizados con éxito!",
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        window.location.reload();
                    });

                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: data.message || "Error al actualizar el estado.",
                        confirmButtonColor: "#0d6efd"
                    });
                }

            } catch (err) {
                console.error("Error de conexión:", err);
                Swal.fire({
                    icon: "error",
                    title: "Error de conexión",
                    text: "Error de conexión con el servidor.",
                    confirmButtonColor: "#0d6efd"
                });
            }
        });
    });
});