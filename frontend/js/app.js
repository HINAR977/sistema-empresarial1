import { apiAuthRequest } from "./api.js";
import { getToken } from "./utils.js";
import { logout } from "./auth.js";

// Elementos
const dashboard = document.getElementById("dashboard");
const loginSection = document.getElementById("loginSection");
const loginForm = document.getElementById("loginForm");
const tablaUsuarios = document.querySelector("#tablaUsuarios tbody");

// ============================
//   USUARIOS DE PRUEBA
// ============================
let usuarios = [
    { id: 0, name: "Admin Master", email: "admin@empresa.com", password: "Admin1234" },
    { id: 1, name: "John Doe", email: "john@example.com", password: "12345678" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", password: "12345678" },
    { id: 3, name: "Michael Brown", email: "michael@example.com", password: "12345678" },
    { id: 4, name: "Emily Davis", email: "emily@example.com", password: "12345678" },
    { id: 5, name: "William Johnson", email: "william@example.com", password: "12345678" }
];

let editando = null;

// ============================
//   INICIO DEL SISTEMA
// ============================
document.addEventListener("DOMContentLoaded", () => {
    // Si ya hay token, mostrar dashboard
    const token = getToken();
    if (!token) return mostrarLogin();
    mostrarDashboard();
});

// ============================
//   LOGIN LOCAL
// ============================
loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const usuario = usuarios.find(u => u.email === email && u.password === password);

    if (usuario) {
        mostrarDashboard(usuario);
    } else {
        alert("Usuario o contraseña incorrectos");
    }
});

// ============================
//   MOSTRAR / OCULTAR SECCIONES
// ============================
function mostrarLogin() {
    loginSection.style.display = "flex";
    dashboard.style.display = "none";
}

function mostrarDashboard(usuario = null) {
    loginSection.style.display = "none";
    dashboard.style.display = "flex";

    if (usuario) {
        document.getElementById("userNameDisplay").textContent = usuario.name;
    }

    renderUsuarios();
}

window.logout = () => {
    mostrarLogin();
};

// ============================
//   RENDERIZAR USUARIOS
// ============================
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
//   GUARDAR USUARIO
// ============================
window.guardarUsuario = function () {
    const nombre = document.getElementById("nombreUsuario").value;
    const email = document.getElementById("emailUsuario").value;
    const password = document.getElementById("passwordUsuario").value;

    if (!nombre || !email) return alert("Faltan datos");

    if (!editando) {
        // CREATE
        const nuevoUsuario = {
            id: usuarios.length ? usuarios[usuarios.length - 1].id + 1 : 1,
            name: nombre,
            email,
            password: password || "12345678"
        };
        usuarios.push(nuevoUsuario);
    } else {
        // UPDATE
        const u = usuarios.find(x => x.id === editando);
        if (!u) return;
        u.name = nombre;
        u.email = email;
        if(password) u.password = password;
    }

    renderUsuarios();
    closeFormUsuario();
};

// ============================
//   EDITAR USUARIO
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
//   ELIMINAR USUARIO
// ============================
window.eliminarUsuario = function (id) {
    if (!confirm("¿Eliminar este usuario?")) return;
    usuarios = usuarios.filter(u => u.id !== id);
    renderUsuarios();
};

// ============================
//   TOGGLE PASSWORD
// ============================
function setupPasswordToggle(toggleId, inputId){
    const toggle = document.getElementById(toggleId);
    const input = document.getElementById(inputId);
    if(toggle && input){
        toggle.addEventListener("click", ()=>{
            input.type = input.type==="password"?"text":"password";
            toggle.classList.toggle("fa-eye-slash");
        });
    }
}
setupPasswordToggle("togglePassLogin","password");
setupPasswordToggle("togglePassModal","passwordUsuario");
