import express from "express";
import * as viewsController from "../controllers/views.controllers.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

// VISTAS PÚBLICAS
router.get("/", viewsController.homeView);
router.get("/shop", viewsController.shopView);
router.get("/cart", viewsController.cartView);

// VISTAS DE AUTENTICACIÓN
router.get("/login", viewsController.loginView);
router.get("/register", viewsController.registerView);

// VISTA PERFIL DE CLIENTE (PROTEGIDO PARA SOLO USUARIOS LOGUEADOS)
router.get("/clientProfile", authenticateToken, authorizeRoles("cliente"), viewsController.profileView);

// ==========================================
// RUTAS DEL PANEL ADMINISTRATIVO (BLINDADAS EN EL SERVIDOR)
// ==========================================

router.get("/admin/dashboard", authenticateToken, authorizeRoles("admin"), viewsController.dashboardView);
router.get("/admin/status", authenticateToken, authorizeRoles("admin"), viewsController.statusView);

// VISTAS GESTIÓN DE USUARIOS (ADMIN)
router.get("/admin/users", authenticateToken, authorizeRoles("admin"), viewsController.usersView);

// VISTAS GESTIÓN DE PRODUCTOS (PANEL ADMIN)
router.get("/admin/products", authenticateToken, authorizeRoles("admin"), viewsController.productsView);
router.get("/admin/orders", authenticateToken, authorizeRoles("admin"), viewsController.getAdminOrdersView);

export default router;