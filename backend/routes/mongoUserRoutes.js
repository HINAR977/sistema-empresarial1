const express = require('express');
const router = express.Router();
const UserMongo = require('../models/UserMongo'); // Modelo de MongoDB

// =====================
// CRUD completo
// =====================

// GET: Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const users = await UserMongo.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener usuarios', error: err.message });
  }
});

// GET: Obtener un usuario por ID
router.get('/:id', async (req, res) => {
  try {
    const user = await UserMongo.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener usuario', error: err.message });
  }
});

// POST: Crear un usuario
router.post('/', async (req, res) => {
  try {
    const newUser = new UserMongo(req.body);
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear usuario', error: err.message });
  }
});

// PUT: Actualizar un usuario por ID
router.put('/:id', async (req, res) => {
  try {
    const updatedUser = await UserMongo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // devuelve el documento actualizado
    );
    if (!updatedUser) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar usuario', error: err.message });
  }
});

// DELETE: Eliminar un usuario por ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedUser = await UserMongo.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar usuario', error: err.message });
  }
});

module.exports = router;
