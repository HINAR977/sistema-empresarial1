import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization;
    if(!token) return res.status(401).json({ msg: "No autorizado" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;

        const user = await User.findById(req.userId);
        if(!user) return res.status(401).json({ msg: "Usuario no encontrado" });

        req.userRole = user.role;
        next();
    } catch {
        res.status(401).json({ msg: "Token inválido" });
    }
};