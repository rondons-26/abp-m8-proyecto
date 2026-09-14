import sequelize from "../config/database.js";
import User from "./user.model.js";
import Order from "./order.model.js";
import Product from "./product.model.js";

// UN USUARIO TIENE MUCHOS PEDIDOS
User.hasMany(Order, { foreignKey: "userId", as: "pedidos" });
Order.belongsTo(User, { foreignKey: "userId", as: "usuario" });

export { sequelize, User, Order, Product };