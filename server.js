const express = require('express');
const cors = require('cors');

const app = express();

/* =========================
   CONFIGURACIÓN
========================= */
const MODO_APIDOG = true; // true = Apidog, false = Producción real

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());

/* =========================
   BASE DE DATOS EN MEMORIA
========================= */
let usuarios = [];

/* =========================
   ENDPOINTS USUARIOS
========================= */

/**
 * GET /api/usuarios
 * Devuelve todos los usuarios
 */
app.get('/api/usuarios', (req, res) => {
  res.json(usuarios);
});

/**
 * POST /api/usuarios
 */
app.post('/api/usuarios', (req, res) => {
  const { usuario, contrasena, area, privilegio } = req.body;

  if (!MODO_APIDOG) {
    // Validación producción
    if (!usuario || !contrasena || !area || !privilegio) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }
  }

  const nuevo = {
    id: Date.now(),
    usuario: usuario || null,
    contrasena: contrasena || null,
    area: area || null,
    privilegio: privilegio || null
  };

  usuarios.push(nuevo);

  // Respuesta
  if (MODO_APIDOG) {
    return res.status(201).send(); // 201 sin cuerpo
  } else {
    return res.status(201).json({ mensaje: "Usuario creado correctamente", usuario: nuevo });
  }
});

/**
 * DELETE /api/usuarios/:id
 * Elimina un usuario individual
 */
app.delete('/api/usuarios/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const existe = usuarios.find(u => u.id === id);

  if (!existe) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }

  usuarios = usuarios.filter(u => u.id !== id);
  res.json({ mensaje: "Usuario eliminado correctamente" });
});

/**
 * DELETE /api/usuarios
 * Elimina todos los usuarios (modo Apidog)
 */
app.delete('/api/usuarios', (req, res) => {
  if (MODO_APIDOG) {
    usuarios = [];
    return res.status(200).send(); // 200 sin cuerpo para Apidog
  } else {
    return res.status(404).json({ error: "ID obligatorio para eliminar usuario" });
  }
});

/* =========================
   RUTA BASE DE PRUEBA
========================= */
app.get('/', (req, res) => {
  res.send("API funcionando correctamente 🚀");
});

/* =========================
   SERVIDOR
========================= */
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});