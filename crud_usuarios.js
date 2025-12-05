// -------------------- LÓGICA DE LOGIN --------------------

function login() {
    const user = document.getElementById("user").value.trim(); // Se añade trim() para limpieza
    const pass = document.getElementById("pass").value.trim();

    // NOTA: Para un sistema más robusto, se debe verificar contra la base de datos de usuarios (la variable 'usuarios')
    // Por simplicidad, mantenemos la lógica original de contraseñas fijas
    let destino = "";

    if (user === "bodegaUser" && pass === "bodega123") destino = "bodega.html";
    else if (user === "adminUser" && pass === "admin123") destino = "administracion.html";
    else if (user === "contaUser" && pass === "conta123") destino = "contabilidad.html";
    else if (user === "ventasUser" && pass === "ventas123") destino = "ventas.html";

    if (!destino) { alert("Usuario o contraseña incorrectos"); return; }

    localStorage.setItem('usuarioActual', user);
    window.location.href = destino;
}

// -------------------- GESTIÓN DE USUARIOS Y DATOS --------------------

// Inicializa 'usuarios' del localStorage, o con datos de ejemplo si no existen
let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [
    { id: 1, usuario: "adminUser", contrasena: "admin123", area: "Gerencia", privilegio: "admin" },
    { id: 2, usuario: "bodegaUser", contrasena: "bodega123", area: "Almacén", privilegio: "user" },
    { id: 3, usuario: "contaUser", contrasena: "conta123", area: "Contabilidad", privilegio: "user" }
];
// Calcula el siguiente ID basado en el ID más alto existente
let idUsuario = usuarios.length ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;

const btnGuardarModal = document.getElementById('btnGuardar'); // Asume que agregaste un ID al botón Guardar en el modal

// -------------------- FUNCIONES DE UTILIDAD Y MODAL --------------------

function openFormUsuario() {
    // La comprobación de admin se puede hacer aquí o al guardar
    if (localStorage.getItem('usuarioActual') !== 'adminUser') return; 
    
    document.getElementById('modalUsuario').style.display = 'flex';
    document.getElementById('tituloFormUsuario').textContent = 'Nuevo Usuario';
    
    // Limpia el formulario y prepara para la adición
    document.getElementById('formUsuario').reset(); 
    btnGuardarModal.onclick = guardarUsuario; // Asegura que la función Guardar esté ligada a "Agregar"
    delete btnGuardarModal.dataset.editId; // Limpia cualquier ID de edición
}

function closeFormUsuario() { document.getElementById('modalUsuario').style.display = 'none'; }

function mostrarMensajeExito() {
    const mensaje = document.getElementById('mensajeExito');
    // Se asegura que el elemento existe antes de manipularlo
    if (mensaje) {
        mensaje.style.display = 'block';
        setTimeout(() => { mensaje.style.display = 'none'; }, 2000);
    }
}

// CERRAR MODAL AL CLIC FUERA
window.onclick = function(event) {
    const modal = document.getElementById('modalUsuario');
    if (event.target === modal) closeFormUsuario();
};

// -------------------- CRUD: CREAR (AGREGAR) --------------------

function guardarUsuario() {
    if (localStorage.getItem('usuarioActual') !== 'adminUser') {
        alert('Solo el administrador puede agregar o modificar usuarios.');
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

    const isEditing = btnGuardarModal.dataset.editId;

    // Verificación de existencia (solo si es nuevo o si se cambió el nombre en edición)
    if (!isEditing && usuarios.some(u => u.usuario === usuarioInput)) {
        alert('El nombre de usuario ya existe.');
        return;
    }

    if (isEditing) {
        // Lógica de EDICIÓN (actualización de datos en el objeto existente)
        const idToEdit = parseInt(isEditing);
        const userToUpdate = usuarios.find(u => u.id === idToEdit);
        
        if (userToUpdate) {
            userToUpdate.usuario = usuarioInput;
            userToUpdate.contrasena = contrasenaInput;
            userToUpdate.area = areaInput;
            userToUpdate.privilegio = privilegioInput;
        }
        delete btnGuardarModal.dataset.editId; // Limpia el flag de edición
    } else {
        // Lógica de AGREGAR (nuevo usuario)
        const nuevoUsuario = {
            id: idUsuario++,
            usuario: usuarioInput,
            contrasena: contrasenaInput,
            area: areaInput,
            privilegio: privilegioInput
        };
        usuarios.push(nuevoUsuario);
    }

    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    renderTablaUsuarios();
    mostrarMensajeExito();
    closeFormUsuario();
}


// -------------------- CRUD: LEER (RENDERIZAR TABLA) --------------------

function renderTablaUsuarios() {
    const tbody = document.querySelector('#tablaUsuarios tbody');
    if (!tbody) return; // Salir si el elemento no existe

    tbody.innerHTML = '';
    const usuarioActual = localStorage.getItem('usuarioActual');
    const isAdmin = usuarioActual === 'adminUser';

    usuarios.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.id}</td>
            <td>${user.usuario}</td>
            <td>${user.contrasena}</td>
            <td>${user.area}</td>
            <td>${user.privilegio}</td>
            <td>
                ${isAdmin ? 
                    `<button class="btn btn-edit" onclick="editarUsuario(${user.id})" title="Editar"><span class="material-icons">edit</span></button>
                     <button class="btn btn-delete" onclick="eliminarUsuario(${user.id})" title="Eliminar"><span class="material-icons">delete</span></button>` 
                    : ''}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// -------------------- CRUD: ACTUALIZAR (EDITAR) --------------------

function editarUsuario(id) {
    if (localStorage.getItem('usuarioActual') !== 'adminUser') {
        alert('Solo el administrador puede editar usuarios.');
        return;
    }

    const user = usuarios.find(u => u.id === id);
    if (!user) return;

    document.getElementById('modalUsuario').style.display = 'flex';
    document.getElementById('tituloFormUsuario').textContent = `Editar Usuario ID: ${id}`;
    
    // Llenar el formulario
    document.getElementById('usuario').value = user.usuario;
    document.getElementById('contrasena').value = user.contrasena;
    document.getElementById('area').value = user.area;
    document.getElementById('privilegios').value = user.privilegio;

    // Se cambia el onclick del botón Guardar para que apunte a la misma función 'guardarUsuario'
    // pero se usa un atributo de datos para indicar que es una edición
    btnGuardarModal.onclick = guardarUsuario;
    btnGuardarModal.dataset.editId = id; 
}

// -------------------- CRUD: ELIMINAR --------------------

function eliminarUsuario(id) {
    if (localStorage.getItem('usuarioActual') !== 'adminUser') {
        alert('Solo el administrador puede eliminar usuarios.');
        return;
    }

    if (confirm('¿Deseas eliminar este usuario?')) {
        usuarios = usuarios.filter(u => u.id !== id);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        renderTablaUsuarios();
        mostrarMensajeExito();
    }
}

// -------------------- INICIO DE APLICACIÓN --------------------

window.addEventListener('DOMContentLoaded', () => {
    // Si la página es 'administracion.html', se debe renderizar la tabla al cargar.
    // Se asume que este archivo JS está incluido en 'administracion.html'
    if (document.getElementById('tablaUsuarios')) {
        renderTablaUsuarios(); 
    }
    
    // Se recomienda establecer el onclick en el botón de guardar en el HTML si no se hace aquí.
    // Si usas el código HTML completo que te di antes, no necesitas este paso.
    // Si usaste el código JS original, asegúrate de que btnGuardarModal esté inicializado correctamente.
});