// LOGIN
function login() {
    const user = document.getElementById("user").value;
    const pass = document.getElementById("pass").value;
    let destino = "";

    if (user === "bodegaUser" && pass === "bodega123") destino = "bodega.html";
    if (user === "adminUser" && pass === "admin123") destino = "administracion.html";
    if (user === "contaUser" && pass === "conta123") destino = "contabilidad.html";
    if (user === "ventasUser" && pass === "ventas123") destino = "ventas.html";

    if (!destino) { alert("Usuario o contraseña incorrectos"); return; }

    localStorage.setItem('usuarioActual', user);
    window.location.href = destino;
}

// USUARIOS
let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
let idUsuario = usuarios.length ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;

// MODAL
function openFormUsuario() {
    const usuarioActual = localStorage.getItem('usuarioActual');
    if (usuarioActual !== 'adminUser') return; // Solo admin
    document.getElementById('modalUsuario').style.display = 'flex';
    document.getElementById('tituloFormUsuario').textContent = 'Nuevo Usuario';
    document.getElementById('usuario').value = '';
    document.getElementById('contrasena').value = '';
    document.getElementById('area').value = '';
    document.getElementById('privilegios').value = '';
}

function closeFormUsuario() { document.getElementById('modalUsuario').style.display = 'none'; }

function mostrarMensajeExito() {
    const mensaje = document.getElementById('mensajeExito');
    mensaje.style.display = 'block';
    setTimeout(() => { mensaje.style.display = 'none'; }, 2000);
}

// AGREGAR USUARIO
function guardarUsuario() {
    if (localStorage.getItem('usuarioActual') !== 'adminUser') {
        alert('Solo el administrador puede agregar usuarios.');
        return;
    }

    const usuarioInput = document.getElementById('usuario').value.trim();
    const contrasenaInput = document.getElementById('contrasena').value.trim();
    const areaInput = document.getElementById('area').value.trim();
    const privilegioInput = document.getElementById('privilegios').value;

    if (!usuarioInput || !contrasenaInput || !areaInput || !privilegioInput) {
        alert('Completa todos los campos.');
        return;
    }

    const nuevoUsuario = {
        id: idUsuario++,
        usuario: usuarioInput,
        contrasena: contrasenaInput,
        area: areaInput,
        privilegio: privilegioInput
    };

    usuarios.push(nuevoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    renderTablaUsuarios();
    mostrarMensajeExito();
    closeFormUsuario();
}

// RENDER TABLA
function renderTablaUsuarios() {
    const tbody = document.querySelector('#tablaUsuarios tbody');
    tbody.innerHTML = '';
    const usuarioActual = localStorage.getItem('usuarioActual');

    usuarios.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.id}</td>
            <td>${user.usuario}</td>
            <td>${user.contrasena}</td>
            <td>${user.area}</td>
            <td>${user.privilegio}</td>
            <td>
                <button class="btn-primary admin-only" onclick="editarUsuario(${user.id})">Editar</button>
                <button class="btn-delete admin-only" onclick="eliminarUsuario(${user.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Mostrar botones solo para admin
const usuarioActual = localStorage.getItem('usuarioActual');
if (usuarioActual === 'adminUser') {
    const adminElements = document.querySelectorAll('.admin-only');
    adminElements.forEach(el => el.style.display = 'inline-block');
}

// EDITAR USUARIO
function editarUsuario(id) {
    if (localStorage.getItem('usuarioActual') !== 'adminUser') { alert('Solo el administrador puede editar usuarios.'); return; }

    const user = usuarios.find(u => u.id === id);
    if (!user) return;

    document.getElementById('modalUsuario').style.display = 'flex';
    document.getElementById('tituloFormUsuario').textContent = 'Editar Usuario';
    document.getElementById('usuario').value = user.usuario;
    document.getElementById('contrasena').value = user.contrasena;
    document.getElementById('area').value = user.area;
    document.getElementById('privilegios').value = user.privilegio;

    const btnGuardar = document.querySelector('#formUsuario button');
    btnGuardar.onclick = function() {
        user.usuario = document.getElementById('usuario').value.trim();
        user.contrasena = document.getElementById('contrasena').value.trim();
        user.area = document.getElementById('area').value.trim();
        user.privilegio = document.getElementById('privilegios').value;
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        renderTablaUsuarios();
        mostrarMensajeExito();
        closeFormUsuario();
        btnGuardar.onclick = guardarUsuario;
    };
}

// ELIMINAR USUARIO
function eliminarUsuario(id) {
    if (localStorage.getItem('usuarioActual') !== 'adminUser') { alert('Solo el administrador puede eliminar usuarios.'); return; }

    if (confirm('¿Deseas eliminar este usuario?')) {
        usuarios = usuarios.filter(u => u.id !== id);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        renderTablaUsuarios();
    }
}

// CERRAR MODAL AL CLIC FUERA
window.onclick = function(event) {
    const modal = document.getElementById('modalUsuario');
    if (event.target === modal) closeFormUsuario();
};

// CARGAR TABLA AL INICIAR
window.addEventListener('DOMContentLoaded', () => {
    renderTablaUsuarios(); // Esto mostrará la tabla y botones admin
});
