import UsersService from "../services/users.service.js";
import ProductsService from "../services/products.service.js";
import { Order, User, Product } from "../models/index.js";

// REDIRECCIÓN AUTOMÁTICA A LA TIENDA
export const homeView = (req, res) => {
    return res.redirect("/shop");
};

// VISTA DASHBOARD (ADMIN)
export const dashboardView = (req, res) => {
    try {
        res.render("dashboard", {
            title: "Panel de Control",
            activeDashboard: true,
            isAdminView: true,
        });

    } catch (error) {
        res.status(500).redirect("/shop");
    }
};

// VISTA STATUS
export const statusView = (req, res) => {
    try {
        const systemStatus = {
            status: "Operacional",
            environment: process.env.NODE_ENV || "development",
            uptime: `${Math.floor(process.uptime())}s`,
            timestamp: new Date().toISOString(),
            nodeVersion: process.version,
        };

        if (req.headers.accept && req.headers.accept.includes("application/json")) {
            return res.json(systemStatus);
        }

        res.render("status", {
            title: "Estado del Servidor",
            status: systemStatus,
            activeStatus: true,
            isAdminView: true,
        });

    } catch (error) {
        res.status(500).json({ status: "Error", message: "Error al obtener estado del servidor" });
    }
};

// VISTA LOGIN
export const loginView = (req, res) => {
    try {
        res.render("login", {
            title: "Iniciar Sesión",
            isAdminView: false,
            isAuthPage: true,
        });

    } catch (error) {
        res.status(500).redirect("/shop");
    }
};

// VISTA REGISTRO
export const registerView = (req, res) => {
    try {
        res.render("register", {
            title: "Crear Cuenta",
            isAdminView: false,
            isAuthPage: true,
        });

    } catch (error) {
        res.status(500).redirect("/shop");
    }
};

// VISTA PERFIL DE CLIENTE
export const profileView = async (req, res) => {
    try {
        res.render("clientProfile", {
            title: "Mi Perfil",
            activeProfile: true,
            isAdminView: false,
            isProfileView: true,
        });

    } catch (error) {
        res.status(500).redirect("/shop");
    }
};

// OBTENER DATOS DEL PERFIL DEL USUARIO AUTENTICADO
export const getClientProfileData = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId, {
            attributes: { exclude: ["password"] }
        });

        if (!user) {
            return res.status(404).json({ status: "error", message: "Usuario no encontrado" });
        }

        return res.status(200).json({
            status: "success",
            user
        });

    } catch (error) {
        console.error("Error al obtener perfil:", error);
        return res.status(500).json({ status: "error", message: "Error interno al obtener perfil" });
    }
};

// ACTUALIZAR DATOS Y FOTO DE PERFIL DEL CLIENTE
export const updateClientProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { firstname, lastname, rut, phone, region, commune, address } = req.body;
        const profileImage = req.file ? `/uploads/${req.file.filename}` : undefined;

        const updateData = { firstname, lastname, rut, phone, region, commune, address };
        if (profileImage) updateData.profileImage = profileImage;

        await User.update(updateData, { where: { id: userId } });

        const updatedUser = await User.findByPk(userId, {
            attributes: { exclude: ["password"] }
        });

        res.status(200).json({ 
            status: "success", 
            message: "Perfil actualizado correctamente",
            user: updatedUser
        });
        
    } catch (error) {
        console.error("Error al actualizar perfil:", error);
        res.status(500).json({ status: "error", message: "Error al actualizar el perfil" });
    }
};

// VISTA CATÁLOGO TIENDA (CLIENTE) - OCULTA EL ARTICULO <= 0
export const shopView = async (req, res) => {
    try {
        const rawProducts = await ProductsService.getAllProducts();
        const plainProducts = rawProducts
            .map((p) => p.get({ plain: true }))
            .filter((p) => p.stock > 0);

        res.render("shop", {
            title: "Catálogo de Productos",
            products: plainProducts,
            activeShop: true,
            isShopView: true,
            hideCart: false
        });

    } catch (error) {
        res.status(500).render("shop", { products: [], isShopView: true });
    }
};

// VISTA CARRITO DE COMPRAS (CLIENTE)
export const cartView = (req, res) => {
    res.render("cart", { title: "Mi Carrito", activeCart: true, isShopView: true, hideCart: true });
};

