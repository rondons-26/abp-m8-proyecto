import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

export const register = async (req, res, next) => {
    try {
        const { firstname, lastname, email, password, role } = req.body;
        if (!firstname || !lastname || !email || !password) {
            return res.status(400).json({ status: "error", message: "Todos los campos son obligatorios." });
        }
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ status: "error", message: "El correo ya está registrado." });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ 
            firstname, lastname, email, password: hashedPassword, role: role || "cliente" 
        });
        res.status(201).json({ status: "success", message: "Usuario registrado con éxito", data: newUser });

    } catch (error) {
        next(error);
    } 
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ status: "error", message: "Credenciales inválidas." });
        }
        
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || "secret_key_m8",
            { expiresIn: "2h" }
        );
        
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 24 * 60 * 60 * 1000 // 1 DÍA DE DURACIÓN
        });

        const redirectUrl = user.role === "admin" ? "/admin/dashboard" : "/clientProfile";
        const displayName = `${user.firstname} ${user.lastname}`;

        res.status(200).json({
            status: "success",
            message: "Autenticación exitosa",
            token,
            data: { id: user.id, name: displayName, email: user.email, role: user.role, redirectUrl }
        });
        
    } catch (error) {
        next(error);
    }
};