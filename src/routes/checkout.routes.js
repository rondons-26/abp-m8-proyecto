import { Router } from "express";
import { processCheckout, getMyOrders, updateOrderStatus } from "../controllers/views.controllers.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();

// RUTA PARA PROCESAR LA COMPRA
router.post("/checkout", authenticateToken, processCheckout);

// RUTA PARA OBTENER LAS COMPRAS DEL USUARIO LOGYEADO (CLIENTE)
router.get("/orders/my-orders", authenticateToken, getMyOrders);
router.put("/orders/:orderNumber/status", authenticateToken, updateOrderStatus);

export default router;