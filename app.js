const API_AUTH_URL = "http://localhost:3000/api/auth/login";

function mostrarDashboard() {
  document.body.classList.remove("login-body");
  document.getElementById("loginContainer").style.display = "none";
  document.getElementById("dashboard").style.display = "flex";
  cargarUsuarios();
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("loginContainer").style.display = "block";
  document.body.classList.add("login-body");
}

function configurarLogin() {
  const form = document.getElementById("loginForm");
  const togglePass = document.getElementById("togglePass");

  togglePass?.addEventListener("click", () => {
    const pass = document.getElementById("pass");
    const visible = pass.type === "text";
    pass.type = visible ? "password" : "text";
    togglePass.textContent = visible ? "visibility" : "visibility_off";
  });

  form?.addEventListener("submit", async event => {
    event.preventDefault();

    const usuario = document.getElementById("user").value.trim();
    const password = document.getElementById("pass").value.trim();

    try {
      const res = await fetch(API_AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, password })
      });

      if (!res.ok) throw new Error("Credenciales invalidas");

      const data = await res.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", data.usuario);
      document.getElementById("topbarUsuario").textContent = data.usuario;
      mostrarDashboard();
    } catch (error) {
      mostrarMensaje("Usuario o contrasena incorrectos", "error");
      console.error(error);
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  configurarLogin();

  const token = localStorage.getItem("token");
  const usuario = localStorage.getItem("usuario");
  if (usuario) document.getElementById("topbarUsuario").textContent = usuario;
  if (token) mostrarDashboard();
});
