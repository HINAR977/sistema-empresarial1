/**
 * Controlador de Usuarios (CRUD)
 */
const UserModel = require('../models/userModel');
const { successResponse, errorResponse } = require('../utils/helpers');

class UserController {
    /**
     * Obtener todos los usuarios
     */
    static async getAll(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const filters = {
                activo: req.query.activo !== undefined ? req.query.activo === 'true' : undefined,
                area_id: req.query.area_id,
                search: req.query.search
            };

            const result = await UserModel.findAll(page, limit, filters);

            return successResponse(res, 200, 'Usuarios obtenidos', result);

        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            return errorResponse(res, 500, 'Error interno del servidor');
        }
    }

    /**
     * Obtener usuario por ID
     */
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const user = await UserModel.findById(id);

            if (!user) {
                return errorResponse(res, 404, 'Usuario no encontrado');
            }

            return successResponse(res, 200, 'Usuario obtenido', { user });

        } catch (error) {
            console.error('Error al obtener usuario:', error);
            return errorResponse(res, 500, 'Error interno del servidor');
        }
    }

    /**
     * Crear nuevo usuario
     */
    static async create(req, res) {
        try {
            const { username, email, password, nombre_completo, area_id, rol_id } = req.body;
            const ipAddress = req.ip;
            const userAgent = req.headers['user-agent'];

            // Verificar si username ya existe
            const existingUsername = await UserModel.findByUsername(username);
            if (existingUsername) {
                return errorResponse(res, 409, 'El nombre de usuario ya está en uso');
            }

            // Verificar si email ya existe
            const existingEmail = await UserModel.findByEmail(email);
            if (existingEmail) {
                return errorResponse(res, 409, 'El email ya está registrado');
            }

            // Crear usuario
            const newUser = await UserModel.create({
                username,
                email,
                password,
                nombre_completo,
                area_id,
                rol_id
            });

            // Log de auditoría
            await UserModel.logAudit(
                req.user.id, 
                'CREAR_USUARIO', 
                'usuarios', 
                newUser.id,
                null,
                { username, email, nombre_completo, area_id, rol_id },
                ipAddress,
                userAgent
            );

            return successResponse(res, 201, 'Usuario creado exitosamente', { user: newUser });

        } catch (error) {
            console.error('Error al crear usuario:', error);
            return errorResponse(res, 500, 'Error interno del servidor');
        }
    }

    /**
     * Actualizar usuario
     */
    static async update(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const ipAddress = req.ip;
            const userAgent = req.headers['user-agent'];

            // Verificar que el usuario existe
            const existingUser = await UserModel.findById(id);
            if (!existingUser) {
                return errorResponse(res, 404, 'Usuario no encontrado');
            }

            // Verificar username único si se está actualizando
            if (updateData.username && updateData.username !== existingUser.username) {
                const usernameExists = await UserModel.findByUsername(updateData.username);
                if (usernameExists) {
                    return errorResponse(res, 409, 'El nombre de usuario ya está en uso');
                }
            }

            // Verificar email único si se está actualizando
            if (updateData.email && updateData.email !== existingUser.email) {
                const emailExists = await UserModel.findByEmail(updateData.email);
                if (emailExists) {
                    return errorResponse(res, 409, 'El email ya está registrado');
                }
            }

            // Actualizar
            const updated = await UserModel.update(id, updateData);

            if (!updated) {
                return errorResponse(res, 400, 'No se realizaron cambios');
            }

            // Log de auditoría
            await UserModel.logAudit(
                req.user.id,
                'ACTUALIZAR_USUARIO',
                'usuarios',
                parseInt(id),
                { username: existingUser.username, email: existingUser.email },
                updateData,
                ipAddress,
                userAgent
            );

            const updatedUser = await UserModel.findById(id);

            return successResponse(res, 200, 'Usuario actualizado exitosamente', { user: updatedUser });

        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            return errorResponse(res, 500, 'Error interno del servidor');
        }
    }

    /**
     * Eliminar usuario (soft delete)
     */
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const ipAddress = req.ip;
            const userAgent = req.headers['user-agent'];

            // No permitir auto-eliminación
            if (parseInt(id) === req.user.id) {
                return errorResponse(res, 400, 'No puedes eliminar tu propia cuenta');
            }

            const existingUser = await UserModel.findById(id);
            if (!existingUser) {
                return errorResponse(res, 404, 'Usuario no encontrado');
            }

            await UserModel.delete(id);

            // Revocar todas las sesiones del usuario eliminado
            await UserModel.revokeAllUserTokens(id);

            // Log de auditoría
            await UserModel.logAudit(
                req.user.id,
                'ELIMINAR_USUARIO',
                'usuarios',
                parseInt(id),
                { username: existingUser.username, email: existingUser.email },
                null,
                ipAddress,
                userAgent
            );

            return successResponse(res, 200, 'Usuario eliminado exitosamente');

        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            return errorResponse(res, 500, 'Error interno del servidor');
        }
    }
}

module.exports = UserController;