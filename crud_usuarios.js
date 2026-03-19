const API_URL = "http://localhost:3000/api/usuarios";

let usuarios = [];

/* =========================
   CARGAR USUARIOS
========================= */

async function cargarUsuarios() {
  const res = await fetch(API_URL);
  usuarios = await res.json();
  renderTablaUsuarios();
}

/* =========================
   GUARDAR USUARIO
========================= */

async function guardarUsuario() {

  const nuevoUsuario = {
    usuario: document.getElementById('usuario').value.trim(),
    contrasena: document.getElementById('contrasena').value.trim(),
    area: document.getElementById('area').value.trim(),
    privilegio: document.getElementById('privilegios').value
  };

  if (!nuevoUsuario.usuario || !nuevoUsuario.contrasena || 
      !nuevoUsuario.area || !nuevoUsuario.privilegio) {
    alert("Completa todos los campos");
    return;
  }

  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nuevoUsuario)
  });

  closeFormUsuario();
  cargarUsuarios();
}

/* =========================
   ELIMINAR
========================= */

async function eliminarUsuario(id) {

  if (confirm("¿Eliminar usuario?")) {

    await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    });

    cargarUsuarios();
  }
}

/* =========================
   RENDER TABLA
========================= */

function renderTablaUsuarios() {

  const tbody = document.querySelector('#tablaUsuarios tbody');
  tbody.innerHTML = '';

  usuarios.forEach(u => {

    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${u.id}</td>
      <td>${u.usuario}</td>
      <td>${u.contrasena}</td>
      <td>${u.area}</td>
      <td>${u.privilegio}</td>
      <td>
        <button onclick="eliminarUsuario(${u.id})">
          Eliminar
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

/* ========================= */

window.addEventListener('DOMContentLoaded', () => {
  cargarUsuarios();
});