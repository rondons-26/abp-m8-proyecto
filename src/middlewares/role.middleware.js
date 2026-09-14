export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        
        if (!req.user || !allowedRoles.includes(req.user.role)){
            
            if (req.accepts('html')) {
                // SI ES ADMIN, SE ENVIA A SU PANEL
                if (req.user && req.user.role === "admin") {
                    return res.redirect("/admin/dashboard");
                }
                // SI ES CLIENTE O OTRO, SE ENVIA A SU PERFIL
                return res.redirect("/clientProfile");
            }

            return res.status(403).json({
                status: "error",
                message: "Acceso denegado: No posees los permisos necesarios para realizar esta acción."
            });
        }

        next();
    };
};