import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import moment from "moment";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDirPath = path.join(__dirname, "../../logs");
const logFilePath = path.join(logsDirPath, "log.txt");

export const requestLogger = async (req, res, next) => {
    const timestamp = moment().format("YYYY-MM-DD HH:mm:ss");
    const logEntry = `[${timestamp}] | METODO: ${req.method} | RUTA: ${req.originalUrl}\n`;

    try {
        // SE ASEGURA EXISTENCIA DEL DIRECTORIO /logs
        await fs.mkdir(logsDirPath, { recursive: true });
    
        // REGISTRAR EL ACCESO MEDIANTE appendFile
        await fs.appendFile(logFilePath, logEntry, "utf-8");

    } catch (error) {
        console.error("Error al escribir el registro en log.txt:", error);
    }

    next();
};