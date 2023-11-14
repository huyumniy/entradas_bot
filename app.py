import undetected_chromedriver as webdriver
from selenium import webdriver
import time
import os, sys
import tempfile
import requests
import soundfile as sf
import sounddevice as sd
import shutil
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from selenium.webdriver.chrome.service import Service
from pyshadow.main import Shadow
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from random import choice
import logging
from webdriver_manager.core.logger import __logger as wdm_logger

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



def ensure_check_elem(selector, methode=By.XPATH, tmt=20, click=False):
    global driver
    global shadow
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


def rplc(x):
    lst = ['.', '/', '\\']
    for x1 in lst:
        x = x.replace(x1, ' ')
    return x.replace('  ', ' ')


def check():
    while True:
        a = input('>> ')
        if a == "exit":
            break
        try:
            print(eval(a))
        except Exception as r:
            print(r)


chrome_a_ = ChromeDriverManager().install()

options = webdriver.ChromeOptions()
options.add_argument("--log-level=3")
options.add_argument('--disable-infobars')
options.add_argument('--disable-gpu')
options.add_extension('./bcsh.crx')
options.add_experimental_option("excludeSwitches", ['enable-automation'])
options.add_argument('--disable-features=TranslateUI')
options.add_argument('--disable-translate')
options.add_argument('--ignore-certificate-errors')
extension_path = os.getcwd() + '/NopeCHA'
proxy = input('proxy (host:port:user:password): ')
proxy_change_url = input('change ip url: ')
proxy_extension = ProxyExtension(*(proxy.split(':')))
options.add_argument(f"--load-extension={proxy_extension.directory},{extension_path}")

# driver=webdriver.Chrome(options=options)
driver = webdriver.Chrome(service=Service(chrome_a_), options=options)

driver.get('https://nopecha.com/setup#sub_1NnGb4CRwBwvt6ptDqqrDlul|enabled=true|disabled_hosts=%5B%5D|hcaptcha_auto_open=true|hcaptcha_auto_solve=true|hcaptcha_solve_delay=true|hcaptcha_solve_delay_time=3000|recaptcha_auto_open=true|recaptcha_auto_solve=true|recaptcha_solve_delay=true|recaptcha_solve_delay_time=1000|recaptcha_solve_method=Image|funcaptcha_auto_open=true|funcaptcha_auto_solve=true|funcaptcha_solve_delay=true|funcaptcha_solve_delay_time=0|awscaptcha_auto_open=true|awscaptcha_auto_solve=true|awscaptcha_solve_delay=true|awscaptcha_solve_delay_time=0|textcaptcha_auto_solve=true|textcaptcha_solve_delay=true|textcaptcha_solve_delay_time=0|textcaptcha_image_selector=|textcaptcha_input_selector=')


def change_ip(url):
    try:
        response = requests.get(url)

        # Check if the request was successful (status code 200)
        if response.status_code == 200:
            # You can print the response content or return it as needed
            # For example, printing the response content:
            print(response.text)
        else:
            print(f"Request failed with status code {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")



