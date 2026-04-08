import { Router } from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();

router.post("/login", async (req, res) => {
    const { usuario, password } = req.body;
    const user = await User.findOne({ usuario });
    if(!user) return res.json({ msg: "Usuario no encontrado" });

    const match = await bcrypt.compare(password, user.password);
    if(!match) return res.json({ msg: "Contraseña incorrecta" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "2h" });
    res.json({ token, role: user.role });
});

export default router;