const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'cambia_este_secreto_en_produccion';

const app = express();

/* =========================
   CONFIGURACIÓN
========================= */
const DB_PATH = path.join(__dirname, 'db.json');
const SALT_ROUNDS = 10;

/* =========================
   MIDDLEWARE
========================= */
// CORS restringido — cambia el origen por tu dominio en producción
app.use(cors({ origin: 'http://localhost:5500' }));
app.use(express.json());

/* =========================
   BASE DE DATOS EN MEMORIA
========================= */
let db = {
  usuarios: [],
  productos: [],
  ventasMongo: [],
  usuariosMongo: [],
  usuariosMySQL: [],
  productosList: [],
  clientesList: []
};

/* =========================
   PERSISTENCIA
========================= */
function cargarDB() {
  if (fs.existsSync(DB_PATH)) {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    db = JSON.parse(data);
  }
}

async function guardarDB() {
  await fs.promises.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
}

// Calcular el próximo ID a partir de los datos existentes (evita colisiones al reiniciar)
function nextId(lista) {
  if (!lista || lista.length === 0) return 1;
  return Math.max(...lista.map(item => item.id || 0)) + 1;
}

cargarDB();

/* =========================
   VALIDACIÓN GENÉRICA
========================= */
function validarCampos(body, campos) {
  const errores = [];
  campos.forEach(campo => {
    if (body[campo] === undefined || body[campo] === null || body[campo] === '') {
      errores.push(`${campo} es obligatorio`);
    }
  });
  return errores;
}

/* =========================
   AUTENTICACIÓN
========================= */

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { usuario, password } = req.body;
  if (!usuario || !password)
    return res.status(400).json({ error: "Usuario y contraseña son obligatorios" });

  const user = db.usuarios.find(u => u.usuario === usuario);
  if (!user) return res.status(401).json({ error: "Credenciales incorrectas" });

  const coincide = await bcrypt.compare(password, user.contrasena);
  if (!coincide) return res.status(401).json({ error: "Credenciales incorrectas" });

  const token = jwt.sign(
    { id: user.id, usuario: user.usuario, privilegio: user.privilegio },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  return res.json({ token, usuario: user.usuario, privilegio: user.privilegio });
});

// Middleware para proteger rutas (úsalo cuando quieras asegurar endpoints)
function autenticar(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer '))
    return res.status(401).json({ error: "Token requerido" });

  try {
    req.user = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

/* =========================
   ENDPOINTS USUARIOS
========================= */

// GET /api/usuarios — nunca devuelve la contraseña
app.get('/api/usuarios', (req, res) => {
  const seguros = db.usuarios.map(({ contrasena, ...resto }) => resto);
  res.json(seguros);
});

// POST /api/usuarios
app.post('/api/usuarios', async (req, res) => {
  const { usuario, contrasena, area, privilegio } = req.body;

  if (!usuario || !contrasena || !area || !privilegio) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  const hash = await bcrypt.hash(contrasena, SALT_ROUNDS);

  const nuevo = {
    id: nextId(db.usuarios),
    usuario,
    contrasena: hash,
    area,
    privilegio
  };

  db.usuarios.push(nuevo);
  await guardarDB();

  const { contrasena: _, ...usuarioSeguro } = nuevo;
  return res.status(201).json({ mensaje: "Usuario creado correctamente", usuario: usuarioSeguro });
});

// PUT /api/usuarios/:id — editar usuario
app.put('/api/usuarios/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const index = db.usuarios.findIndex(u => u.id === id);

  if (index === -1) return res.status(404).json({ error: "Usuario no encontrado" });

  const { usuario, contrasena, area, privilegio } = req.body;
  const actual = db.usuarios[index];

  db.usuarios[index] = {
    ...actual,
    usuario: usuario || actual.usuario,
    area: area || actual.area,
    privilegio: privilegio || actual.privilegio,
    contrasena: contrasena ? await bcrypt.hash(contrasena, SALT_ROUNDS) : actual.contrasena
  };

  await guardarDB();

  const { contrasena: _, ...usuarioSeguro } = db.usuarios[index];
  return res.json({ mensaje: "Usuario actualizado", usuario: usuarioSeguro });
});

// DELETE /api/usuarios/:id
app.delete('/api/usuarios/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const existe = db.usuarios.find(u => u.id === id);

  if (!existe) return res.status(404).json({ error: "Usuario no encontrado" });

  db.usuarios = db.usuarios.filter(u => u.id !== id);
  await guardarDB();
  res.json({ mensaje: "Usuario eliminado correctamente" });
});

/* =========================
   ENDPOINTS USUARIOS MONGODB / MYSQL
========================= */

// POST Crear usuario MongoDB
app.post('/api/usuarios/mongodb', async (req, res) => {
  const errores = validarCampos(req.body, ['usuario', 'contrasena', 'email']);
  if (errores.length) return res.status(400).json({ errores });

  const nuevo = {
    id: nextId(db.usuariosMongo),
    usuario: req.body.usuario,
    contrasena: await bcrypt.hash(req.body.contrasena, SALT_ROUNDS),
    email: req.body.email,
  };
  db.usuariosMongo.push(nuevo);
  await guardarDB();

  const { contrasena: _, ...seguro } = nuevo;
  return res.status(201).json({ mensaje: "Usuario MongoDB creado", usuario: seguro });
});

