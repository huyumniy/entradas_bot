import undetected_chromedriver as webdriver
import time
import os, sys, platform
import datetime
import tempfile
from flask import Flask, request, Response 
from slack_sdk import WebClient
from colorama import init, Fore
from twocaptcha import TwoCaptcha
import subprocess
import requests
import threading
import socket
from selenium.common.exceptions import NoAlertPresentException, TimeoutException
import eel
import soundfile as sf
import sounddevice as sd
import random
import asyncio
import shutil
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support import expected_conditions as EC
import json
from random import choice
# from webdriver_manager.core.logger import __logger as wdm_logger
init(autoreset=True)
entrada = "https://www.entradas.com/artist/real-madrid-c-f/"

def wait_for_element(driver, selector, timeout=10, xpath=False, debugMode=False):
    try:
        if xpath:
            element = WebDriverWait(driver, timeout).until(EC.element_to_be_clickable((By.XPATH, selector)))
        else:
            element = WebDriverWait(driver, timeout).until(EC.element_to_be_clickable((By.CSS_SELECTOR, selector)))
        return element
    except Exception as e:
        if debugMode: print("selector: ", selector, "\n", e)
        return False


def check_for_element(driver, selector, click=False, xpath=False, debug=False):
    try:
        if xpath:
            element = driver.find_element(By.XPATH, selector)
        else:
            element = driver.find_element(By.CSS_SELECTOR, selector)
        if click: 
            driver.execute_script("arguments[0].scrollIntoView();", element)
            # slow_mouse_move_to_element(driver, element)
            element.click()
        return element
    except Exception as e: 
        if debug: print("selector: ", selector, "\n", e)
        return False
    

def check_for_elements(driver_element, selector, xpath=False, debugMode=False):
    try:
        if xpath:
            elements = driver_element.find_elements(By.XPATH, selector)
        else:
            elements = driver_element.find_elements(By.CSS_SELECTOR, selector)
        return elements
    except Exception as e:
        if debugMode: print("selector: ", selector, "\n", e)
        return False
    

def ensure_check_elem(driver, selector, methode=By.XPATH, tmt=20, click=False):
    var = None
    tmt0 = 0
    while True:
        if tmt0 >= tmt:
            raise Exception('Not Found')
        try:
            var = driver.find_element(methode, selector)
            if click:
                var.click()
            break
        except:
            try:
                driver.find_element( By.XPATH, '//*[@id="onetrust-accept-btn-handler"]').click()
                driver.execute_script("document.querySelector('div.onetrust-pc-dark-filter.ot-fade-in').remove()")
            except:
                pass
        tmt0 += 0.5
        time.sleep(0.5)
    return var


def get_local_data(driver):
    local_storage_data = driver.execute_script("""
        let data = {};
        for (let i = 0; i < localStorage.length; i++) {
            let key = localStorage.key(i);
            data[key] = localStorage.getItem(key);
        }
        return data;
    """)

    # Print or work with the retrieved local storage data
    ticketBotSettings = local_storage_data.get('ticketBotSettings')
    return ticketBotSettings


def post_request(data, endpoint='/book', port='8080'):

    if not check_server_running(port):
        print("Server is not running, starting the server...")
        start_server()
        time.sleep(5)  # Give the server some time to start up
    print(data)

    try:
        json_data = json.dumps(data)
        
    except Exception as e:
        print(e)
    # Set the headers to specify the content type as JSON
    headers = {
        "Content-Type": "application/json"
    }

    # Send the POST request 
    print(f"http://localhost:{port}{endpoint}")
    try:
        response = requests.post(f"http://localhost:{port}{endpoint}", data=json_data, headers=headers)
        print(response)
    except Exception as e:
        print(e)
        return False
    # Check the response status code
    if response:
        if response.status_code == 200:
            print("POST request successful!")
        else:
            print("POST request failed.")
    else: return False


