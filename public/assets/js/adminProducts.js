document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");

    // VALIDACIÓN TOKEN
    if (!token) {
        Swal.fire({
            icon: "warning",
            title: "Acceso denegado",
            text: "Debes iniciar sesión como administrador para realizar esta acción.",
            confirmButtonColor: "#0d6efd"
        }).then(() => {
            window.location.href = "/login";
        });

        return;
    }

    // LÓGICA AGREGAR PRODUCTO (MODAL)
    const addForm = document.getElementById("addProductForm");
    if (addForm) {
        addForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const formData = new FormData();
            formData.append("name", document.getElementById("addName").value);
            formData.append("description", document.getElementById("addDescription").value);
            formData.append("price", document.getElementById("addPrice").value);
            formData.append("stock", document.getElementById("addStock").value);

            const imgFile = document.getElementById("addImage").files[0];
            if (imgFile) formData.append("image", imgFile);

            try {
                const response = await fetch("/api/products", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    },
                    body: formData
                });

                const result = await response.json();

                if (response.ok) {
                    Swal.fire({
                        icon: "success",
                        title: "¡Éxito!",
                        text: "Producto agregado exitosamente.",
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        window.location.reload();
                    });

                } else {
                     Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: result.message || "Error al agregar el producto.",
                        confirmButtonColor: "#0d6efd"
                    });
                }

            } catch (error) {
                console.error("Error al agregar producto:", error);
                Swal.fire({
                    icon: "error",
                    title: "Error de conexión",
                    text: "Ocurrió un problema de conexión con el servidor.",
                    confirmButtonColor: "#0d6efd"
                });
            }
        });
    }

    // LÓGICA EDITAR PRODUCTO (MODAL)
    const editModalEl = document.getElementById("editProductModal");
    const editModal = editModalEl ? new bootstrap.Modal(editModalEl) : null;
    const editForm = document.getElementById("editProductForm");

    document.querySelectorAll(".btn-edit-product").forEach((btn) => {
        btn.addEventListener("click", () => {
            document.getElementById("editProductId").value = btn.dataset.id;
            document.getElementById("editName").value = btn.dataset.name;
            document.getElementById("editDescription").value = btn.dataset.description;
            document.getElementById("editPrice").value = Math.round(Number(btn.dataset.price) || 0);
            document.getElementById("editStock").value = btn.dataset.stock;

            if (editModal) editModal.show();
        });
    });

    if (editForm) {
        editForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const id = document.getElementById("editProductId").value;
            const formData = new FormData();
            formData.append("name", document.getElementById("editName").value);
            formData.append("description", document.getElementById("editDescription").value);
            formData.append("price", document.getElementById("editPrice").value);
            formData.append("stock", document.getElementById("editStock").value);

            const imgFile = document.getElementById("editImage").files[0];
            if (imgFile) formData.append("image", imgFile);

            try {
                const response = await fetch(`/api/products/${id}`, {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    },
                    body: formData
                });

                const result = await response.json();

                if (response.ok) {
                    Swal.fire({
                        icon: "success",
                        title: "¡Actualizado!",
                        text: "Producto actualizado exitosamente.",
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        window.location.reload();
                    });

                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: result.message || "Error al actualizar el producto.",
                        confirmButtonColor: "#0d6efd"
                    });
                }

            } catch (error) {
                console.error("Error al actualizar producto:", error);
                Swal.fire({
                    icon: "error",
                    title: "Error de conexión",
                    text: "Ocurrió un problema de conexión con el servidor.",
                    confirmButtonColor: "#0d6efd"
                });
            }
        });
    }

    // LÓGICA ELIMINAR PRODUCTO
    document.querySelectorAll(".btn-delete-product").forEach((btn) => {
        btn.addEventListener("click", async () => {
            const productId = btn.dataset.id;
            const productName = btn.dataset.name || "este producto";

            const confirmation = await Swal.fire({
                title: "¿Estás seguro?",
                text: `Se eliminará "${productName}" del inventario de forma permanente.`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#dc3545",
                cancelButtonColor: "#6c757d",
                confirmButtonText: "Sí, eliminar",
                cancelButtonText: "Cancelar"
            });

            if (confirmation.isConfirmed) {
                try {
                    const response = await fetch(`/api/products/${productId}`, {
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
                            text: "Producto eliminado exitosamente.",
                            timer: 1500,
                            showConfirmButton: false
                        }).then(() => {
                            window.location.reload();
                        });

                    } else {
                        Swal.fire({
                            icon: "error",
                            title: "Error",
                            text: result.message || "Error al intentar eliminar el producto.",
                            confirmButtonColor: "#0d6efd"
                        });
                    }

                } catch (error) {
                    console.error("Error al eliminar el producto:", error);
                    Swal.fire({
                        icon: "error",
                        title: "Error de conexión",
                        text: "Ocurrió un problema de conexión con el servidor.",
                        confirmButtonColor: "#0d6efd"
                    });
                }
            }
        });
    });

    // LÓGICA BUSCADOR DINÁMICO POR SKU
    const searchInput = document.getElementById("skuSearchInput");
    const clearBtn = document.getElementById("clearSkuSearch");
    const productRows = document.querySelectorAll(".product-row");
    const noSearchMatchRow = document.getElementById("noSearchMatchRow");

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            let matchCount = 0;

            if (clearBtn) {
                clearBtn.style.display = searchTerm.length > 0 ? "block" : "none";
            }

            productRows.forEach(row => {
                const sku = row.getAttribute("data-sku")?.toLowerCase() || "";
        
                if (sku.includes(searchTerm)) {
                    row.style.display = "";
                    matchCount++;

                } else {
                    row.style.display = "none";
                }
            });

            if (noSearchMatchRow) {
                noSearchMatchRow.style.display = (matchCount === 0 && productRows.length > 0) ? "" : "none";
            }
        });

        if (clearBtn) {
            clearBtn.addEventListener("click", () => {
                searchInput.value = "";
                clearBtn.style.display = "none";
                productRows.forEach(row => row.style.display = "");
                if (noSearchMatchRow) noSearchMatchRow.style.display = "none";
                searchInput.focus();
            });
        }
    }
});