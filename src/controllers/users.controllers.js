import bcrypt from "bcrypt";
import UsersService from "../services/users.service.js";
import { handleSequelizeError } from "../utils/errorHandler.js";
import { User } from "../models/index.js";

// GET /api/users - OBTENER TODOS LOS USUARIOS (PEDIDOS INCLUIDOS)
export const getUsers = async (req, res) => {
    try {
        const users = await UsersService.getAllUsers();
        res.status(200).json({
            status: "success",
            message: "Usuarios obtenidos con éxito",
            data: users
        });

    } catch (error) {
        console.error("Error en getUsers:", error);
        res.status(500).json({
            status: "error",
            message: "Error al obtener la lista de usuarios"
        });
    }
};

// GET /api/users/:id - OBTENER USUARIO POR ID
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await UsersService.getUserById(id);

        if (!user) {
            return res.status(404).json({
                status: "fail",
                message: "El usuario solicitado no existe"
            });
        }

        res.status(200).json({
            status: "success",
            message: "Usuario encontrado",
            data: user
        });

    } catch (error) {
        console.error("Error en getUserById:", error);
        res.status(500).json({
            status: "error",
            message: "Error al buscar usuario",
        });
    }
};

// POST /api/users - CREAR UN USUARIO
export const createUser = async (req, res) => {
    try {
        const { firstname, lastname, email, password, role } = req.body;

        const allowedRoles = ["admin", "cliente"];
        const targetRole = role ? role.toString().toLowerCase() : "cliente";
        const assignedRole = allowedRoles.includes(targetRole) ? targetRole : "cliente";

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await UsersService.createUser({
            firstname,
            lastname,
            email,
            password: hashedPassword,
            role: assignedRole
        });

        res.status(201).json({
            status: "success",
            message: "Usuario creado exitosamente",
            data: newUser
        });

    } catch (error) {
        console.error("Error técnico al crear usuario:", error);
        res.status(400).json({
            status: "fail",
            message: handleSequelizeError(error)
        });
    }
};

// PUT /api/users/:id - ACTUALIZAR USUARIO
export const updateUser = async (req, res) => {
    try {
        const userId = (req.path === "/profile" || req.params.id === "profile") 
            ? req.user.id 
            : req.params.id;

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "No se encontró el usuario a actualizar"
            });
        }

        // PROTECCIÓN SI req.body LLEGA VACÍO O NO DEFINIDO
        const body = req.body || {};
        const { firstname, lastname, rut, phone, region, commune, currentPassword, newPassword } = body;

        let profileImage = user.profileImage;
        if (req.file) {
            profileImage = `/uploads/${req.file.filename}`;
        }

        const updateData = {
            firstname: firstname !== undefined && firstname !== "" ? firstname : user.firstname,
            lastname: lastname !== undefined && lastname !== "" ? lastname : user.lastname,
            rut: rut !== undefined ? rut : user.rut,
            phone: phone !== undefined ? phone : user.phone,
            region: region !== undefined ? region : user.region,
            commune: commune !== undefined ? commune : user.commune,
            profileImage
        };

        // LÓGICA VALIDACIÓN Y CAMBIO DE CONTRASEÑA
        if (newPassword && newPassword.trim() !== "") {
            if (!currentPassword) {
                return res.status(400).json({
                    status: "fail",
                    message: "Debes ingresar tu contraseña actual para realizar el cambio."
                });
            }

            // VERIFICAR QUE LA CONTRASEÑE ACTUAL SEA CORRECTA MEDIANTE bcrypt
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({
                    status: "fail",
                    message: "La contraseña actual es incorrecta."
                });
            }

            // GENERA HASH PARA LA NUEVA CONTRASEÑA
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(newPassword, salt);
        }

        await user.update(updateData);

        return res.status(200).json({
            status: "success",
            message: "Perfil actualizado con éxito",
            user: {
                id: user.id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                role: user.role,
                rut: user.rut,
                phone: user.phone,
                region: user.region,
                commune: user.commune,
                profileImage: user.profileImage
            }
        });

    } catch (error) {
        console.error("Error técnico al actualizar usuario:", error);
        return res.status(500).json({
            status: "error",
            message: "Error técnico al actualizar usuario"
        });
    }
};

// DELETE /api/users/:id - ELIMINAR USUARIO
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await UsersService.deleteUser(id);

        if (!deleted) {
            return res.status(400).json({
                status: "fail",
                message: "No se encontró el usuario a eliminar"
            });
        }

        res.status(200).json({
            status: "success",
            message: "Usuario eliminado exitosamente"
        });

    } catch (error) {
        console.error("Error técnico al eliminar usuario:", error);
        res.status(500).json({
            status: "error",
            message: "Error al intentar eliminar el usuario",
        });
    }
};

// POST /api/users/transaction - PRUEBA DE TRANSACCIÓN
export const createUserWithOrder = async (req, res) => {
    try {
        const { user, userId, order } = req.body;
        const orderData = order ? { ...order, quantity: order.quantity || 1 } : null;
        const userData = user || (userId ? { id: userId } : null);
        const result = await UsersService.createUserWithOrderTransaction(userData, orderData);

        res.status(201).json({
            status: "success",
            message: "Transacción completada: Usuario y pedido procesados con éxito",
            data: result
        });

    } catch (error) {
        console.error("Error técnico en transacción:", error);
        res.status(400).json({
            status: "fail",
            message: handleSequelizeError(error)
        });
    }
};

// GET /users - RENDERIZAR VISTA DE ADMINISTRADORES
export const listUsersView = async (req, res) => {
    try {
        const rawUsers = await UsersService.getAllUsers();

        // SE FILTRA GARANTIZANDO QUE SOLO PASEN USUARIOS CON ROL 'admin'
        const adminsOnly = rawUsers
        .map((u) => (typeof u.get === "function" ? u.get({ plain: true }) : u))
        .filter((user) => user.role && user.role.toString().toLowerCase() === "admin");

        res.render("listUsers", {
            title: "Directorio de Administradores",
            users: adminsOnly,
            activeUsers: true
        });
    } catch (error) {
        console.error("Error al listar administradores:", error);
        res.status(500).redirect("/dashboard");
    }
};