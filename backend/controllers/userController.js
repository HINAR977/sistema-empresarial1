<<<<<<< HEAD
const UserModel = require('../models/userModel');
=======
const User = require('../models/userModel'); // Tu modelo unificado (MongoDB o Mongoose)
>>>>>>> 49b8141f67ec148b68b619cd4fd83c82d3065ef1
const { successResponse, errorResponse } = require('../utils/helpers');
const jwt = require('jsonwebtoken');
require('dotenv').config();

class UserController {
<<<<<<< HEAD

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
=======
    // ----------------------
    // CRUD AVANZADO
    // ----------------------

    // Obtener todos los usuarios con filtros/paginación
    static async getAll(req, res) {
>>>>>>> 49b8141f67ec148b68b619cd4fd83c82d3065ef1
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const filters = {
                activo: req.query.activo,
                area_id: req.query.area_id,
                search: req.query.search
            };
<<<<<<< HEAD
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
=======

            const result = await User.findAll(page, limit, filters);
            return successResponse(res, 200, 'Usuarios obtenidos', result);

        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            return errorResponse(res, 500, 'Error interno del servidor');
        }
    }

    // Obtener usuario por ID
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const user = await User.findById(id);

            if (!user) return errorResponse(res, 404, 'Usuario no encontrado');
            return successResponse(res, 200, 'Usuario obtenido', { user });

        } catch (error) {
            console.error('Error al obtener usuario:', error);
            return errorResponse(res, 500, 'Error interno del servidor');
        }
    }

    // Crear nuevo usuario
    static async create(req, res) {
        try {
            const { username, email, password, nombre_completo, area_id, rol_id } = req.body;
            const ipAddress = req.ip;
            const userAgent = req.headers['user-agent'];

            // Validaciones de unicidad
            const existingUsername = await User.findByUsername(username);
            if (existingUsername) return errorResponse(res, 409, 'El nombre de usuario ya está en uso');

            const existingEmail = await User.findByEmail(email);
            if (existingEmail) return errorResponse(res, 409, 'El email ya está registrado');

            const newUser = await User.create({ username, email, password, nombre_completo, area_id, rol_id });

            // Auditoría
            if (req.user) {
                await User.logAudit(
                    req.user.id,
                    'CREAR_USUARIO',
                    'usuarios',
                    newUser.id,
                    null,
                    { username, email, nombre_completo, area_id, rol_id },
                    ipAddress,
                    userAgent
                );
            }

            return successResponse(res, 201, 'Usuario creado exitosamente', { user: newUser });

        } catch (error) {
            console.error('Error al crear usuario:', error);
            return errorResponse(res, 500, 'Error interno del servidor');
        }
    }

    // Actualizar usuario
    static async update(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const ipAddress = req.ip;
            const userAgent = req.headers['user-agent'];

            const existingUser = await User.findById(id);
            if (!existingUser) return errorResponse(res, 404, 'Usuario no encontrado');

            if (updateData.username && updateData.username !== existingUser.username) {
                const usernameExists = await User.findByUsername(updateData.username);
                if (usernameExists) return errorResponse(res, 409, 'El nombre de usuario ya está en uso');
            }

            if (updateData.email && updateData.email !== existingUser.email) {
                const emailExists = await User.findByEmail(updateData.email);
                if (emailExists) return errorResponse(res, 409, 'El email ya está registrado');
            }

            const updated = await User.update(id, updateData);
            if (!updated) return errorResponse(res, 400, 'No se realizaron cambios');

            if (req.user) {
                await User.logAudit(
                    req.user.id,
                    'ACTUALIZAR_USUARIO',
                    'usuarios',
                    parseInt(id),
                    { username: existingUser.username, email: existingUser.email },
                    updateData,
                    ipAddress,
                    userAgent
                );
            }

            const updatedUser = await User.findById(id);
            return successResponse(res, 200, 'Usuario actualizado exitosamente', { user: updatedUser });

        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            return errorResponse(res, 500, 'Error interno del servidor');
        }
    }

    // Eliminar usuario (soft delete)
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const ipAddress = req.ip;
            const userAgent = req.headers['user-agent'];

            if (req.user && parseInt(id) === req.user.id)
                return errorResponse(res, 400, 'No puedes eliminar tu propia cuenta');

            const existingUser = await User.findById(id);
            if (!existingUser) return errorResponse(res, 404, 'Usuario no encontrado');

            await User.delete(id);
            await User.revokeAllUserTokens(id);

            if (req.user) {
                await User.logAudit(
                    req.user.id,
                    'ELIMINAR_USUARIO',
                    'usuarios',
                    parseInt(id),
                    { username: existingUser.username, email: existingUser.email },
                    null,
                    ipAddress,
                    userAgent
                );
            }

            return successResponse(res, 200, 'Usuario eliminado exitosamente');

        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            return errorResponse(res, 500, 'Error interno del servidor');
>>>>>>> 49b8141f67ec148b68b619cd4fd83c82d3065ef1
        }
    }

    // ----------------------
    // CRUD SIMPLE (MONGOOSE DIRECTO)
    // ----------------------

    static async getUsersSimple(req, res) {
        try {
            const users = await User.find();
            return successResponse(res, 200, 'Usuarios obtenidos (simple)', users);
        } catch (error) {
            console.error('Error al obtener usuarios simples:', error);
            return errorResponse(res, 500, 'Error interno del servidor');
        }
    }

    static async getUserByIdSimple(req, res) {
        try {
            const user = await User.findById(req.params.id);
            if (!user) return errorResponse(res, 404, 'Usuario no encontrado');
            return successResponse(res, 200, 'Usuario obtenido (simple)', { user });
        } catch (error) {
            console.error('Error al obtener usuario simple:', error);
            return errorResponse(res, 500, 'Error interno del servidor');
        }
    }

    static async createUserSimple(req, res) {
        try {
            const newUser = await User.create(req.body);
            return successResponse(res, 201, 'Usuario creado (simple)', { user: newUser });
        } catch (error) {
            console.error('Error al crear usuario simple:', error);
            return errorResponse(res, 500, 'Error interno del servidor');
        }
    }

    static async updateUserSimple(req, res) {
        try {
            const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updatedUser) return errorResponse(res, 404, 'Usuario no encontrado');
            return successResponse(res, 200, 'Usuario actualizado (simple)', { user: updatedUser });
        } catch (error) {
            console.error('Error al actualizar usuario simple:', error);
            return errorResponse(res, 500, 'Error interno del servidor');
        }
    }

    static async deleteUserSimple(req, res) {
        try {
            const deletedUser = await User.findByIdAndDelete(req.params.id);
            if (!deletedUser) return errorResponse(res, 404, 'Usuario no encontrado');
            return successResponse(res, 200, 'Usuario eliminado (simple)', { user: deletedUser });
        } catch (error) {
            console.error('Error al eliminar usuario simple:', error);
            return errorResponse(res, 500, 'Error interno del servidor');
        }
    }
}

module.exports = UserController;
