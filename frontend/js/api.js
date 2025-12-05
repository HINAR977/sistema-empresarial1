import { getUsuarios, saveUsuario, deleteUsuario } from './api.js';

// --- ELEMENTOS DEL DOM ---
const tablaUsuariosBody = document.querySelector('#tablaUsuarios tbody');
const modalUsuario = document.getElementById('modalUsuario');
const tituloFormUsuario = document.getElementById('tituloFormUsuario');

const idUsuarioInput = document.getElementById('idUsuario');
const nombreUsuarioInput = document.getElementById('nombreUsuario');
const emailUsuarioInput = document.getElementById('emailUsuario');
const passwordUsuarioInput = document.getElementById('passwordUsuario');
const toggleContrasena = document.getElementById("toggleContrasena");

// -------------------- TOGGLE PASSWORD DEL MODAL --------------------
toggleContrasena.addEventListener("click", () => {
    passwordUsuarioInput.type = passwordUsuarioInput.type === "password" ? "text" : "password";
    toggleContrasena.classList.toggle("fa-eye-slash");
});


// -------------------- MANEJO DE SECCIONES (Ya estaba en tu HTML) --------------------
// Esta función debe existir en el ámbito global para que funcione el onclick en el HTML
window.mostrarSeccion = (idSeccion) => {
    // Es una simulación simple, si tu app crece, usa un enfoque más estructurado
    document.querySelectorAll('.content-area > div').forEach(div => {
        div.style.display = 'none';
    });
    document.getElementById(idSeccion).style.display = 'block';
    document.getElementById('tituloSeccion').textContent = idSeccion.charAt(0).toUpperCase() + idSeccion.slice(1);
    
    // Si la sección es usuarios, carga la tabla
    if (idSeccion === 'usuarios') {
        loadUsuarios();
    }
};


// -------------------- LÓGICA DE LA TABLA --------------------

// Cargar y mostrar usuarios
const loadUsuarios = async () => {
    try {
        const usuarios = await getUsuarios();
        renderUsuarios(usuarios);
    } catch (error) {
        console.error("No se pudo cargar la lista de usuarios.", error);
        tablaUsuariosBody.innerHTML = '<tr><td colspan="4">Error al cargar los usuarios.</td></tr>';
    }
};

// Renderizar la tabla con los datos
const renderUsuarios = (usuarios) => {
    tablaUsuariosBody.innerHTML = ''; // Limpiar tabla
    usuarios.forEach(usuario => {
        const row = tablaUsuariosBody.insertRow();
        row.insertCell().textContent = usuario.id;
        row.insertCell().textContent = usuario.nombre;
        row.insertCell().textContent = usuario.email;
        
        const actionsCell = row.insertCell();
        
        // Botón Editar
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Editar';
        editBtn.className = 'btn-secondary';
        editBtn.onclick = () => openFormUsuario(usuario);
        actionsCell.appendChild(editBtn);

        // Botón Eliminar
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Eliminar';
        deleteBtn.className = 'btn-danger';
        deleteBtn.onclick = () => deleteUser(usuario.id, usuario.nombre);
        actionsCell.appendChild(deleteBtn);
    });
};

// -------------------- LÓGICA DEL MODAL/FORMULARIO --------------------

// Abrir el modal para Crear o Editar
window.openFormUsuario = (usuario = null) => {
    // 1. Limpiar/Resetear formulario
    idUsuarioInput.value = '';
    nombreUsuarioInput.value = '';
    emailUsuarioInput.value = '';
    passwordUsuarioInput.value = '';
    
    // 2. Configurar para CREAR o EDITAR
    if (usuario) {
        // Modo Edición
        tituloFormUsuario.textContent = 'Editar Usuario';
        idUsuarioInput.value = usuario.id;
        nombreUsuarioInput.value = usuario.nombre;
        emailUsuarioInput.value = usuario.email;
        passwordUsuarioInput.placeholder = 'Dejar vacío para no cambiar';
        passwordUsuarioInput.removeAttribute('required'); // No es obligatoria al editar
    } else {
        // Modo Creación
        tituloFormUsuario.textContent = 'Nuevo Usuario';
        passwordUsuarioInput.placeholder = 'Contraseña';
        passwordUsuarioInput.setAttribute('required', 'required'); // Es obligatoria al crear
    }

    // 3. Mostrar el modal
    modalUsuario.style.display = 'block';
};

// Cerrar el modal
window.closeFormUsuario = () => {
    modalUsuario.style.display = 'none';
};


// Guardar usuario (Crear o Editar)
window.guardarUsuario = async () => {
    const usuarioData = {
        id: idUsuarioInput.value || null, // Será null si es nuevo
        nombre: nombreUsuarioInput.value,
        email: emailUsuarioInput.value,
    };

    // Solo agregar la contraseña si no está vacía
    if (passwordUsuarioInput.value) {
        usuarioData.password = passwordUsuarioInput.value;
    } 

    // Validación básica para el modo creación
    if (!usuarioData.id && !usuarioData.password) {
        alert('La contraseña es obligatoria para un nuevo usuario.');
        return;
    }

    try {
        await saveUsuario(usuarioData);
        alert(`Usuario ${usuarioData.id ? 'actualizado' : 'creado'} con éxito.`);
        closeFormUsuario();
        loadUsuarios(); // Recargar la tabla
    } catch (error) {
        alert(`Error al guardar el usuario: ${error.message}`);
    }
};

// Eliminar usuario
const deleteUser = async (id, nombre) => {
    if (confirm(`¿Estás seguro de que quieres eliminar al usuario ${nombre} (ID: ${id})?`)) {
        try {
            await deleteUsuario(id);
            alert(`Usuario ${nombre} eliminado con éxito.`);
            loadUsuarios(); // Recargar la tabla
        } catch (error) {
            alert(`Error al eliminar el usuario: ${error.message}`);
        }
    }
};

// -------------------- INICIALIZACIÓN --------------------

// Lógica de autenticación simple (ajusta según tu archivo auth.js)
// Asegúrate de que esta lógica se ejecute después de que la autenticación haya
// cargado el dashboard.
// Si ya hay sesión, cargamos los usuarios al iniciar.
window.onload = () => {
    // Si tu lógica de auth.js muestra el dashboard, esto se ejecutará.
    // Asumiendo que el dashboard ya está visible después de la carga.
    // Esto es solo un ejemplo de cómo podrías inicializar:
    // if (document.getElementById('dashboard').style.display !== 'none') {
    //     loadUsuarios(); 
    // }
    
    // Llamar directamente a loadUsuarios si el dashboard es el estado por defecto.
    loadUsuarios();
};