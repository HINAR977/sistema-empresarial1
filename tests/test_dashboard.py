from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Abrir navegador
driver = webdriver.Chrome()

# Ir a la página
driver.get("http://127.0.0.1:5500/dashboard.html")

# Esperar hasta que el título esté disponible
wait = WebDriverWait(driver, 10)
wait.until(EC.title_is(driver.title))

# Verificar título
titulo = driver.title
print("Título de la página:", titulo)

# Cerrar navegador
driver.quit()