import { Router } from "express";
import { upload } from "../middlewares/upload.middleware.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/upload", authenticateToken, upload.single("file"), (req, res) => {

    if (!req.file) {
        return res.status(400).json({ status: "error", message: "No se adjuntó ningun archivo." });
    }

    res.status(200).json({
        status: "success",
        message: "Archivo subido con éxito",
        data: {
            filename: req.file.filename,
            path: `/uploads/${req.file.filename}`
        }
    });
});

export default router;