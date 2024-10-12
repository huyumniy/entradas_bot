import undetected_chromedriver as webdriver
import time
import os, sys
import datetime
import tempfile
import requests
import soundfile as sf
import sounddevice as sd
import random
import asyncio
import shutil
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from selenium.webdriver.chrome.service import Service
from pyshadow.main import Shadow
# from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException
import json
from random import choice
import logging
# from webdriver_manager.core.logger import __logger as wdm_logger

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


def post_request(data, endpoint='/book', port='80'):
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


def main():
    options = webdriver.ChromeOptions()
    options.add_argument("--log-level=3")
    options.add_argument('--disable-infobars')
    options.add_argument('--disable-features=TranslateUI')
    options.add_argument('--disable-translate')
    options.add_argument('--ignore-certificate-errors')
    options.add_argument('--lang=EN')
    nopecha_path = os.getcwd() + '/NopeCHA'
    extension_path = os.getcwd() + '/BP-Proxy-Switcher-Chrome'
    entradas_ext_path = os.getcwd() + '/entradas_extension'
    options.add_argument(f"--load-extension={extension_path},{nopecha_path},{entradas_ext_path}")
    prefs = {"credentials_enable_service": False,
        "profile.password_manager_enabled": False}
    options.add_experimental_option("prefs", prefs)
    driver = webdriver.Chrome(
        options=options,
        enable_cdp_events=True
    )

    driver.get('https://nopecha.com/setup#zzfqud0q4yw58yyb|keys=|enabled=true|disabled_hosts=|hcaptcha_auto_open=true|hcaptcha_auto_solve=true|hcaptcha_solve_delay=true|hcaptcha_solve_delay_time=3000|recaptcha_auto_open=true|recaptcha_auto_solve=true|recaptcha_solve_delay=false|recaptcha_solve_delay_time=2000|funcaptcha_auto_open=true|funcaptcha_auto_solve=true|funcaptcha_solve_delay=true|funcaptcha_solve_delay_time=1000|awscaptcha_auto_open=false|awscaptcha_auto_solve=false|awscaptcha_solve_delay=true|awscaptcha_solve_delay_time=1000|turnstile_auto_solve=true|turnstile_solve_delay=true|turnstile_solve_delay_time=1000|perimeterx_auto_solve=false|perimeterx_solve_delay=true|perimeterx_solve_delay_time=1000|textcaptcha_auto_solve=false|textcaptcha_solve_delay=true|textcaptcha_solve_delay_time=100|textcaptcha_image_selector=|textcaptcha_input_selector=')


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
    proxies = parse_data_from_file('proxies.txt')
    delete_tab = driver.find_element(By.XPATH, '//*[@id="deleteOptions"]')
    delete_tab.click()
    time.sleep(1)
    driver.find_element(By.XPATH, '//*[@id="privacy"]/div[1]/input').click()
    driver.find_element(By.XPATH, '//*[@id="privacy"]/div[2]/input').click()
    driver.find_element(By.XPATH, '//*[@id="privacy"]/div[4]/input').click()
    driver.find_element(By.XPATH, '//*[@id="privacy"]/div[7]/input').click()
    driver.find_element(By.XPATH, '//*[@id="optionsOK"]').click()
    time.sleep(1)
    edit = driver.find_element(By.XPATH, '//*[@id="editProxyList"]/small/b')
    edit.click()
    time.sleep(1)
    text_area = driver.find_element(By.XPATH, '//*[@id="proxiesTextArea"]')
    text_area.send_keys(proxies)
    time.sleep(1)
    ok_button = driver.find_element(By.XPATH, '//*[@id="addProxyOK"]')
    ok_button.click()
    time.sleep(1)
    proxy_switch_list = driver.find_elements(By.CSS_SELECTOR, '#proxySelectDiv > div > div > ul > li')
    print(len(proxy_switch_list))
    if len(proxy_switch_list) == 3: proxy_switch_list[2].click()
    else: proxy_switch_list[random.randint(3, len(proxy_switch_list))-1].click()
    time.sleep(5)
    proxy_auto_reload_checkbox = driver.find_element(By.XPATH, '//*[@id="autoReload"]')
    proxy_auto_reload_checkbox.click()
    time.sleep(2)

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
                for index in range(len(driver.window_handles)):
                    driver.switch_to.window(driver.window_handles[index])  # Switch to the tab
                    try:
                        
                        element = check_for_element(driver, '//*[@id="num-entradas"]', xpath=True)  # Replace with the appropriate method
                        
                        ticketBotSettings = get_local_data(driver)
                        if element and ticketBotSettings:
                            ticketBotSettings = json.loads(ticketBotSettings)
                            print(f"Element found in tab {index + 1} ({driver.current_url}): {element.text}, {ticketBotSettings}")
                            no_stadium = False
                    except NoSuchElementException:
                        print(f"Element not found in tab {index + 1} ({driver.current_url})")
                    except Exception as e: 
                        print(e)
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
                        dpdwn = check_for_element(driver, '//*[@class="active"][@id="seleccion-entradas"]', xpath=True)
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
                            time.sleep(5)
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
                try:
                    driver.find_element(By.XPATH, '//*[@class="active"][@id="seleccion-entradas"]')
                    continue
                except:
                    pass
                try:
                    ensure_check_elem(driver, '//*[@id="sectors-list"]/li',tmt=2)
                except:
                    print('No Valid Sectors')
                    continue
                while True:
                    try:
                        try:
                            driver.find_element(
                                By.XPATH, '//*[@id="onetrust-accept-btn-handler"]').click()
                            driver.execute_script("document.querySelector('div.onetrust-pc-dark-filter.ot-fade-in').remove()")
                        except:
                            pass
                        sectors = driver.find_elements(
                            By.XPATH, '//*[@id="sectors-list"]/li')
                        if ar == 'f':
                            choice(sectors[:2]).click()
                        elif ar == 'l':
                            choice(sectors[2:]).click()
                        else:
                            choice(sectors).click()
                        break
                    except:
                        time.sleep(.5)
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
                    ensure_check_elem(driver, '//*[@class="newZoneClick"]',tmt=4)
                except:
                    print('No tickets')
                    continue
                while True:

                    try:
                        zns = choice(driver.find_elements(
                            By.XPATH, '//*[@class="newZoneClick"]')).click()
                        break
                    except:
                        time.sleep(.6)
                    try:
                        driver.find_element(
                            By.XPATH, '//*[@id="onetrust-accept-btn-handler"]').click()
                        driver.execute_script("document.querySelector('div.onetrust-pc-dark-filter.ot-fade-in').remove()")
                    except:
                        pass
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
                    except Exception as e:
                        print(e)
                    try:
                        u = driver.find_element(
                            By.XPATH, '//*[@class="nominative-row-title"]')
                        data, fs = sf.read('noti.wav', dtype='float32')  
                        sd.play(data, fs)
                        status = sd.wait()
                        seats = None
                        driver.execute_script("window.localStorage.setItem('stopExecution', 'true');")
                        match = check_for_element(driver, 'div[class="event-name"]')
                        quantity = check_for_element(driver, 'label[id="numero-entradas"]')
                        date_and_time = check_for_element(driver, 'li[class="selective-date"]')
                        category = check_for_element(driver, 'li:has(table[class="shopDetail table"]) > p:nth-child(2)')
                        sector = check_for_element(driver, 'li:has(table[class="shopDetail table"]) > p:nth-child(3)')
                        seats_raw = check_for_elements(driver, 'li:has(table[class="shopDetail table"]) > p:nth-child(n+4)')
                        total_price = check_for_element(driver, 'label[id="totalPrice"]')
                        if quantity: quantity = quantity.text
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
            except: pass

if __name__ == "__main__":
    main()