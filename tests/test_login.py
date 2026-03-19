import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def test_login_correcto():

    driver = webdriver.Chrome()
    wait = WebDriverWait(driver, 10)

    try:
        driver.get("http://127.0.0.1:8000/index.html")

        wait.until(EC.presence_of_element_located((By.ID, "loginForm")))

        driver.find_element(By.ID, "user").send_keys("adminUser")
        password = driver.find_element(By.ID, "pass")
        password.send_keys("admin123")
        password.send_keys(Keys.RETURN)

        wait.until(lambda d: "administracion.html" in d.current_url)

        assert "administracion.html" in driver.current_url

    finally:
        driver.quit()