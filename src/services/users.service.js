import { User, Order, sequelize } from "../models/index.js";

class UsersService {
    // 1. OBTENER SOLO ADMINISTRADORES
    static async getAllUsers() {
        return await User.findAll({
            where: { role: "admin" },
            include: [{ model: Order, as: "pedidos" }],
            attributes: { exclude: ["createdAt", "updatedAt"] }
        });
    }

    // 2. OBTENER USUARIO POR ID
    static async getUserById(id) {
        return await User.findByPk(id, {
            include: [{ model: Order, as: "pedidos" }]
        });
    }

    // 3. CREAR USUARIO (CON ROL GARANTIZADO)
    static async createUser(data) {
        // SI EL RON NO SE ESPECIFICA O ESTA VACÍO 'CLIENTE' ES ASIGNADO POR DEFECTO
        const role = data.role ? data.role.toLowerCase() : "cliente";
        return await User.create({ ...data, role });
    }

    // 4. ACTUALIZAR USUARIO
    static async updateUser(id, data) {
        const user = await User.findByPk(id);
        if (!user) return null;
        return await user.update(data);
    }

    // 5. ELIMINAR USUARIO
    static async deleteUser(id) {
        const user = await User.findByPk(id);
        if (!user) return null;
        await user.destroy();
        return true;
    }

    // 6. TRANSACCIÓN ATÓMICA (FORZANDO ROL CLIENTE)
    static async createUserWithOrderTransaction(userData, orderData) {
        const t = await sequelize.transaction();

        try {
            let user;

            if (userData && (userData.id || userData.userId)) {
                const id = userData.id || userData.userId;
                user = await User.findByPk(id, { transaction: t });
                if (!user) throw new Error("El usuario especificado no existe");

            } else if (userData && userData.firstname) {
                const cleanUserData = {
                    ...userData,
                    role: userData.role || "cliente"
                };
                user = await User.create(cleanUserData, { transaction: t });
            } else {
                throw new Error("Se requieren datos de usuario válidos o un ID existente");
            }

            const formattedOrderData = {
                ...orderData,
                quantity: orderData?.quantity || 1,
                userId: user.id
            };

            const newOrder = await Order.create(formattedOrderData, { transaction: t });

            await t.commit();
            return { user, order: newOrder };

        } catch (error) {
            await t.rollback();
            throw error;
        }
    }
}

export default UsersService;