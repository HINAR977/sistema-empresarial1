function login() {
    const user = document.getElementById("user").value;
    const pass = document.getElementById("pass").value;
    let destino = "";

    if (user === "bodegaUser" && pass === "bodega123") destino = "bodega.html";
    if (user === "adminUser" && pass === "admin123") destino = "administracion.html";
    if (user === "contaUser" && pass === "conta123") destino = "contabilidad.html";
    if (user === "ventasUser" && pass === "ventas123") destino = "ventas.html";

    if (!destino) { alert("Usuario o contraseña incorrectos"); return; }

    localStorage.setItem('usuarioActual', user); // <- IMPORTANTE
    window.location.href = destino;
}
