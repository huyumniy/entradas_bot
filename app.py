import undetected_chromedriver as webdriver
import time
import os, sys, platform
import datetime
import tempfile
from flask import Flask, request, Response 
from slack_sdk import WebClient
from colorama import init, Fore
import subprocess
import requests
import threading
import socket
import eel
import soundfile as sf
import sounddevice as sd
from dotenv import load_dotenv
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

class ProxyExtension:
    manifest_json = """
    {
        "version": "1.0.0",
        "manifest_version": 2,
        "name": "Chrome Proxy",
        "permissions": [
            "proxy",
            "tabs",
            "unlimitedStorage",
            "storage",
            "<all_urls>",
            "webRequest",
            "webRequestBlocking"
        ],
        "background": {"scripts": ["background.js"]},
        "minimum_chrome_version": "76.0.0"
    }
    """

    background_js = """
    var config = {
        mode: "fixed_servers",
        rules: {
            singleProxy: {
                scheme: "http",
                host: "%s",
                port: %d
            },
            bypassList: ["localhost"]
        }
    };

    chrome.proxy.settings.set({value: config, scope: "regular"}, function() {});

    function callbackFn(details) {
        return {
            authCredentials: {
                username: "%s",
                password: "%s"
            }
        };
    }

    chrome.webRequest.onAuthRequired.addListener(
        callbackFn,
        { urls: ["<all_urls>"] },
        ['blocking']
    );
    """

    def __init__(self, host, port, user, password):
        self._dir = os.path.normpath(tempfile.mkdtemp())

        manifest_file = os.path.join(self._dir, "manifest.json")
        with open(manifest_file, mode="w") as f:
            f.write(self.manifest_json)
        background_js = self.background_js % (host, int(port), user, password)
        background_file = os.path.join(self._dir, "background.js")
        with open(background_file, mode="w") as f:
            f.write(background_js)

    @property
    def directory(self):
        return self._dir

    def __del__(self):
        shutil.rmtree(self._dir)

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


