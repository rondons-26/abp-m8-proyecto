import { Router } from "express";
import { getUsers, getUserById, createUser, updateUser, deleteUser, createUserWithOrder } from "../controllers/users.controllers.js";
import { getClientProfileData, updateClientProfile } from "../controllers/views.controllers.js";
import { validateBody } from "../middlewares/validateBody.middleware.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

// RUTAS CONSULTAS PÚBLICAS
router.get("/", getUsers);

// RUTA PARA OBTENER EL PERFIL DEL USUARIO LOGUEADO
router.get("/profile", authenticateToken, getClientProfileData);
router.get("/:id", getUserById);

// RUTAS PROTEGIDAS CON JWT
router.post("/", authenticateToken, validateBody, createUser);
router.put("/profile", authenticateToken, upload.single('profileImage'), updateClientProfile);
router.put("/:id", authenticateToken, updateUser);
router.delete("/:id", authenticateToken, deleteUser);

// RUTA ESPECIAL PARA VALIDAR TRANSACCIONES (PROTEGIDA)
router.post("/transaction", authenticateToken, createUserWithOrder);

export default router;