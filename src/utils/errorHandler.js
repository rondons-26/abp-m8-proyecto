import { UniqueConstraintError, ValidationError, DatabaseError } from "sequelize";

export const handleSequelizeError = (error) => {
    if (error instanceof UniqueConstraintError || error.name === "SequelizeUniqueConstraintError") {

        const detail = error.parent?.detail || error.original?.detail;
        
        if (detail) {
            const emailMatch = detail.match(/\(email\)=\(([^)]+)\)/);
            if (emailMatch && emailMatch[1]) {
                return `El correo electrónico '${emailMatch[1]}' ya se encuentra registrado. Intenta con otro.`;
            }
        }

        if (error.errors && error.errors.length > 0) {
            const field = error.errors[0]?.path || "campo";
            const value = error.errors[0]?.value || "";
            return `El valor '${value}' para el campo '${field}' ya está registrado.`;
        }

        return "El correo electrónico ingresado ya se encuentra registrado. Por favor, intenta con otro.";
    }

    if (error instanceof ValidationError) {
        if (error.errors && error.errors.length > 0) {
            return error.errors.map(err => err.message).join(", ");
        }
    }

    if (error instanceof DatabaseError || error.parent) {
        if (error.parent?.code === "23505") {
            return "El registro ya existe en la base de datos (clave duplicada).";
        }
        return "Ocurrió un error en la estructura de los datos enviados.";
    }

    return error.message || "Ocurrió un error inesperado al procesar la solicitud.";
};