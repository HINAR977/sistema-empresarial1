const API_URL = "http://localhost:3000/api/usuarios";

let usuarios = [];
let editandoId = null;

/* =========================
   NOTIFICACIÓN VISUAL
========================= */
function mostrarMensaje(texto, tipo = "exito") {
  const msg = document.createElement("div");
  msg.textContent = texto;
  msg.style.cssText = `
    position: fixed; top: 20px; right: 20px; z-index: 9999;
    padding: 12px 20px; border-radius: 6px; font-weight: bold;
    background: ${tipo === "exito" ? "#4caf50" : "#f44336"}; color: white;
  `;
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 3000);
}

/* =========================
   CARGAR USUARIOS
========================= */
async function cargarUsuarios() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`Error ${res.status}`);
    usuarios = await res.json();
    renderTablaUsuarios();
  } catch (err) {
    mostrarMensaje("No se pudo conectar con el servidor", "error");
    console.error(err);
  }
}

/* =========================
   ABRIR FORMULARIO
========================= */
function openFormUsuario(id = null) {
  editandoId = id;

  if (id !== null) {
    const u = usuarios.find(u => u.id === id);
    document.getElementById("tituloFormUsuario").innerText = "Editar Usuario";
    document.getElementById("usuario").value = u.usuario;
    document.getElementById("contrasena").value = "";
    document.getElementById("area").value = u.area;
    document.getElementById("privilegios").value = u.privilegio;
  } else {
    document.getElementById("tituloFormUsuario").innerText = "Nuevo Usuario";
    document.getElementById("usuario").value = "";
    document.getElementById("contrasena").value = "";
    document.getElementById("area").value = "";
    document.getElementById("privilegios").value = "";
  }

  document.getElementById("modalUsuario").style.display = "flex";
}

function closeFormUsuario() {
  editandoId = null;
  document.getElementById("modalUsuario").style.display = "none";
}

/* =========================
   GUARDAR / EDITAR USUARIO
========================= */
async function guardarUsuario() {
  const usuario = document.getElementById("usuario").value.trim();
  const contrasena = document.getElementById("contrasena").value.trim();
  const area = document.getElementById("area").value.trim();
  const privilegio = document.getElementById("privilegios").value;

  // Al editar, la contraseña es opcional
  if (!usuario || (!editandoId && !contrasena) || !area || !privilegio) {
    mostrarMensaje("Completa todos los campos obligatorios", "error");
    return;
  }

  const body = { usuario, area, privilegio };
  if (contrasena) body.contrasena = contrasena;

  try {
    const url = editandoId !== null ? `${API_URL}/${editandoId}` : API_URL;
    const method = editandoId !== null ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) throw new Error(`Error ${res.status}`);

    mostrarMensaje(editandoId ? "Usuario actualizado" : "Usuario creado");
    closeFormUsuario();
    cargarUsuarios();
  } catch (err) {
    mostrarMensaje("Error al guardar el usuario", "error");
    console.error(err);
  }
}

/* =========================
   ELIMINAR USUARIO
========================= */
async function eliminarUsuario(id) {
  if (!confirm("¿Eliminar usuario?")) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Error ${res.status}`);

    mostrarMensaje("Usuario eliminado");
    cargarUsuarios();
  } catch (err) {
    mostrarMensaje("Error al eliminar el usuario", "error");
    console.error(err);
  }
}

/* =========================
   RENDER TABLA
========================= */
function renderTablaUsuarios() {
  const tbody = document.querySelector("#tablaUsuarios tbody");
  tbody.innerHTML = "";

  usuarios.forEach(u => {
    const tr = document.createElement("tr");

    // Se usa textContent para evitar XSS
    const celdas = [u.id, u.usuario, "••••••••", u.area, u.privilegio];
    celdas.forEach(valor => {
      const td = document.createElement("td");
      td.textContent = valor;
      tr.appendChild(td);
    });

    // Celda de acciones
    const tdAcciones = document.createElement("td");

    const btnEditar = document.createElement("button");
    btnEditar.textContent = "Editar";
    btnEditar.onclick = () => openFormUsuario(u.id);

    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.className = "btn-delete";
    btnEliminar.onclick = () => eliminarUsuario(u.id);

    tdAcciones.appendChild(btnEditar);
    tdAcciones.appendChild(btnEliminar);
    tr.appendChild(tdAcciones);

    tbody.appendChild(tr);
  });
}

/* =========================
   INIT
========================= */
window.addEventListener("DOMContentLoaded", cargarUsuarios);