import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_login():

    driver = webdriver.Chrome()
    wait = WebDriverWait(driver, 10)

    driver.get("http://127.0.0.1:8000/index.html")

    # Esperar que cargue el formulario
    wait.until(EC.presence_of_element_located((By.ID, "loginForm")))

    usuario = driver.find_element(By.ID, "user")
    contraseña = driver.find_element(By.ID, "pass")

    usuario.send_keys("adminUser")
    contraseña.send_keys("admin123")

    driver.quit()