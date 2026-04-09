# 🏢 Sistema Empresarial

Sistema de gestión empresarial web que integra módulos de administración, bodega, catálogo, contabilidad y ventas.

---

## 📋 Descripción

Este proyecto es una aplicación web empresarial construida con HTML, CSS, JavaScript y un backend en Node.js. Permite gestionar las principales áreas operativas de una empresa desde una interfaz centralizada.

---

## 🧩 Módulos

| Módulo         | Descripción                                      |
|----------------|--------------------------------------------------|
| 🔐 Login        | Autenticación y acceso al sistema                |
| 📊 Dashboard    | Panel principal con resumen general              |
| 👥 Administración | Gestión de usuarios y configuración            |
| 📦 Bodega       | Control de inventario y existencias              |
| 🛍️ Catálogo     | Gestión de productos y servicios                 |
| 💰 Contabilidad | Registro y seguimiento financiero                |
| 🧾 Ventas       | Registro y control de ventas                     |

---

## 🛠️ Tecnologías utilizadas

- **Frontend:** HTML5, CSS3, JavaScript
- **Backend:** Node.js
- **API:** REST (documentada en `openapi.json`)
- **Otros:** Python (scripts auxiliares)

---

## ✅ Requisitos previos

Asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) v18 o superior
- npm (incluido con Node.js)

---

## 🚀 Instalación y ejecución

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/HINAR977/sistema-empresarial1.git
   cd sistema-empresarial1
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

3. **Inicia el servidor:**
   ```bash
   node server.js
   ```

4. **Abre el navegador en:**
   ```
   http://localhost:3000
   ```

---

## 📁 Estructura del proyecto

```
sistema-empresarial1/
├── assets/               # Imágenes y recursos estáticos
├── backend/              # Lógica del servidor y rutas
├── tests/                # Pruebas del sistema
├── index.html            # Página de inicio / login
├── dashboard.html        # Panel principal
├── administracion.html   # Módulo de administración
├── bodega.html           # Módulo de bodega
├── catalogo.html         # Módulo de catálogo
├── contabilidad.html     # Módulo de contabilidad
├── ventas.html           # Módulo de ventas
├── server.js             # Servidor Node.js
├── scripts.js            # Scripts generales del frontend
├── styles.css            # Estilos globales
├── openapi.json          # Documentación de la API REST
└── package.json          # Dependencias del proyecto
```

---

## 🧪 Pruebas

Para ejecutar las pruebas del proyecto:

```bash
npm test
```

---

## 📄 Documentación de la API

La API REST está documentada en el archivo `openapi.json`. Puedes visualizarla usando [Swagger Editor](https://editor.swagger.io/) importando ese archivo.

---

## 👤 Autor

- **HINAR977** — [GitHub](https://github.com/HINAR977)

---

## 📝 Licencia

Este proyecto es de uso académico/personal. Todos los derechos reservados.