def parse_data_from_file(file_path):
    with open(file_path, 'r') as file:
        lines = file.readlines()

    # Parse each line into (email, password, proxy)
    data = ''
    for line in lines:
        data += line + '\n'
    
    return data


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
    subprocess.Popen([sys.executable, '/server.py'])


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
    if os.getlogin() in ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10', 'S11', 'S12', 'S13', 'S14', 'S15',
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
    while True:
        try:
            # madridista = input(
            #     'Madridista [Y:N] (default is N):').lower().strip() == "y"
            # if madridista:
            #     numero_mad=input('Número de Socio/Madridista Premium: ').strip()
            #     con_mad=input('Contraseña: ').strip()
            #     while True:
            #         try:
            #             acom = int(input('Acompañantes : '))
            #             try:
            #                 if acom in range(10):
            #                     break
            #             except:
            #                 raise Exception('INVLD 1')
            #         except:
            #             print('Please insert correct values')
            # while True:
            #     try:
            #         ent = int(input('NUM ENTRADAS : '))
            #         try:
            #             if ent in range(1, 7):
            #                 break
            #         except:
            #             raise Exception('INVLD 2')
            #     except:
            #         print('Please insert correct values')
            # while True:
            #     try:
            #         maxprc = int(input('Max Price: '))
            #         break
            #     except:
            #         print('Please insert correct values')
            # while True:
            #     try:
            #         minprc = int(input('Min Price: '))
            #         break
            #     except:
            #         print('Please insert correct values')
            # while True:
            #     try:
            #         ar = input('F : FRONTAL // L: LATERAL //0 : ALL : ').lower().strip()
            #         if ar in ['f', 'l', '0']:
            #             break
            #         else:
            #             raise Exception('NOT FL0')
            #     except:
            #         print('Please insert correct values')

            # driver.get(lnks[id1])
            # ensure_check_elem(driver,'//button[./span[contains(text(),"ar en")]]', click=True)
            no_stadium = True
            ticketBotSettings = None
            while no_stadium:
                window_handles = driver.window_handles  # Fetch current window handles
                for index, handle in enumerate(window_handles):
                    try:
                        # Use JavaScript to check if the document is still available in the specific window
                        script = """
                            try {
                                var element = document.evaluate(arguments[0], document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                                if (element) {
                                    return { found: true, text: element.textContent };
                                } else {
                                    return { found: false };
                                }
                            } catch (e) {
                                return { error: true };
                            }
                        """
                        result = driver.execute_script(script, '//*[@id="num-entradas"]')  # Adjust the XPath

                        # If there was an error in accessing the window/tab
                        if 'error' in result and result['error']:
                            print(f"Error accessing tab {index + 1} ({handle})")
                            continue  # Skip to the next tab

                        # If the element is found
                        if result['found']:
                            ticketBotSettings = get_local_data(driver)  # Get local data for the tab
                            if ticketBotSettings:
                                ticketBotSettings = json.loads(ticketBotSettings)
                                print(f"Element found in tab {index + 1}: {result['text']}, {ticketBotSettings}")
                                no_stadium = False
                                break  # Exit the loop if the element is found
                        else:
                            print(f"Element not found in tab {index + 1} ({handle})")
                    except Exception as e:
                        # Handle any unexpected exceptions (e.g., window closed during iteration)
                        print(f"Unexpected error in tab {index + 1}: {str(e)}")
                time.sleep(5)

            print('FOUND STADIUM')

            while True:
                try:
                    r = driver.title
                    break
                except:
                    try:
                        driver.switch_to.window(driver.window_handles[0])
                    except:
                        pass
            
            while True:
                ticketBotSettings = json.loads(get_local_data(driver))
                madridista = bool(ticketBotSettings['isMadridista'])
                ent = int(ticketBotSettings['amount'])
                maxprc = int(ticketBotSettings['maxPrice'])
                minprc = int(ticketBotSettings['minPrice'])
                ar = ticketBotSettings['radio']
                numero_mad = None
                con_mad = None
                acom = None
                result = driver.execute_script("return window.localStorage.getItem('stopExecution');")

                if result:
                    time.sleep(5)
                    continue
                if ticketBotSettings['madridista']:
                    numero_mad = ticketBotSettings['madridista'].get('login')
                    con_mad = ticketBotSettings['madridista'].get('password')
                    acom = str(ticketBotSettings['selection'])
                print(madridista, ent, maxprc, minprc, ar, numero_mad, con_mad, acom)
                
                # driver.delete_all_cookies()
                driver.refresh()
                while 'laliga.queue-it.net' in driver.current_url: time.sleep(1)
                try:
                    ensure_check_elem(driver, '//*[@class="active"][@id="seleccion-entradas"] | //*[@id="num-entradas"]')

                except:
                    print('Can\'t find stadium page. Waiting for 30 sec.')
                    time.sleep(30)
                    continue
                    # try:
                    #     ensure_check_elem(driver, '//*[contains(text(),"nible a par")]',tmt=1)
                    #     print('No sale')
                    #     break
                    # except:
                    #     print('ISK0')
                    #     break
                match_data = True
                while match_data:
                    try:
                        check_for_element(driver, '//*[@id="onetrust-accept-btn-handler"]', xpath=True, click=True)
                        driver.execute_script("document.querySelector('div.onetrust-pc-dark-filter.ot-fade-in').remove()")
                    except:
                        pass
                    
                    try:
                        ensure_check_elem(driver, '#alert-ok', tmt=5, methode=By.CSS_SELECTOR, click=True)
                    except:
                        pass
                    if madridista:
                        # try:
                        #     ensure_check_elem(driver, '//*[@id="select-ticket-container"]//a[contains(text(),"ista Pr")]',click=True)
                        #     ensure_check_elem(driver, '//*[@id="nsocioG"]',click=True).send_keys(numero_mad)
                        #     ensure_check_elem(driver, '//*[@id="nsocioG"]',click=True).send_keys(con_mad)
                        #     Select(check_for_element(driver, '//*[@id="num-entradas"]', xpath=True)).select_by_index(ent)
                        # except:
                        #     pass
                        try:
                            is_member_field = check_for_element(driver, 'div[id="member-login-socios"][style="display: block;"]')
                            if not is_member_field: 
                                check_for_element(driver, '#socio-no-abonado', click=True)
                                time.sleep(1)
                            login_input = check_for_element(driver, '#nsocio', click=True)
                            login_input.clear()
                            login_input.send_keys(numero_mad)
                            password_input = check_for_element(driver, '#pinsocio', click=True)
                            password_input.clear()
                            password_input.send_keys(con_mad)
                            num_friends_selector = check_for_element(driver, '#num-friends')
                            Select(num_friends_selector).select_by_visible_text(acom)
                            check_for_element(driver, '#valida-socio', click=True)
                            erorr_message = wait_for_element(driver, 'div[style="width:500px;"][class="error message"]')
                            time.sleep(2)
                            if erorr_message: match_data = False
                        except Exception as e: 
                            print(e)
                            time.sleep(5)
                            match_data = False
                    else:
                        try:
                            try:
                                ensure_check_elem(driver, '//*[@id="num-entradas"]', methode=By.XPATH, tmt=2)
                            except: pass
                            check_for_element(driver, '#no-socio-abonado', click=True)
                            check_for_element(driver, '#no-socio-simpatizante', click=True)
                            Select(driver.find_element(
                                By.XPATH, '//*[@id="num-entradas"]')).select_by_index(ent)
                        except Exception as e: 
                            time.sleep(5)
                            match_data = False
                    try:
                        ensure_check_elem(driver, '#alert-ok', tmt=2, methode=By.CSS_SELECTOR, click=True)
                    except:
                        pass
                    try:
                        driver.find_element(
                            By.XPATH, '//*[@id="boton-seleccion-entradas"]').click()
                    except:
                        pass
                    try:
                        driver.find_element(By.ID, 'alert-ok').click()
                    except:
                        pass
                    break
                if match_data == False: continue
                sectors = None
                try:
                    try:
                        driver.find_element(
                            By.XPATH, '//*[@id="onetrust-accept-btn-handler"]').click()
                        driver.execute_script("document.querySelector('div.onetrust-pc-dark-filter.ot-fade-in').remove()")
                    except:
                        pass
                    if 'l' == ar.lower(): sectors = check_for_elements(driver, "g[data-name^='Lateral'][class='sector']")
                    elif 'f' == ar.lower(): sectors = check_for_elements(driver, "g[data-name^='Fondo'][class='sector']")
                    else: sectors = check_for_elements(driver, "g[data-name][class='sector']")
                    if type(sectors) == None: continue
                    if len(sectors) < 1: continue
                    random_sector = random.choice(sectors)
                    random_sector.click()
                except Exception as e:
                    print(e)
                    time.sleep(.5)
                    continue
                try:
                    driver.find_element(
                        By.XPATH, '//*[@id="onetrust-accept-btn-handler"]').click()
                    driver.execute_script("document.querySelector('div.onetrust-pc-dark-filter.ot-fade-in').remove()")
                except:
                    pass
                
                bnms = []

                for b in driver.find_elements(By.XPATH, '//*[@id="regular-price-list"]/li | //*[@id="vip-price-list"]/li'):
                    dp = b.get_attribute('data-price')
                    dpd = b.get_attribute('data-price-desc')
                    try:
                        if int(dp) in range(minprc, maxprc+1):
                            bnms.append(dpd)
                            b.click()
                    except:
                        pass
                vsel = '|'.join([f'//*[@data-price-desc="{bnm}"]/tspan' for bnm in bnms])
                try:
                    ensure_check_elem(driver, 'text > tspan[class="newZoneClick"]', methode=By.CSS_SELECTOR, tmt=4)
                except:
                    print('No tickets')
                    continue
                no_zones = True
                while no_zones:
                    active_zones = driver.find_elements(
                            By.CSS_SELECTOR, 'text > tspan[class="newZoneClick"]')
                    if len(active_zones) < 1: no_zones = False
                    try:
                        zns = choice(active_zones).click()
                        break
                    except:
                        time.sleep(.6)
                    try:
                        driver.find_element(
                            By.XPATH, '//*[@id="onetrust-accept-btn-handler"]').click()
                        driver.execute_script("document.querySelector('div.onetrust-pc-dark-filter.ot-fade-in').remove()")
                    except:
                        pass
                if not no_zones: continue
                tk_niet = True

                max_attempts = 5
                attempts = 0
                while True:
                    try:
                        tur = driver.find_element(By.ID, 'alert-ok').click()
                        tk_niet = False
                        break
                    except:
                        attempts += 1
                        time.sleep(1)
                        if attempts >= max_attempts:
                            print("Exceeded maximum attempts. Breaking from the loop.")
                            tk_niet = False
                            break

                    try:
                        driver.find_element(By.XPATH, '//*[@class="seatSelected"]')
                        tk_niet = True
                        break
                    except:
                        pass
                    time.sleep(.5)
                if not tk_niet:
                    print('no tickets available')
                    continue

                ensure_check_elem(driver, '//*[@id="cuerpo-resumen-compra"]/tr')
                tr_dtx = []
                for tr in driver.find_elements(By.XPATH, '//*[@id="cuerpo-resumen-compra"]/tr'):
                    tr_dtx.append([int(xt) for xt in tr.text.split('€')[0].split(' ')[-4:-2]])
                filas = list(set([e[0] for e in tr_dtx]))
                asientos = [e[1] for e in tr_dtx]
                mx_as = max(asientos)
                mn_as = min(asientos)

                if asientos[0] % 2 == 0:
                    sts = [s for s in range(mn_as, mx_as+1) if s % 2 == 0]
                else:
                    sts = [s for s in range(mn_as, mx_as+1) if s % 2 != 0]
                try: total=float(ensure_check_elem(driver, '//*[@id="total-price"]').text.split(' ')[0].replace(',',''))
                except: pass
                try: total=float(ensure_check_elem(driver, '//*[@id="total-price"]').text.split(' ')[0].replace(',','.'))
                except: pass
                # if not(total>minprc*ent and maxprc*ent>total):
                #     print('problem')
                if list(set(sts)) == list(set(asientos)) and (total>minprc*ent and maxprc*ent>total):
                    ensure_check_elem(driver, '//*[@id="boton-compra"]', click=True)
                    try:
                        ensure_check_elem(driver, 
                            '//*[@id="onetrust-accept-btn-handler"]', tmt=20, click=True)
                        driver.execute_script("document.querySelector('div.onetrust-pc-dark-filter.ot-fade-in').remove()")
                    except: pass
                    try:
                        u = driver.find_element(
                            By.XPATH, '//*[@class="nominative-row-title"]')
                        data_play, fs = sf.read('noti.wav', dtype='float32')  
                        sd.play(data_play, fs)
                        status = sd.wait()
                        seats = None
                        driver.execute_script("window.localStorage.setItem('stopExecution', 'true');")
                        if isSlack:
                            match = check_for_element(driver, 'div[class="event-name"]')
                            quantity = check_for_element(driver, 'label[id="numero-entradas"]')
                            date_and_time = check_for_element(driver, 'li[class="selective-date"]')
                            category = check_for_element(driver, 'li:has(table[class="shopDetail table"]) > p:nth-child(2)')
                            sector = check_for_element(driver, 'li:has(table[class="shopDetail table"]) > p:nth-child(3)')
                            seats_raw = check_for_elements(driver, 'li:has(table[class="shopDetail table"]) > p:nth-child(n+4)')
                            total_price = check_for_element(driver, 'label[id="totalPrice"]')
                            if quantity: quantity = quantity.text
                            if match: match = match.text
                            if date_and_time: date_and_time = date_and_time.text
                            if category: category = category.text
                            if sector: sector = sector.text
                            if seats_raw: seats = [seat.text for seat in seats_raw]
                            if total_price: total_price = total_price.text

                            cookies = driver.get_cookies()
                            ua = driver.execute_script('return navigator.userAgent')
                            url = driver.current_url
                            data = {
                                "url": url,
                                "match": match,
                                "date": date_and_time,
                                "quantity": quantity,
                                "total": total_price,
                                "category": category, 
                                "sector": sector,
                                "seats": seats,
                                "cookies": cookies,
                                "user_agent": ua
                            }
                            post_request(data)
                        restart = True
                        while restart:
                            result = driver.execute_script("return window.localStorage.getItem('stopExecution');")
                            if not json.loads(result):
                                driver.back()
                                try:
                                    WebDriverWait(driver, 5).until(
                                        lambda driver: driver.execute_script("return document.readyState") == "complete"
                                    )
                                except:pass
                                driver.refresh()
                                restart = False
                            time.sleep(5)
                        break
                    except Exception as e:
                        print(e)
                else:
                    print(f'tickets aren\'t near each other, or Total price {total/ent}/ticket not in range ')
        except Exception as e:
            try:
                current_datetime = datetime.datetime.now()
                formatted_datetime = current_datetime.strftime("%d %H:%M:%S")
                error_message = f'{formatted_datetime} - An error occurred: {str(e)}'
                with open('error_log.txt', 'a') as file:
                    file.write(error_message + '\n')
                time.sleep(60)
            except: time.sleep(60)


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