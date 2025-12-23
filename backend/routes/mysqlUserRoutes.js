const express = require('express');
const router = express.Router();
const { UserMySQL } = require('../models/UserMySQL'); // Ajusta según tu exportación real

// GET: obtener todos los usuarios de MySQL
router.get('/', async (req, res) => {
  try {
    const users = await UserMySQL.findAll(); // Sequelize: trae todos los registros
    res.json(users);
  } catch (err) {
    console.error('Error al obtener usuarios MySQL:', err);
    res.status(500).json({ message: 'Error al obtener usuarios MySQL', error: err });
  }
});

// POST: crear un usuario nuevo en MySQL
router.post('/', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const newUser = await UserMySQL.create({ username, password, role });
    res.status(201).json(newUser);
  } catch (err) {
    console.error('Error al crear usuario MySQL:', err);
    res.status(500).json({ message: 'Error al crear usuario MySQL', error: err });
  }
});

// GET: obtener un usuario por id
router.get('/:id', async (req, res) => {
  try {
    const user = await UserMySQL.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    console.error('Error al obtener usuario MySQL:', err);
    res.status(500).json({ message: 'Error al obtener usuario MySQL', error: err });
  }
});

// PUT: actualizar un usuario por id
router.put('/:id', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const user = await UserMySQL.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    await user.update({ username, password, role });
    res.json(user);
  } catch (err) {
    console.error('Error al actualizar usuario MySQL:', err);
    res.status(500).json({ message: 'Error al actualizar usuario MySQL', error: err });
  }
});

// DELETE: eliminar un usuario por id
router.delete('/:id', async (req, res) => {
  try {
    const user = await UserMySQL.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    await user.destroy();
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar usuario MySQL:', err);
    res.status(500).json({ message: 'Error al eliminar usuario MySQL', error: err });
  }
});

module.exports = router;
