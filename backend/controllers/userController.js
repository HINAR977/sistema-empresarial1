const UserModel = require('../models/userModel');
const { successResponse, errorResponse } = require('../utils/helpers');
const jwt = require('jsonwebtoken');
require('dotenv').config();

class UserController {

    static async login(req, res) {
        try {
            const { username, password } = req.body;
            const user = await UserModel.findByUsername(username);
            if (!user) return errorResponse(res, 401, 'Usuario o contraseña incorrecta');

            const valid = await UserModel.verifyPassword(password, user.password_hash);
            if (!valid) {
                await UserModel.incrementFailedAttempts(user.id);
                return errorResponse(res, 401, 'Usuario o contraseña incorrecta');
            }

            if (user.bloqueado_hasta && new Date(user.bloqueado_hasta) > new Date()) {
                return errorResponse(res, 403, `Usuario bloqueado hasta ${user.bloqueado_hasta}`);
            }

            await UserModel.updateLastLogin(user.id);

            const payload = { id: user.id, username: user.username, rol_nombre: user.rol_nombre };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
            const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });

            await UserModel.saveRefreshToken(user.id, refreshToken, req.headers['user-agent'], req.ip, 7);

            successResponse(res, { token, refreshToken });
        } catch (err) {
            console.error(err);
            errorResponse(res);
        }
    }

    static async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) return errorResponse(res, 401, 'Refresh token requerido');

            const session = await UserModel.verifyRefreshToken(refreshToken);
            if (!session) return errorResponse(res, 401, 'Refresh token inválido o expirado');

            const payload = { id: session.usuario_id, username: session.username, rol_nombre: session.rol_nombre };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

            successResponse(res, { token });
        } catch (err) {
            console.error(err);
            errorResponse(res);
        }
    }

    static async getAllUsers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const filters = {
                activo: req.query.activo,
                area_id: req.query.area_id,
                search: req.query.search
            };
            const data = await UserModel.findAll(page, limit, filters);
            successResponse(res, data);
        } catch (err) {
            console.error(err);
            errorResponse(res);
        }
    }

    static async getUserById(req, res) {
        try {
            const user = await UserModel.findById(req.params.id);
            if (!user) return errorResponse(res, 404, 'Usuario no encontrado');
            successResponse(res, user);
        } catch (err) {
            console.error(err);
            errorResponse(res);
        }
    }

    static async createUser(req, res) {
        try {
            const user = await UserModel.create(req.body);
            successResponse(res, user, 'Usuario creado correctamente', 201);
        } catch (err) {
            console.error(err);
            errorResponse(res);
        }
    }

    static async updateUser(req, res) {
        try {
            const updated = await UserModel.update(req.params.id, req.body);
            if (!updated) return errorResponse(res, 404, 'Usuario no encontrado o sin cambios');
            successResponse(res, null, 'Usuario actualizado correctamente');
        } catch (err) {
            console.error(err);
            errorResponse(res);
        }
    }

    static async deleteUser(req, res) {
        try {
            const deleted = await UserModel.delete(req.params.id);
            if (!deleted) return errorResponse(res, 404, 'Usuario no encontrado');
            successResponse(res, null, 'Usuario desactivado correctamente');
        } catch (err) {
            console.error(err);
            errorResponse(res);
        }
    }
}

module.exports = UserController;
