import { Router } from "express";
import multer from "multer";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../controllers/products.controllers.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

// MIDDLEWARE PARA CAPTURAR ERRORES DE MULTER
const handleUpload = (req, res, next) => {
    const uploadSingle = upload.single("image");

    uploadSingle(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ status: "error", message: `Error de carga: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ status: "error", message: err.message });
        }

        next();
    });
};

// ENDPOINT PÚBLICO
router.get("/", getProducts);

// ENDPOINTS ADMINISTRATIVOS (PROTEGIDOS)
router.post("/", authenticateToken, authorizeRoles("admin"), handleUpload, createProduct);

// RUTA PARA ACTUALIZAR
router.put("/:id", authenticateToken, authorizeRoles("admin"), handleUpload, updateProduct);

// RUTA PARA ELIMINAR
router.delete("/:id", authenticateToken, authorizeRoles("admin"), deleteProduct);

export default router;