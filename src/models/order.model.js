import { DataTypes } from "sequelize";
import sequelize from '../config/database.js';

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    orderNumber: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
            notEmpty: { msg: "El número de orden no puede estar vacío" },
            len: { args: [10, 10], msg: "El número de orden debe tener exactamente 10 dígitos" }
        }
    },
    sku: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    product: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
            notEmpty: { msg: "El producto no puede estar vacío" },
        },
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            isInt: { msg: "La cantidad debe ser un número entero" },
            min: { args: [1], msg: "La cantidad debe ser al menos 1" }
        }
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            isDecimal: { msg: "El monto debe ser un número válido" },
            min: { args: [0.01], msg: "El monto debe ser mayor a 0" },
        },
    },
    status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "Procesando",
        validate: {
            notEmpty: { msg: "El estado no puede estar vacío" }
        }
    },
    trackingNumber: {
        type: DataTypes.STRING(15),
        allowNull: true,
    },
    image: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    tableName: "orders",
    timestamps: true,
});

export default Order;