def check_server_running(port='8080'):
    """Check if the server is running by making a request to it."""
    try:
        response = requests.get(f"http://localhost:{port}")
        return response.status_code == 200
    except requests.exceptions.RequestException:
        return False


def start_server():
    """Start the Flask server in a subprocess."""
    subprocess.Popen([sys.executable, './server.py'])


def run_flask():
    app = Flask(__name__)
    to_run = True
    # Set up Slack API client
    slack_token = None
    with open('slack_token.txt', 'r') as file:
        slack_token = file.read().strip()
    client = WebClient(token=slack_token)
    app.run(debug=True, port=8080)


def connect_vpn(driver):
    blacklist = ['Iran', 'Egypt', 'Italy']
    while True:
        try:
            driver.get('chrome://extensions/')
            js_code = """
                const callback = arguments[0];
                chrome.management.getAll((extensions) => {
                    callback(extensions);
                });
            """
            extensions = driver.execute_async_script(js_code)
            filtered_extensions = [extension for extension in extensions if 'Urban VPN' in extension['description']]
            
            vpn_id = [extension['id'] for extension in filtered_extensions if 'id' in extension][0]
            vpn_url = f'chrome-extension://{vpn_id}/popup/index.html'
            driver.get(vpn_url)
            wait_for_element(driver, 'button[class="button button--pink consent-text-controls__action"]', timeout=5)
            check_for_element(driver, '#app > div > div.simple-layout > div.simple-layout__body > div > div > button', click=True)
            check_for_element(driver, 'button[class="button button--pink consent-text-controls__action"]', click=True)
            is_connected = check_for_element(driver, 'div[class="play-button play-button--pause"]')
            if is_connected:
                driver.find_element(By.CSS_SELECTOR, 'div[class="play-button play-button--pause"]').click()
            select_element = driver.find_element(By.CSS_SELECTOR, 'div[class="select-location"]')
            select_element.click()
            time.sleep(2)
            while True:
                element = random.choice(check_for_elements(driver, '//ul[@class="locations"][2]/li/p', xpath=True))
                element_text = element.text
                if element_text not in blacklist: break
            driver.execute_script("arguments[0].scrollIntoView();", element)
            element.click()
            time.sleep(5)
            break
        except: pass
    return True

@eel.expose
def main(initialUrl, isSlack, browsersAmount, isVpn, proxyList):
    print(initialUrl, isSlack, browsersAmount, isVpn, proxyList)
    # eel.spawn(run(initialUrl, isSlack, browserAmount, proxyList))
    threads = []
    if isSlack:
        flask_thread = threading.Thread(target=run_flask)
        flask_thread.daemon = True
        flask_thread.start()
    for i in range(1, int(browsersAmount)+1):  # Example: 3 threads, modify as needed
        if i!= 1: time.sleep(i*30)
        thread = threading.Thread(target=run, args=(i, initialUrl, isSlack, browsersAmount, isVpn, proxyList))
        threads.append(thread)
        thread.start()
    # Wait for all threads to complete
    for thread in threads:
        thread.join()


def get_indexeddb_data(driver, db_name, store_name):
    script = f"""
    var callback = arguments[arguments.length - 1];  // Last argument is the callback for async script

    var openRequest = indexedDB.open("{db_name}");

    openRequest.onsuccess = function(event) {{
        var db = event.target.result;
        var transaction = db.transaction("{store_name}", "readonly");
        var store = transaction.objectStore("{store_name}");
        var getRequest = store.get(1);  // Assuming the data is stored under key 1, adjust if needed

        getRequest.onsuccess = function(event) {{
            var result = getRequest.result;
            if (result) {{
                callback(JSON.stringify(result.settings));  // Pass the result back to Python
            }} else {{
                callback(null);  // No result found
            }}
        }};

        getRequest.onerror = function(event) {{
            callback(null);  // Error in getting the data
        }};
    }};

    openRequest.onerror = function(event) {{
        callback(null);  // Error in opening the database
    }};
    """
    return driver.execute_async_script(script)
    

