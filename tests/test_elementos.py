from selenium import webdriver
from selenium.webdriver.common.by import By

# 🔹 Crear el driver PRIMERO
driver = webdriver.Chrome()

# 🔹 Luego usarlo
driver.get("http://127.0.0.1:5500/dashboard.html")

# Ejemplo de prueba
elemento = driver.find_element(By.CLASS_NAME, "sidebar")
assert elemento.is_displayed()

print("Prueba exitosa ✅")

driver.quit()