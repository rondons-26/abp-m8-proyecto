import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Product = sequelize.define("Product", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    sku: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
    },
    description: {
        type: DataTypes.TEXT,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    imageUrl: {
        type: DataTypes.STRING,
        defaultValue: "/uploads/default-product.png",
    },
},{
    tableName: "products",
    timestamps: true,
    hooks: {
        beforeValidate: (product) => {
            if (!product.sku) {
                const randomDigits = Math.floor(10000 + Math.random() * 90000);
                product.sku = `SKU-${randomDigits}`;
            }
        }
    }
});

export default Product;