def run(thread_number, initialUrl, isSlack, browsersAmount, isVpn, proxyList=[]):
    options = webdriver.ChromeOptions()
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--log-level=3")
    options.add_argument("--disable-web-security")
    options.add_argument("--disable-site-isolation-trials")
    options.add_argument('--ignore-certificate-errors')
    options.add_argument('--lang=EN')

    # Set the paths for extensions
    nopecha_path = os.path.join(os.getcwd(), 'NopeCHA')
    entradas_ext_path = os.path.join(os.getcwd(), 'entradas_extension')
    extension_path = os.path.join(os.getcwd(), 'BP-Proxy-Switcher-Chrome')
    command = f"--load-extension={extension_path},{nopecha_path},{entradas_ext_path}"

    # Add VPN extension if needed
    if isVpn:
        if os.name == 'posix' and platform.system() == 'Darwin':
            vpn_extension_path = os.path.join(os.getcwd(), 'vpn')
        elif os.name == 'nt':
            vpn_extension_path = os.path.join(os.getcwd(), 'vpn')
        command += f',{vpn_extension_path}'

    # Add the extensions command
    options.add_argument(command)

    # Disable password manager popups
    prefs = {
        "credentials_enable_service": False,
        "profile.password_manager_enabled": False
    }
    options.add_experimental_option("prefs", prefs)

    # Specify the path to chromedriver in the current working directory
    chromedriver_path = os.path.join(os.getcwd(), 'chromedriver.exe')
    
    # Create a Service object using the chromedriver path
    service = Service(executable_path=chromedriver_path)
    if os.getlogin() in ['vladk','S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10', 'S11', 'S12', 'S13', 'S14', 'S15',
    'S3U1', 'S3U2', 'S3U3', 'S3U4', 'S3U5', 'S3U6', 'S3U7', 'S3U8', 'S3U9', 'S3U10', 'S3U11', 'S3U12', 'S3U13', 'S3U14', 'S3U15', 'S3U16',
    'Admin3']:
        driver = webdriver.Chrome(
            version_main=129,
            options=options,
            enable_cdp_events=True
        )
    else:
        driver = webdriver.Chrome(
            options=options,
            enable_cdp_events=True
        )
    time.sleep(5)
    try:
        tabs = driver.window_handles
        driver.switch_to.window(tabs[1])
        driver.close()
        driver.switch_to.window(tabs[0])
    except Exception as e:
        print(f"Error handling tabs: {e}")

    driver.get('https://nopecha.com/setup#zzfqud0q4yw58yyb|keys=|enabled=true|disabled_hosts=|hcaptcha_auto_open=true|hcaptcha_auto_solve=true|hcaptcha_solve_delay=true|hcaptcha_solve_delay_time=3000|recaptcha_auto_open=true|recaptcha_auto_solve=true|recaptcha_solve_delay=false|recaptcha_solve_delay_time=2000|funcaptcha_auto_open=true|funcaptcha_auto_solve=true|funcaptcha_solve_delay=true|funcaptcha_solve_delay_time=1000|awscaptcha_auto_open=false|awscaptcha_auto_solve=false|awscaptcha_solve_delay=true|awscaptcha_solve_delay_time=1000|turnstile_auto_solve=true|turnstile_solve_delay=true|turnstile_solve_delay_time=1000|perimeterx_auto_solve=false|perimeterx_solve_delay=true|perimeterx_solve_delay_time=1000|textcaptcha_auto_solve=false|textcaptcha_solve_delay=true|textcaptcha_solve_delay_time=100|textcaptcha_image_selector=|textcaptcha_input_selector=')
    if proxyList:
        driver.get('chrome://extensions/')
        time.sleep(1)

        # Example script to retrieve extensions
        script_array = """
                    const callback = arguments[0];
                    chrome.management.getAll((extensions) => {
                        callback(extensions);
                    });
                """

        # Execute the JavaScript and get the result
        extensions = driver.execute_async_script(script_array)
        filtered_extensions = [extension for extension in extensions if "BP Proxy Switcher" in extension['name']]

        vpn_id = [extension['id'] for extension in filtered_extensions if 'id' in extension][0]
        vpn_url = f'chrome-extension://{vpn_id}/popup.html'
        driver.get(vpn_url)
        # proxies = parse_data_from_file('proxies.txt')
        delete_tab = driver.find_element(By.XPATH, '//*[@id="deleteOptions"]')
        driver.execute_script("arguments[0].scrollIntoView();", delete_tab)
        delete_tab.click()
        time.sleep(1)
        driver.find_element(By.XPATH, '//*[@id="privacy"]/div[1]/input').click()
        driver.find_element(By.XPATH, '//*[@id="privacy"]/div[2]/input').click()
        driver.find_element(By.XPATH, '//*[@id="privacy"]/div[4]/input').click()
        driver.find_element(By.XPATH, '//*[@id="privacy"]/div[7]/input').click()
        optionsOK = driver.find_element(By.XPATH, '//*[@id="optionsOK"]')
        driver.execute_script("arguments[0].scrollIntoView();", optionsOK)
        optionsOK.click()
        time.sleep(1)
        edit = driver.find_element(By.XPATH, '//*[@id="editProxyList"]/small/b')
        driver.execute_script("arguments[0].scrollIntoView();", edit)
        edit.click()
        time.sleep(1)
        text_area = driver.find_element(By.XPATH, '//*[@id="proxiesTextArea"]')
        text_area.send_keys(proxyList)
        time.sleep(1)
        ok_button = driver.find_element(By.XPATH, '//*[@id="addProxyOK"]')
        driver.execute_script("arguments[0].scrollIntoView();", ok_button)
        ok_button.click()
        time.sleep(3)
        if not isVpn:
            proxy_switch_list = driver.find_elements(By.CSS_SELECTOR, '#proxySelectDiv > div > div > ul > li')
            if len(proxy_switch_list) == 3: proxy_switch_list[2].click()
            else: proxy_switch_list[random.randint(3, len(proxy_switch_list))-1].click()
            time.sleep(5)
        if isVpn:
            check_for_element(driver, '#proxySelectDiv', click=True)
            time.sleep(2)
        proxy_auto_reload_checkbox = driver.find_element(By.XPATH, '//*[@id="autoReload"]')
        driver.execute_script("arguments[0].scrollIntoView();", proxy_auto_reload_checkbox)
        proxy_auto_reload_checkbox.click()
        time.sleep(2)
    if isVpn:
        connect_vpn(driver)
    driver.get(initialUrl)
    print(Fore.GREEN + f"Thread {thread_number}: Successfully started!\n")
    time.sleep(10)

    solver = TwoCaptcha('ab8431ca9bda62c92650bc4040ba1754')
    sitekey = check_for_element(driver=driver,selector='.g-recaptcha', debug=True).get_attribute('data-sitekey')
    print(sitekey)
    try:
        result = solver.recaptcha(
            sitekey=sitekey,
            url=initialUrl)
        print('captcha result:', result)
    except Exception as e: print("captcha error:",e)

    input('continue?')

def is_port_open(host, port):
  try:
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(1)
    sock.connect((host, port))
    return True
  except (socket.timeout, ConnectionRefusedError):
    return False
  finally:
    sock.close()


if __name__ == "__main__":
    print(os.getlogin())
    eel.init('web')
    
    port = 8000
    while True:
        try:
            if not is_port_open('localhost', port):
                eel.start('main.html', size=(600, 800), port=port)
                break
            else:
                port += 1
        except OSError as e:
            print(e)
    # main()