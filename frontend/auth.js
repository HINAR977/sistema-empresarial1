import { apiRequest } from "./api.js";
import { saveToken, getToken, removeToken } from "./utils.js";

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

// === LOGIN ===
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = loginForm.email.value;
        const password = loginForm.password.value;

        const response = await apiRequest("/auth/login", "POST", { email, password });

        if (response.error) {
            alert(response.error);
            return;
        }

        saveToken(response.token);
        window.location.href = "index.html";
    });
}

// === REGISTER ===
if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = registerForm.name.value;
        const email = registerForm.email.value;
        const password = registerForm.password.value;

        const response = await apiRequest("/auth/register", "POST", {
            name,
            email,
            password,
        });

        if (response.error) {
            alert(response.error);
            return;
        }

        alert("Registro exitoso, ahora inicia sesión.");
        window.location.href = "login.html";
    });
}

// === LOGOUT ===
export function logout() {
    removeToken();
    window.location.href = "login.html";
}