while True:
    driver.get(entrada)
    shadow = Shadow(driver)
    dv_tmt = 0
    while True:
        if dv_tmt >= 3:
            break
        try:
            shadow.find_element('#cmpwelcomebtnyes a').click()
            break
        except:
            time.sleep(2)
            dv_tmt += 1
    try: ensure_check_elem('//*[contains(@href,"tSele")]',tmt=1, click=True)
    except:pass
    ensure_check_elem('//div[@role="link"][.//*[contains(text(),"omp")]]')
    lnks = []
    print('ID , Match')
    for i, li in enumerate(driver.find_elements(By.XPATH, '//div[@role="link"][.//*[contains(text(),"omp")]]')):
        lnks.append(li.find_element(
            By.XPATH, '..//*[contains(text(),"omp")]').get_attribute('href'))
        print(i, li.find_element(By.XPATH, '..//h2').text)
    while True:
        try:
            id1 = int(input('ID : '))
            try:
                if id1 in range(len(lnks)):
                    break
            except:
                raise Exception('INVLD 1')
        except:
            print('Please insert correct values')
    madridista = input(
        'Madridista [Y:N] (default is N):').lower().strip() == "y"
    if madridista:
        numero_mad=input('Número de Socio/Madridista Premium: ').strip()
        con_mad=input('Contraseña: ').strip()
        while True:
            try:
                acom = int(input('Acompañantes : '))
                try:
                    if acom in range(10):
                        break
                except:
                    raise Exception('INVLD 1')
            except:
                print('Please insert correct values')
    while True:
        try:
            ent = int(input('NUM ENTRADAS : '))
            try:
                if ent in range(1, 7):
                    break
            except:
                raise Exception('INVLD 2')
        except:
            print('Please insert correct values')
    while True:
        try:
            maxprc = int(input('Max Price: '))
            break
        except:
            print('Please insert correct values')
    while True:
        try:
            minprc = int(input('Min Price: '))
            break
        except:
            print('Please insert correct values')
    while True:
        try:
            ar = input('F : FRONTAL // L: LATERAL //0 : ALL : ').lower().strip()
            if ar in ['f', 'l', '0']:
                break
            else:
                raise Exception('NOT FL0')
        except:
            print('Please insert correct values')

    driver.get(lnks[id1])
    ensure_check_elem('//button[./span[contains(text(),"ar en")]]', click=True)
    while len(driver.window_handles) == 1:
        time.sleep(1)
    while len(driver.window_handles) != 1:
        try:
            driver.switch_to.window(driver.window_handles[0])
        except:
            continue
        driver.close()
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

        # driver.delete_all_cookies()
        driver.refresh()
        try:
            ensure_check_elem('//*[@class="active"][@id="seleccion-entradas"]')
        except:
            print('403. changing ip')
            change_ip(proxy_change_url)
            time.sleep(30)
            continue
            # try:
            #     ensure_check_elem('//*[contains(text(),"nible a par")]',tmt=1)
            #     print('No sale')
            #     break
            # except:
            #     print('ISK0')
            #     break

        while True:
            try:
                driver.find_element(
                    By.XPATH, '//*[@id="onetrust-accept-btn-handler"]').click()
                driver.execute_script("document.querySelector('div.onetrust-pc-dark-filter.ot-fade-in').remove()")
            except:
                pass
            
            try:
                dpdwn = driver.find_element(
                    By.XPATH, '//*[@class="active"][@id="seleccion-entradas"]')
            except:
                pass
            if madridista:
                try:
                    ensure_check_elem('//*[@id="select-ticket-container"]//a[contains(text(),"ista Pr")]',click=True)
                    ensure_check_elem('//*[@id="nsocioG"]',click=True).send_keys(numero_mad)
                    ensure_check_elem('//*[@id="pinsocioG"]',click=True).send_keys(con_mad)
                    Select(driver.find_element(
                        By.XPATH, '//*[@id="num-entradas"]')).select_by_index(ent)
                except:
                    pass
            else:
                try:
                    Select(driver.find_element(
                        By.XPATH, '//*[@id="num-entradas"]')).select_by_index(ent)
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
        try:
            driver.find_element(By.XPATH, '//*[@class="active"][@id="seleccion-entradas"]')
            continue
        except:
            pass
        try:
            ensure_check_elem('//*[@id="sectors-list"]/li',tmt=2)
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
        for b in driver.find_elements(By.XPATH, '//*[@id="regular-price-list"]/li'):
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
            ensure_check_elem('//*[@class="newZoneClick"]',tmt=4)
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

        ensure_check_elem('//*[@id="cuerpo-resumen-compra"]/tr')
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
        total=float(ensure_check_elem('//*[@id="total-price"]').text.split(' ')[0].replace(',','.'))
        # if not(total>minprc*ent and maxprc*ent>total):
        #     print('problem')
        if list(set(sts)) == list(set(asientos)) and (total>minprc*ent and maxprc*ent>total):
            ensure_check_elem('//*[@id="boton-compra"]', click=True)
            try:
                ensure_check_elem(
                    '//*[@id="onetrust-accept-btn-handler"]', tmt=20, click=True)
                driver.execute_script("document.querySelector('div.onetrust-pc-dark-filter.ot-fade-in').remove()")
            except:
                pass
            try:
                u = driver.find_element(
                    By.XPATH, '//*[@class="nominative-row-title"]')
                data, fs = sf.read('noti.wav', dtype='float32')  
                sd.play(data, fs)
                status = sd.wait()
                lastcom = input(
                    'q: to quit or ENTER to start selecting again: ').lower()
                if lastcom.strip() == 'q':
                    driver.quit()
                    exit()
                break
            except:
                pass
        else:
            print(f'tickets aren\'t near each other, or Total price {total/ent}/ticket not in range ')