// POST Crear usuario MySQL
app.post('/api/usuarios/mysql', async (req, res) => {
  const errores = validarCampos(req.body, ['usuario', 'contrasena', 'email']);
  if (errores.length) return res.status(400).json({ errores });

  const nuevo = {
    id: nextId(db.usuariosMySQL),
    usuario: req.body.usuario,
    contrasena: await bcrypt.hash(req.body.contrasena, SALT_ROUNDS),
    email: req.body.email,
  };
  db.usuariosMySQL.push(nuevo);
  await guardarDB();

  const { contrasena: _, ...seguro } = nuevo;
  return res.status(201).json({ mensaje: "Usuario MySQL creado", usuario: seguro });
});

// DELETE Eliminar usuario MongoDB
app.delete('/api/usuarios/mongodb/:id', async (req, res) => {
  const id = Number(req.params.id);
  const index = db.usuariosMongo.findIndex(u => u.id === id);
  if (index === -1) return res.status(404).json({ error: "Usuario MongoDB no encontrado" });

  db.usuariosMongo.splice(index, 1);
  await guardarDB();
  return res.json({ mensaje: "Usuario MongoDB eliminado" });
});

// DELETE Eliminar usuario MySQL
app.delete('/api/usuarios/mysql/:id', async (req, res) => {
  const id = Number(req.params.id);
  const index = db.usuariosMySQL.findIndex(u => u.id === id);
  if (index === -1) return res.status(404).json({ error: "Usuario MySQL no encontrado" });

  db.usuariosMySQL.splice(index, 1);
  await guardarDB();
  return res.json({ mensaje: "Usuario MySQL eliminado" });
});

/* =========================
   ENDPOINTS VENTAS
========================= */

// POST Crear venta
app.post('/api/ventas/mongodb', async (req, res) => {
  const errores = validarCampos(req.body, ['usuarioId', 'productoId', 'cantidad', 'fecha']);
  if (errores.length) return res.status(400).json({ errores });

  const usuario = db.usuariosMongo.find(u => u.id === Number(req.body.usuarioId));
  if (!usuario) return res.status(404).json({ error: "Usuario MongoDB no encontrado" });

  const venta = {
    id: nextId(db.ventasMongo),
    usuarioId: Number(req.body.usuarioId),
    productoId: req.body.productoId,
    cantidad: Number(req.body.cantidad),
    fecha: req.body.fecha
  };
  db.ventasMongo.push(venta);
  await guardarDB();
  return res.status(201).json({ mensaje: "Venta creada", venta });
});

// GET Listar ventas
app.get('/api/ventas', (req, res) => res.json(db.ventasMongo));

// GET Reportes ventas
app.get('/api/reportes/ventas', (req, res) => res.json(db.ventasMongo));

/* =========================
   ENDPOINTS PRODUCTOS / CLIENTES
========================= */

app.get('/api/productos', (req, res) => res.json(db.productosList));
app.get('/api/clientes', (req, res) => res.json(db.clientesList));

/* =========================
   ENDPOINTS BODEGA
========================= */

// POST /api/entrada-mercancias
app.post('/api/entrada-mercancias', async (req, res) => {
  const { codigo_producto, nombre, cantidad, proveedor, fecha_entrada } = req.body;

  if (!codigo_producto || !nombre || !cantidad || !proveedor || !fecha_entrada) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  let producto = db.productos.find(p => p.codigo_producto === codigo_producto);

  if (!producto) {
    producto = {
      codigo_producto,
      nombre,
      proveedor,
      stock: cantidad,
      entradas: [{ cantidad, fecha: fecha_entrada }]
    };
    db.productos.push(producto);
  } else {
    producto.stock += cantidad;
    producto.entradas.push({ cantidad, fecha: fecha_entrada });
  }

  await guardarDB();
  return res.status(201).json({ mensaje: "Mercancía registrada", producto });
});

// PUT /api/actualizar-stock/:codigo_producto
app.put('/api/actualizar-stock/:codigo_producto', async (req, res) => {
  const codigo = req.params.codigo_producto;
  const { cantidad } = req.body;

  if (cantidad === undefined) return res.status(400).json({ error: "cantidad es obligatoria" });

  const producto = db.productos.find(p => p.codigo_producto === codigo);
  if (!producto) return res.status(404).json({ error: "Producto no encontrado" });

  producto.stock = Math.max(0, producto.stock + cantidad);

  await guardarDB();
  return res.status(200).json({ stock_actual: producto.stock });
});

// GET /api/reportes-stock
app.get('/api/reportes-stock', (req, res) => {
  const { producto: codigo } = req.query;
  let resultados = db.productos;
  if (codigo) resultados = resultados.filter(p => p.codigo_producto === codigo);

  return res.status(200).json(resultados.map(p => ({
    codigo_producto: p.codigo_producto,
    nombre: p.nombre,
    proveedor: p.proveedor,
    stock: p.stock,
    entradas: p.entradas
  })));
});

/* =========================
   RUTA BASE
========================= */
app.get('/', (req, res) => res.send("API funcionando correctamente 🚀"));

/* =========================
   SERVIDOR
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});