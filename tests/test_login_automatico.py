import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys


def test_login_correcto():

    # Iniciar navegador
    driver = webdriver.Chrome()
    wait = WebDriverWait(driver, 10)

    try:
        # Ir al sistema
        driver.get("http://127.0.0.1:5500/index.html")

        # Esperar que cargue el formulario
        wait.until(EC.presence_of_element_located((By.ID, "loginForm")))

        # Localizar campos
        usuario = driver.find_element(By.ID, "user")
        password = driver.find_element(By.ID, "pass")

        # Escribir credenciales correctas
        usuario.send_keys("adminUser")
        password.send_keys("admin123")

        # Enviar formulario correctamente
        password.send_keys(Keys.RETURN)

        # Esperar redirección (ajusta si es necesario)
        wait.until(lambda d: "administracion.html" in d.current_url 
                   or "dashboard" in d.current_url)

        print("✅ Login ejecutado correctamente")

        # Validación final
        assert "administracion.html" in driver.current_url

    finally:
        driver.quit()