// PROCESAR COMPRA / CHECKOUT (CLIENTE)
export const processCheckout = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        if (userRole === "admin") {
            return res.status(403).json({ message: "Los administradores no pueden realizar compras en la tienda." });
        }

        const { items } = req.body;
        if (!items || !items.length) {
            return res.status(400).json({ message: "El carrito está vacío" });
        }

        const orderNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        let purchasedSummary = [];

        // 1. VALIDAR STOCK DE TODOS LOS PRODUCTOS
        for (const item of items) {
            const product = await Product.findByPk(item.id);
            if (!product) {
                return res.status(400).json({ message: `El producto con ID ${item.id} ya no existe en el sistema.` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `Stock insuficiente para: ${product.name} (Disponibles: ${product.stock})` });
            }
        }

        // 2. STOCK VALIDO SE PROCEDE A DESCONTAR Y REGISTRAR CADA ITEM
        for (const item of items) {
            const product = await Product.findByPk(item.id);
      
            product.stock -= item.quantity;
            await product.save();

            await Order.create({
                orderNumber: orderNumber,
                userId: userId,
                product: product.name,
                sku: product.sku || "SKU-N/D",
                quantity: item.quantity,
                amount: product.price * item.quantity,
                image: product.imageUrl || null,
                status: "Procesando"
            });

            purchasedSummary.push({ product: product.name, quantity: item.quantity, price: product.price });
        }

        return res.status(201).json({ 
            status: "success", 
            message: "Pedido procesado exitosamente", 
            orderNumber,
            summary: purchasedSummary 
        });

    } catch (error) {
        console.error("Error al procesar checkout:", error);
        return res.status(500).json({ message: "Error interno al procesar el pago" });
    }
};

// LISTAR USUARIOS (PANEL ADMIN)
export const usersView = async (req, res) => {
    try {
        const rawUsers = await UsersService.getAllUsers();
        const plainUsers = rawUsers.map((user) => user.get({ plain: true }));

        res.render("listUsers", {
            title: "Lista de Usuarios",
            users: plainUsers,
            activeUsers: true,     
            isAdminView: true,
        });

    } catch (error) {
        res.status(500).render("listUsers", { error: "Error al cargar los usuarios.", isAdminView: true });
    }
};

// FORMULARIO CREAR USUARIO (PANEL ADMIN)
export const usersAddView = (req, res) => {
    try {
        res.render("addUsers", {
            title: "Agregar Usuario",
            activeUsers: true,
            isAdminView: true,
        });

    } catch (error) {
        res.status(500).render("addUsers", { error: "Error al cargar el formulario.", isAdminView: true });
    }
};

// FORMULARIO EDITAR USUARIO (PANEL ADMIN)
export const usersUpdateView = async (req, res) => {
    try {
        const { id } = req.params;
        const rawUser = await UsersService.getUserById(id);

        if (!rawUser) {
            return res.status(404).render("listUsers", {
                title: "Usuario No Encontrado",
                error: `El usuario con ID ${id} no existe en el registro.`,
                isAdminView: true,
            });
        }

        res.render("updateUser", {
            title: "Editar Usuario",
            user: rawUser.get({ plain: true }),
            id,
            isAdminView: true,
        });

    } catch (error) {
        res.status(500).render("listUsers", { error: "Error al obtener los datos del usuario.", isAdminView: true });
    }
};

// LISTAR PRODUCTOS (PANEL ADMIN)
export const productsView = async (req, res) => {
    try {
        const rawProducts = await ProductsService.getAllProducts();
        const plainProducts = rawProducts.map((product) => product.get({ plain: true }));

        res.render("listProducts", {
            title: "Gestión de Productos",
            products: plainProducts,
            activeProducts: true,
            isAdminView: true,
        });

    } catch (error) {
        res.status(500).render("listProducts", { error: "Error al cargar la lista de productos.", isAdminView: true });
    }
};

// FORMULARIO CREAR PRODUCTO (PANEL ADMIN)
export const productsAddView = (req, res) => {
    try {
        res.render("addProduct", {
            title: "Agregar Producto",
            activeAddProduct: true,
            isAdminView: true,
        });

    } catch (error) {
        res.status(500).render("addProduct", { error: "Error al cargar el formulario de productos.", isAdminView: true });
    }
};

