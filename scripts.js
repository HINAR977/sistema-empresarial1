function login() {
    const user = document.getElementById("user").value;
    const pass = document.getElementById("pass").value;

    // Llamada a la API para obtener todos los usuarios
    fetch('http://localhost:3000/api/users')
        .then(res => {
            if (!res.ok) throw new Error('Error al conectar con el servidor');
            return res.json();
        })
        .then(data => {
            // Buscar usuario y contraseña correctos en la respuesta
            const usuario = data.find(u => u.username === user && u.password === pass);

            if (!usuario) {
                alert("Usuario o contraseña incorrectos");
                return;
            }

            // Determinar la página de destino según el rol
            let destino = "";
            switch (usuario.role) {
                case "bodega":
                    destino = "bodega.html";
                    break;
                case "admin":
                    destino = "administracion.html";
                    break;
                case "contabilidad":
                    destino = "contabilidad.html";
                    break;
                case "ventas":
                    destino = "ventas.html";
                    break;
                default:
                    alert("Rol de usuario no válido");
                    return;
            }

            // Guardar el usuario en localStorage y redirigir
            localStorage.setItem('usuarioActual', user);
            window.location.href = destino;
        })
        .catch(err => {
            console.error(err);
            alert("Ocurrió un error al intentar iniciar sesión");
        });
}
 