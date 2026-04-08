const pool = require('../config/database');
const bcrypt = require('bcrypt');

class UserModel {

    static async findByUsername(username) {
        const [rows] = await pool.execute(
            `SELECT u.*, a.nombre as area_nombre, r.nombre as rol_nombre, r.permisos
             FROM usuarios u
             LEFT JOIN areas a ON u.area_id = a.id
             LEFT JOIN roles r ON u.rol_id = r.id
             WHERE u.username = ?`,
            [username]
        );
        return rows.length ? rows[0] : null;
    }

    static async findById(id) {
        const [rows] = await pool.execute(
            `SELECT u.id, u.username, u.email, u.nombre_completo, u.activo,
                    u.area_id, a.nombre as area_nombre,
                    u.rol_id, r.nombre as rol_nombre, r.permisos,
                    u.created_at, u.updated_at
             FROM usuarios u
             LEFT JOIN areas a ON u.area_id = a.id
             LEFT JOIN roles r ON u.rol_id = r.id
             WHERE u.id = ?`,
            [id]
        );
        return rows.length ? rows[0] : null;
    }

    static async findByEmail(email) {
        const [rows] = await pool.execute(
            'SELECT * FROM usuarios WHERE email = ?',
            [email]
        );
        return rows.length ? rows[0] : null;
    }

    static async findAll(page = 1, limit = 10, filters = {}) {
        const offset = (page - 1) * limit;
        let whereClause = 'WHERE 1=1';
        const params = [];

        if (filters.activo !== undefined) {
            whereClause += ' AND u.activo = ?';
            params.push(filters.activo);
        }

        if (filters.area_id) {
            whereClause += ' AND u.area_id = ?';
            params.push(filters.area_id);
        }

        if (filters.search) {
            whereClause += ' AND (u.username LIKE ? OR u.email LIKE ? OR u.nombre_completo LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        const [countResult] = await pool.execute(
            `SELECT COUNT(*) as total FROM usuarios u ${whereClause}`,
            params
        );
        const total = countResult[0].total;

        const [rows] = await pool.execute(
            `SELECT u.id, u.username, u.email, u.nombre_completo, u.activo,
                    u.area_id, a.nombre as area_nombre,
                    u.rol_id, r.nombre as rol_nombre,
                    u.ultimo_login, u.created_at
             FROM usuarios u
             LEFT JOIN areas a ON u.area_id = a.id
             LEFT JOIN roles r ON u.rol_id = r.id
             ${whereClause}
             ORDER BY u.created_at DESC
             LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        return {
            usuarios: rows,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    static async create(userData) {
        const { username, email, password, nombre_completo, area_id, rol_id } = userData;
        const password_hash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 12);

        const [result] = await pool.execute(
            `INSERT INTO usuarios (username, email, password_hash, nombre_completo, area_id, rol_id)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [username, email, password_hash, nombre_completo, area_id, rol_id || 3]
        );

        return { id: result.insertId, username, email, nombre_completo, area_id, rol_id };
    }

    static async update(id, userData) {
        const fields = [];
        const values = [];

        if (userData.username) { fields.push('username = ?'); values.push(userData.username); }
        if (userData.email) { fields.push('email = ?'); values.push(userData.email); }
        if (userData.nombre_completo) { fields.push('nombre_completo = ?'); values.push(userData.nombre_completo); }
        if (userData.area_id) { fields.push('area_id = ?'); values.push(userData.area_id); }
        if (userData.rol_id) { fields.push('rol_id = ?'); values.push(userData.rol_id); }
        if (userData.activo !== undefined) { fields.push('activo = ?'); values.push(userData.activo); }
        if (userData.password) {
            const password_hash = await bcrypt.hash(userData.password, parseInt(process.env.BCRYPT_ROUNDS) || 12);
            fields.push('password_hash = ?');
            values.push(password_hash);
        }

        if (fields.length === 0) return null;

        values.push(id);

        const [result] = await pool.execute(
            `UPDATE usuarios SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await pool.execute(
            'UPDATE usuarios SET activo = FALSE WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    static async hardDelete(id) {
        const [result] = await pool.execute(
            'DELETE FROM usuarios WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    static async verifyPassword(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    static async updateLastLogin(id) {
        await pool.execute(
            'UPDATE usuarios SET ultimo_login = NOW(), intentos_fallidos = 0 WHERE id = ?',
            [id]
        );
    }

    static async incrementFailedAttempts(id) {
        const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
        const lockMinutes = parseInt(process.env.LOCK_TIME_MINUTES) || 30;

        await pool.execute(
            `UPDATE usuarios 
             SET intentos_fallidos = intentos_fallidos + 1,
                 bloqueado_hasta = CASE 
                     WHEN intentos_fallidos + 1 >= ? THEN DATE_ADD(NOW(), INTERVAL ? MINUTE)
                     ELSE bloqueado_hasta
                 END
             WHERE id = ?`,
            [maxAttempts, lockMinutes, id]
        );
    }

    static async isLocked(id) {
        const [rows] = await pool.execute(
            'SELECT bloqueado_hasta FROM usuarios WHERE id = ? AND bloqueado_hasta > NOW()',
            [id]
        );
        return rows.length ? rows[0].bloqueado_hasta : null;
    }

    static async saveRefreshToken(userId, refreshToken, userAgent, ipAddress, expiresInDays) {
        await pool.execute(
            `INSERT INTO sesiones (usuario_id, refresh_token, user_agent, ip_address, expira_en)
             VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? DAY))`,
            [userId, refreshToken, userAgent, ipAddress, expiresInDays]
        );
    }

    static async verifyRefreshToken(refreshToken) {
        const [rows] = await pool.execute(
            `SELECT s.*, u.username, u.activo
             FROM sesiones s
             JOIN usuarios u ON s.usuario_id = u.id
             WHERE s.refresh_token = ? AND s.revocado = FALSE AND s.expira_en > NOW() AND u.activo = TRUE`,
            [refreshToken]
        );
        return rows.length ? rows[0] : null;
    }

    static async revokeRefreshToken(refreshToken) {
        await pool.execute(
            'UPDATE sesiones SET revocado = TRUE WHERE refresh_token = ?',
            [refreshToken]
        );
    }

    static async revokeAllUserTokens(userId) {
        await pool.execute(
            'UPDATE sesiones SET revocado = TRUE WHERE usuario_id = ?',
            [userId]
        );
    }

    static async logAudit(userId, accion, tablaAfectada, registroId, datosAnteriores, datosNuevos, ipAddress, userAgent) {
        await pool.execute(
            `INSERT INTO logs_auditoria 
             (usuario_id, accion, tabla_afectada, registro_id, datos_anteriores, datos_nuevos, ip_address, user_agent)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, accion, tablaAfectada, registroId, 
             datosAnteriores ? JSON.stringify(datosAnteriores) : null,
             datosNuevos ? JSON.stringify(datosNuevos) : null,
             ipAddress, userAgent]
        );
    }
}

module.exports = UserModel;
