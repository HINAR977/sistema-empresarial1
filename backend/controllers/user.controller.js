import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const createUser = async (req, res) => {
    try {
        const { usuario, password, area, role } = req.body;
        if(role === "admin" && req.userRole !== "admin")
            return res.status(403).json({ msg: "No autorizado" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ usuario, password: hashedPassword, area, role });
        await newUser.save();
        res.json({ msg: "Usuario creado" });
    } catch {
        res.status(500).json({ msg: "Error al crear usuario" });
    }
};

export const getUsers = async (req, res) => {
    const users = await User.find().select("-password");
    res.json(users);
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { usuario, password, area, role } = req.body;
        if(role && role === "admin" && req.userRole !== "admin")
            return res.status(403).json({ msg: "No autorizado" });

        let data = { usuario, area };
        if(password) data.password = await bcrypt.hash(password, 10);
        if(role) data.role = role;

        await User.findByIdAndUpdate(id, data);
        res.json({ msg: "Usuario actualizado" });
    } catch {
        res.status(500).json({ msg: "Error al actualizar" });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if(user.role === "admin" && req.userRole !== "admin")
            return res.status(403).json({ msg: "No autorizado" });

        await User.findByIdAndDelete(id);
        res.json({ msg: "Usuario eliminado" });
    } catch {
        res.status(500).json({ msg: "Error al eliminar" });
    }
};