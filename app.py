import undetected_chromedriver as webdriver
from selenium import webdriver
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from selenium.webdriver.chrome.service import Service
from pyshadow.main import Shadow
from webdriver_manager.chrome import ChromeDriverManager
from random import choice
import logging
from webdriver_manager.core.logger import __logger as wdm_logger

entrada = "https://www.entradas.com/artist/real-madrid-c-f/"

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

import pyautogui,time,threading
def solveit():
    while True:
        try:
            b=pyautogui.locateCenterOnScreen('b.png')
            if b != None:
                pyautogui.click(b)
                print('found b')
                try:
                    e=pyautogui.locateCenterOnScreen('e.png')
                except:
                    pass
        except:
            continue
        time.sleep(2)
        try:
            r=pyautogui.locateCenterOnScreen('r.png')
            if r != None:
                pyautogui.click(r)
                print('found r')
                try:
                    e=pyautogui.locateCenterOnScreen('e.png')
                except:
                    pass
        except:
            continue
        time.sleep(2)
b = threading.Thread(name='background', target=solveit)

b.start()
wdm_logger.setLevel(logging.WARNING)

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
# driver=webdriver.Chrome(options=options)
driver = webdriver.Chrome(service=Service(chrome_a_), options=options)


def check_for_captcha():
    try:
        captcha_iframe = driver.find_element(By.CSS_SELECTOR, 'iframe[title="recaptcha challenge expires in two minutes"]')
        print('found captcha_iframe')
        driver.switch_to.frame(captcha_iframe)
        print('found iframe_driver')
        solve_captcha_frame = driver.find_element(By.CSS_SELECTOR, 'div[class="button-holder help-button-holder"]')
        print('found solve_captcha_frame')
        # driver.switch_to(solve_captcha_frame)
        # print('switched to solve_captcha_frame')
        captcha = driver.find_element(By.CSS_SELECTOR, '#solver-button')
        print('found captcha!!')
        captcha.click()
        time.sleep(5)
        captcha.click()
        return True
    except: return False

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
    try:ensure_check_elem('//*[contains(@href,"tSele")]',tmt=1, click=True)
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

        driver.delete_all_cookies()
        driver.refresh()
        try:
            ensure_check_elem('//*[@class="active"][@id="seleccion-entradas"]')
        except:
            try:
                ensure_check_elem('//*[contains(text(),"nible a par")]',tmt=1)
                print('No sale')
                break
            except:
                print('ISK0')
                break

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
                break
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
        try:
            ensure_check_elem('//*[@id="sectors-list"]/li',tmt=2)
        except:
            print('No Valid Sectors')
            continue
        while True:
            try:
                print(check_for_captcha())
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
            print('OPACHKI!!!')
            time.sleep(100)
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

        while True:
            try:
                tur = driver.find_element(By.ID, 'alert-ok').click()
                tk_niet = False
                break
            except:
                pass

            try:
                driver.find_element(By.XPATH, '//*[@class="seatSelected"]')
                tk_niet = True
                break
            except:
                pass
            time.sleep(.5)
        if not tk_niet:
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
        
