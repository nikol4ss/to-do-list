import os
import time
import uuid
from urllib import error, request

import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

FRONTEND_URL = os.getenv("E2E_FRONTEND_URL", "http://127.0.0.1:3000")
API_URL = os.getenv("E2E_API_URL", "http://127.0.0.1:8000/api")
WAIT_SECONDS = int(os.getenv("E2E_WAIT_SECONDS", "15"))


def _build_user():
    suffix = uuid.uuid4().hex[:8]
    return {
        "first_name": "Selenium",
        "last_name": "Tester",
        "username": f"selenium_{suffix}",
        "email": f"selenium_{suffix}@example.com",
        "password": "StrongPass123!",
    }


def _signup_via_api(user):
    payload = (
        "{"
        f"\"first_name\":\"{user['first_name']}\","
        f"\"last_name\":\"{user['last_name']}\","
        f"\"username\":\"{user['username']}\","
        f"\"email\":\"{user['email']}\","
        f"\"password\":\"{user['password']}\""
        "}"
    ).encode("utf-8")
    req = request.Request(
        f"{API_URL}/auth/signup/",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with request.urlopen(req, timeout=10) as response:
            return response.status
    except error.HTTPError as exc:
        return exc.code


@pytest.fixture
def driver():
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1440,1000")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    driver = webdriver.Chrome(options=options)
    try:
        yield driver
    finally:
        driver.quit()


def _wait(driver, condition):
    return WebDriverWait(driver, WAIT_SECONDS).until(condition)


def _fill(driver, field_id, value):
    element = _wait(driver, EC.visibility_of_element_located((By.ID, field_id)))
    element.clear()
    element.send_keys(value)


def test_signup_redirects_to_dashboard(driver):
    user = _build_user()

    driver.get(f"{FRONTEND_URL}/signup")
    _fill(driver, "signup-first-name", user["first_name"])
    _fill(driver, "signup-last-name", user["last_name"])
    _fill(driver, "signup-username", user["username"])
    _fill(driver, "signup-email", user["email"])
    _fill(driver, "signup-password", user["password"])

    driver.find_element(By.ID, "signup-submit").click()

    _wait(driver, EC.url_contains("/dashboard"))
    greeting = _wait(
        driver, EC.visibility_of_element_located((By.ID, "dashboard-greeting"))
    )
    assert "Olá" in greeting.text


def test_login_redirects_to_dashboard(driver):
    user = _build_user()
    status_code = _signup_via_api(user)
    assert status_code == 201

    driver.get(f"{FRONTEND_URL}/login")
    _fill(driver, "login-username", user["username"])
    _fill(driver, "login-password", user["password"])

    driver.find_element(By.ID, "login-submit").click()

    _wait(driver, EC.url_contains("/dashboard"))
    greeting = _wait(
        driver, EC.visibility_of_element_located((By.ID, "dashboard-greeting"))
    )
    assert user["username"] in driver.page_source or "Olá" in greeting.text
