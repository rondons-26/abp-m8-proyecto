import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const User = sequelize.define("User", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true, 
    },
    firstname: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: { msg: "El nombre no puede estar vacío" },
        },
    },
    lastname: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: { msg: "El apellido no puede estar vacío" },
        },
    },
    email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: { msg: "Debe ingresar un correo electrónico válido" },
        },
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: { msg: "La contraseña no puede estar vacía" },
        },
    },
    role: {
        type: DataTypes.ENUM("admin", "cliente"),
        defaultValue: "cliente",
        allowNull: false,
    },
    rut: {
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: true,
        validate: {
            notEmpty: { msg: "El RUT no puede estar vacío si se proporciona" }
        }
    },
    phone: {
        type: DataTypes.STRING(12),
        allowNull: true,
    },
    region: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    commune: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    address: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    profileImage: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
}, {
    tableName: "users",
    timestamps: true,
});

export default User;