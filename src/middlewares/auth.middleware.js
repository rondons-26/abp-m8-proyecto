import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
    let token = null;

    const authHeader = req.headers["authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
    } 

    else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {

        if (req.accepts('html')) {
            return res.redirect('/login');
        }
        return res.status(401).json({
            status: "error",
            message: "Acceso denegado: Token no proporcionado."
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key_m8");
        req.user = decoded;
        next();

    } catch (error) {
        // SI EL TOKEN ES INVÁLIDO EN ENVIADO AL LOGIN
        if (req.accepts('html')) {
            return res.redirect('/login');
        }
        return res.status(403).json({
            status: "error",
            message: "Token inválido o expirado."
        });
    }
};