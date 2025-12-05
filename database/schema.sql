-- ============================================
-- SISTEMA EMPRESARIAL - ESQUEMA DE BASE DE DATOS
-- ============================================

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS sistema_empresarial
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE sistema_empresarial;

-- ============================================
-- TABLA: areas
-- ============================================
CREATE TABLE IF NOT EXISTS areas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Insertar áreas predeterminadas
INSERT INTO areas (nombre, descripcion) VALUES
('Administración', 'Área de administración general'),
('Bodega', 'Área de almacén y bodega'),
('Contabilidad', 'Área de contabilidad y finanzas'),
('Ventas', 'Área de ventas y comercial');

-- ============================================
-- TABLA: roles
-- ============================================
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    permisos JSON,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Insertar roles predeterminados
INSERT INTO roles (nombre, permisos, descripcion) VALUES
('admin', '{"usuarios": ["crear", "leer", "actualizar", "eliminar"], "reportes": ["leer"], "configuracion": ["leer", "actualizar"]}', 'Administrador del sistema'),
('supervisor', '{"usuarios": ["leer"], "reportes": ["leer"]}', 'Supervisor de área'),
('empleado', '{"reportes": ["leer"]}', 'Empleado regular');

-- ============================================
-- TABLA: usuarios
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(150),
    area_id INT,
    rol_id INT DEFAULT 3,
    activo BOOLEAN DEFAULT TRUE,
    ultimo_login TIMESTAMP NULL,
    intentos_fallidos INT DEFAULT 0,
    bloqueado_hasta TIMESTAMP NULL,
    token_reset_password VARCHAR(255) NULL,
    token_reset_expira TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE SET NULL,
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE SET NULL,
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_activo (activo)
) ENGINE=InnoDB;

-- ============================================
-- TABLA: sesiones (para JWT refresh tokens)
-- ============================================
CREATE TABLE IF NOT EXISTS sesiones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    refresh_token VARCHAR(500) NOT NULL,
    user_agent VARCHAR(255),
    ip_address VARCHAR(45),
    expira_en TIMESTAMP NOT NULL,
    revocado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    
    INDEX idx_refresh_token (refresh_token(100)),
    INDEX idx_usuario_id (usuario_id)
) ENGINE=InnoDB;

-- ============================================
-- TABLA: logs_auditoria
-- ============================================
CREATE TABLE IF NOT EXISTS logs_auditoria (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    accion VARCHAR(50) NOT NULL,
    tabla_afectada VARCHAR(50),
    registro_id INT,
    datos_anteriores JSON,
    datos_nuevos JSON,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_accion (accion),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- ============================================
-- USUARIO ADMINISTRADOR INICIAL
-- Password: Admin@123456 (hasheado con bcrypt)
-- ============================================
INSERT INTO usuarios (username, email, password_hash, nombre_completo, area_id, rol_id) VALUES
('adminUser', 'admin@empresa.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.W4JqGqQqQqQqQq', 'Administrador del Sistema', 1, 1);

-- ============================================
-- PROCEDIMIENTOS ALMACENADOS
-- ============================================

-- Procedimiento para limpiar sesiones expiradas
DELIMITER //
CREATE PROCEDURE limpiar_sesiones_expiradas()
BEGIN
    DELETE FROM sesiones WHERE expira_en < NOW() OR revocado = TRUE;
END //
DELIMITER ;

-- Procedimiento para desbloquear usuarios
DELIMITER //
CREATE PROCEDURE desbloquear_usuarios()
BEGIN
    UPDATE usuarios 
    SET intentos_fallidos = 0, bloqueado_hasta = NULL 
    WHERE bloqueado_hasta < NOW();
END //
DELIMITER ;

-- Evento para ejecutar limpieza cada hora
CREATE EVENT IF NOT EXISTS evento_limpieza_sesiones
ON SCHEDULE EVERY 1 HOUR
DO CALL limpiar_sesiones_expiradas();

CREATE EVENT IF NOT EXISTS evento_desbloqueo_usuarios
ON SCHEDULE EVERY 5 MINUTE
DO CALL desbloquear_usuarios();