// FORMULARIO EDITAR PRODUCTO (PANEL ADMIN)
export const productsUpdateView = async (req, res) => {
    try {
        const { id } = req.params;
        const rawProduct = await ProductsService.getProductById(id);

        if (!rawProduct) {
            return res.status(404).render("listProducts", {
                title: "Producto No Encontrado",
                error: `El producto con ID ${id} no existe en el registro.`,
                isAdminView: true,
            });
        }

        res.render("updateProduct", {
            title: "Editar Producto",
            product: rawProduct.get({ plain: true }),
            id,
            isAdminView: true,
        });

    } catch (error) {
        res.status(500).render("listProducts", { error: "Error al obtener los datos del producto.", isAdminView: true });
    }
};

// VISTA VER PEDIDOS (PANEL ADMIN)
export const getAdminOrdersView = async (req, res) => {
    try {
        const rawOrders = await Order.findAll({
          include: [
            {
              model: User,
              as: "usuario",
              attributes: ["id", "firstname", "lastname", "email", "rut", "phone", "region", "commune", "address"]
            }
          ],
          order: [["createdAt", "DESC"]]
        });

        const ordersMap = {};
        rawOrders.forEach(o => {
            const item = o.get({ plain: true });
            if (!ordersMap[item.orderNumber]) {

                const isProcessing = (!item.status || item.status === "Procesando");
                const isShipped = (item.status === "Enviado");
                const isDelivered = (item.status === "Entregado");

                ordersMap[item.orderNumber] = {
                    dbIds: [], 
                    orderNumber: item.orderNumber,
                    createdAt: item.createdAt,
                    status: item.status || "Procesando",
                    trackingNumber: item.trackingNumber || "",
                    isProcessing,
                    isShipped,
                    isDelivered,
                    hasTracking: Boolean(item.trackingNumber),
                    totalAmount: 0,
                    customer: item.usuario || {},
                    items: []
                };
            }

            ordersMap[item.orderNumber].dbIds.push(item.id);
            ordersMap[item.orderNumber].totalAmount += Number(item.amount);
            ordersMap[item.orderNumber].items.push({
                product: item.product,
                quantity: item.quantity,
                amount: item.amount,
                sku: item.sku || "SKU-N/D",
                image: item.image || "/assets/img/default-product.png"
            });
        });

        const orders = Object.values(ordersMap);

        res.render("adminOrders", {
            title: "Pedidos de Clientes",
            orders,
            activeOrders: true,
            isAdminView: true
        });

    } catch (error) {
        console.error("Error al cargar pedidos:", error);
        res.status(500).redirect("/dashboard");
    }
};

// OBTENER HISTORIAL DE COMPRAS DEL CLIENTE AUTENTICADO
export const getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id;

        const rawOrders = await Order.findAll({
            where: { userId },
            order: [["createdAt", "DESC"]]
        });

        const ordersMap = {};
        rawOrders.forEach(o => {
            const item = o.get({ plain: true });
            if (!ordersMap[item.orderNumber]) {
                ordersMap[item.orderNumber] = {
                    orderNumber: item.orderNumber,
                    createdAt: item.createdAt,
                    status: item.status || "Procesando",
                    trackingNumber: item.trackingNumber || "",
                    totalAmount: 0,
                    items: []
                };
            }

            ordersMap[item.orderNumber].totalAmount += Number(item.amount);
            ordersMap[item.orderNumber].items.push({
                product: item.product,
                quantity: item.quantity,
                amount: item.amount,
                sku: item.sku || "SKU-N/D",
                image: item.image || null
            });
        });

        const orders = Object.values(ordersMap);

        return res.status(200).json({
            status: "success",
            data: orders
        });

    } catch (error) {
        console.error("Error al obtener las órdenes del usuario:", error);
        return res.status(500).json({
            status: "error",
            message: "Error técnico al obtener las órdenes"
        });
    }
};

// ACTUALIZAR ESTADO Y SEGUIMIENTO DE ORDEN (PANEL ADMIN)
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderNumber } = req.params;
        const { status, trackingNumber } = req.body;

        if (status === "Enviado" && !trackingNumber) {
            return res.status(400).json({ status: "error", message: "Debe ingresar el número de seguimiento para pedidos enviados." });
        }

        await Order.update(
            { status, trackingNumber },
            { where: { orderNumber } }
        );

        return res.status(200).json({
            status: "success",
            message: "Estado del pedido actualizado exitosamente."
        });

    } catch (error) {
        console.error("Error al actualizar orden:", error);
        return res.status(500).json({ status: "error", message: "Error interno al actualizar el estado." });
    }
};