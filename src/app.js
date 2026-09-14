import express from "express";
import { create } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";

// IMPORTACIÓN DE RUTAS
import usersRoutes from "./routes/users.routes.js";
import viewsRoutes from "./routes/views.routes.js";
import authRoutes from "./routes/auth.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import productsRoutes from "./routes/products.routes.js";
import checkoutRoutes from "./routes/checkout.routes.js";

// MIDDLEWARES GLOBALES
import { requestLogger } from "./middlewares/logger.middleware.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// CONFIGURACIÓN HANDLEBARS
const hbs = create({
    helpers: {
        addOne: (index) => index + 1,
        json: (context) => JSON.stringify(context || []),
        formatCLP: (value) => `$${Number(value || 0).toLocaleString("es-CL")}`,
        formatDate: (dateString) => {
            if (!dateString) return "Fecha no disponible";
            const date = new Date(dateString);
            return date.toLocaleString("es-CL", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
        },

        eq: (a, b) => a === b,
        gt: (a, b) => a > b,
        math: (lvalue, operator, rvalue) => {
            lvalue = parseFloat(lvalue);
            rvalue = parseFloat(rvalue);
            return {
                "+": lvalue + rvalue,
                "-": lvalue - rvalue,
                "*": lvalue * rvalue,
                "/": lvalue / rvalue,
                "%": lvalue % rvalue
            }[operator];
        }
    },
    extname: ".handlebars",
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views/layouts"),
    partialsDir: path.join(__dirname, "views/partials"),
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// MIDDLEWARES GLOBALES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// RUTA ABSOLUTA PARA ARCHIVOS ESTÁTICOS
app.use(express.static(path.join(__dirname, "../public")));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// MIDDLEWARE DE AUDITORÍA Y LOGS
app.use(requestLogger);

// RUTAS VISTAS Y AUTENTICACIÓN
app.use("/", viewsRoutes);
app.use("/api/auth", authRoutes);

// RUTAS RECURSOS PROTEGIDOS / ENTIDADES
app.use("/api/users", usersRoutes);
app.use("/api/products", productsRoutes);
app.use("/api", uploadRoutes);
app.use("/api", checkoutRoutes);

// MANEJO DE RUTAS NO ENCONTRADAS (404)
app.use((req, res) => {
    if (req.originalUrl.startsWith("/api")) {
        return res.status(404).json({
            status: "error",
            message: `La ruta API '${req.originalUrl}' no fue encontrada.`,
        });
    }

    res.status(404).render("notFound", {
        title: "404 - Página no encontrada",
        layout: "error",
    });
});

export default app;