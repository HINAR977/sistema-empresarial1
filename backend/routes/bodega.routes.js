const express = require("express");
const router = express.Router();
const db = require("../database");

// Obtener productos
router.get("/", (req, res) => {
  db.query("SELECT * FROM bodega", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// Agregar producto
router.post("/", (req, res) => {
  const { nombre, stock, precio } = req.body;
  db.query(
    "INSERT INTO bodega (nombre, stock, precio) VALUES (?, ?, ?)",
    [nombre, stock, precio],
    () => res.json({ mensaje: "Producto agregado" })
  );
});

module.exports = router;
