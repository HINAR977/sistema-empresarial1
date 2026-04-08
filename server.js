<<<<<<< HEAD
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

/* =========================
   CONFIGURACIÓN
========================= */
const MODO_APIDOG = true; // true = Apidog, false = Producción real
const DB_PATH = path.join(__dirname, 'db.json');

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());

/* =========================
   BASE DE DATOS EN MEMORIA
========================= */
let db = { usuarios: [], productos: [] };

// Funciones de persistencia
function cargarDB() {
  if (fs.existsSync(DB_PATH)) {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    db = JSON.parse(data);
  }
}

function guardarDB() {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
}

// Cargar datos al iniciar
cargarDB();

/* =========================
   ENDPOINTS USUARIOS
========================= */

// GET /api/usuarios
app.get('/api/usuarios', (req, res) => {
  res.json(db.usuarios);
});

// POST /api/usuarios
app.post('/api/usuarios', (req, res) => {
  const { usuario, contrasena, area, privilegio } = req.body;

  if (!MODO_APIDOG) {
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

  db.usuarios.push(nuevo);
  guardarDB();

  if (MODO_APIDOG) {
    return res.status(201).send();
  } else {
    return res.status(201).json({ mensaje: "Usuario creado correctamente", usuario: nuevo });
  }
});

// DELETE /api/usuarios/:id
app.delete('/api/usuarios/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const existe = db.usuarios.find(u => u.id === id);

  if (!existe) return res.status(404).json({ error: "Usuario no encontrado" });

  db.usuarios = db.usuarios.filter(u => u.id !== id);
  guardarDB();
  res.json({ mensaje: "Usuario eliminado correctamente" });
});

// DELETE /api/usuarios - todos los usuarios (modo Apidog)
app.delete('/api/usuarios', (req, res) => {
  if (MODO_APIDOG) {
    db.usuarios = [];
    guardarDB();
    return res.status(200).send();
  } else {
    return res.status(404).json({ error: "ID obligatorio para eliminar usuario" });
  }
});

/* =========================
   ENDPOINTS CONTROL DE MERCANCÍAS
========================= */

// POST /api/entrada-mercancias
app.post('/api/entrada-mercancias', (req, res) => {
  const { codigo_producto, nombre, cantidad, proveedor, fecha_entrada } = req.body;

  if (!MODO_APIDOG) {
    if (!codigo_producto || !nombre || !cantidad || !proveedor || !fecha_entrada) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }
  }

  let producto = db.productos.find(p => p.codigo_producto === codigo_producto);

  if (!producto) {
    producto = {
      codigo_producto,
      nombre,
      proveedor,
      stock: cantidad || 0,
      entradas: [{ cantidad: cantidad || 0, fecha: fecha_entrada }]
    };
    db.productos.push(producto);
  } else {
    producto.stock += cantidad || 0;
    producto.entradas.push({ cantidad: cantidad || 0, fecha: fecha_entrada });
  }

  guardarDB();
  return res.status(201).send();
});

// PUT /api/actualizar-stock/:codigo_producto
app.put('/api/actualizar-stock/:codigo_producto', (req, res) => {
  const codigo = req.params.codigo_producto;
  const { cantidad } = req.body;

  const producto = db.productos.find(p => p.codigo_producto === codigo);
  if (!producto) return res.status(404).json({ error: "Producto no encontrado" });

  producto.stock += cantidad;
  if (producto.stock < 0) producto.stock = 0;

  guardarDB();
  return res.status(200).json({ stock_actual: producto.stock });
});

// GET /api/reportes-stock
app.get('/api/reportes-stock', (req, res) => {
  const { producto: codigo } = req.query;

  let resultados = db.productos;
  if (codigo) resultados = resultados.filter(p => p.codigo_producto === codigo);

  const reportes = resultados.map(p => ({
    codigo_producto: p.codigo_producto,
    nombre: p.nombre,
    proveedor: p.proveedor,
    stock: p.stock,
    entradas: p.entradas
  }));

  return res.status(200).json(reportes);
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
=======
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const mysql = require('mysql2');

// Rutas
const mongoUserRoutes = require('./backend/routes/mongoUserRoutes');
const mysqlUserRoutes = require('./backend/routes/mysqlUserRoutes');

const app = express();
app.use(express.json());

// ============================
// 1️⃣ Función para conectar MongoDB
// ============================
const connectMongoDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) return { success: false, error: 'MONGO_URI no definido' };

  try {
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// ============================
// 2️⃣ Función para conectar MySQL
// ============================
const connectMySQL = () => {
  const { MYSQL_HOST, MYSQL_DB, MYSQL_USER, MYSQL_PASS } = process.env;
  if (!MYSQL_HOST || !MYSQL_DB || !MYSQL_USER || !MYSQL_PASS) {
    return { success: false, error: 'Variables de MySQL no definidas' };
  }

  const connection = mysql.createConnection({
    host: MYSQL_HOST,
    user: MYSQL_USER,
    password: MYSQL_PASS,
    database: MYSQL_DB
  });

  return new Promise((resolve) => {
    connection.connect(err => {
      if (err) resolve({ success: false, error: err.message });
      else resolve({ success: true, connection });
    });
  });
};

// ============================
// 3️⃣ Ejecutar ambas conexiones y mostrar resumen
// ============================
const initDatabases = async () => {
  const [mongoResult, mysqlResult] = await Promise.all([
    connectMongoDB(),
    connectMySQL()
  ]);

  console.log('==============================');
  console.log('🔹 Resumen de conexiones:');
  console.log(`MongoDB: ${mongoResult.success ? '✅ Conectado' : '❌ Falló - ' + mongoResult.error}`);
  console.log(`MySQL: ${mysqlResult.success ? '✅ Conectado' : '❌ Falló - ' + mysqlResult.error}`);
  console.log('==============================');

  if (!mongoResult.success || !mysqlResult.success) {
    console.error('❌ Algunas conexiones fallaron. Revisar errores y reiniciar.');
    // Opcional: detener la app si alguna conexión falla
    // process.exit(1);
  }

  return mysqlResult.success ? mysqlResult.connection : null;
};

// ============================
// 4️⃣ Inicializar
// ============================
(async () => {
  const mysqlConnection = await initDatabases();

  // Rutas
  app.use('/api/mongo-users', mongoUserRoutes);
  app.use('/api/mysql-users', mysqlUserRoutes);

  // Ruta raíz
  app.get('/', (req, res) => res.send('API funcionando correctamente'));

  // Puerto
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
})();
>>>>>>> a1f9ec0199b61879a1714df2b65fa3864bb7de4c
