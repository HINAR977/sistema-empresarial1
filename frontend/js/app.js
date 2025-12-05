import { apiAuthRequest } from "./api.js";
import { getToken } from "./utils.js";
import { logout } from "./auth.js";

// Elementos
const dashboard = document.getElementById("dashboard");
const loginSection = document.getElementById("loginSection");
const tablaUsuarios = document.querySelector("#tablaUsuarios tbody");

let usuarios = [];
let editando = null;

// ============================
//   INICIO DEL SISTEMA
// ============================
document.addEventListener("DOMContentLoaded", async () => {
    const token = getToken();

    if (!token) return mostrarLogin();

    const profile = await apiAuthRequest("/users/profile", "GET", token);

    if (profile.error) return mostrarLogin();

    mostrarDashboard();
    cargarUsuarios();
});

// ============================
//   MOSTRAR / OCULTAR SECCIONES
// ============================
function mostrarLogin() {
    loginSection.style.display = "flex";
    dashboard.style.display = "none";
}

function mostrarDashboard() {
    loginSection.style.display = "none";
    dashboard.style.display = "flex";
}

window.logout = logout;

// ============================
//   CARGAR USUARIOS
// ============================
async function cargarUsuarios() {
    const token = getToken();
    const res = await apiAuthRequest("/users", "GET", token);
    usuarios = res.data || [];
    renderUsuarios();
}

function renderUsuarios() {
    tablaUsuarios.innerHTML = "";

    usuarios.forEach(u => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${u.id}</td>
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td>
                <button class="edit-btn" onclick="editarUsuario(${u.id})">Editar</button>
                <button class="delete-btn" onclick="eliminarUsuario(${u.id})">Eliminar</button>
            </td>
        `;

        tablaUsuarios.appendChild(tr);
    });
}

// ============================
//   MODAL
// ============================
window.openFormUsuario = function () {
    editando = null;
    document.getElementById("tituloFormUsuario").textContent = "Nuevo Usuario";
    document.getElementById("formUsuario").reset();
    document.getElementById("modalUsuario").style.display = "flex";
};

window.closeFormUsuario = function () {
    document.getElementById("modalUsuario").style.display = "none";
};

// ============================
//   GUARDAR USUARIO (CREATE / UPDATE)
// ============================
window.guardarUsuario = async function () {
    const nombre = document.getElementById("nombreUsuario").value;
    const email = document.getElementById("emailUsuario").value;
    const password = document.getElementById("passwordUsuario").value;
    const token = getToken();

    if (!nombre || !email) return alert("Faltan datos");

    let body = { name: nombre, email };
    if (password) body.password = password;

    if (!editando) {
        // CREATE
        const res = await apiAuthRequest("/users", "POST", token, body);
        if (!res.error) {
            cargarUsuarios();
            closeFormUsuario();
        }
    } else {
        // UPDATE
        const res = await apiAuthRequest(`/users/${editando}`, "PUT", token, body);
        if (!res.error) {
            cargarUsuarios();
            closeFormUsuario();
        }
    }
};

// ============================
//   EDITAR
// ============================
window.editarUsuario = function (id) {
    const u = usuarios.find(x => x.id === id);
    if (!u) return;

    editando = id;

    document.getElementById("tituloFormUsuario").textContent = "Editar Usuario";
    document.getElementById("nombreUsuario").value = u.name;
    document.getElementById("emailUsuario").value = u.email;
    document.getElementById("passwordUsuario").value = "";

    document.getElementById("modalUsuario").style.display = "flex";
};

// ============================
//   ELIMINAR
// ============================
window.eliminarUsuario = async function (id) {
    if (!confirm("¿Eliminar este usuario?")) return;

    const token = getToken();
    const res = await apiAuthRequest(`/users/${id}`, "DELETE", token);

    if (!res.error) cargarUsuarios();
};
