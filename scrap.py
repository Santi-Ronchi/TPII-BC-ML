import csv
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import time

def obtener_datos(url):
    service = start_driver()
    driver = webdriver.Chrome(service=service)

    driver.get(url)

    wait = WebDriverWait(driver, 10)
    
    html_content = driver.page_source

    soup = BeautifulSoup(html_content, 'html.parser')

    try:
        close_cookies(driver)
    except:
        print("No se pudo eliminar banner de cookies")

    try:
        texto_caracteristicas_extra = get_text_extra_features(driver, soup, wait)
    except:
        texto_caracteristicas_extra = ""
        print("No se encontraron caracteristicas extra")

    driver.quit()

    try: 
        price_value = soup.select_one('.price-value span span')
        price = price_value.get_text(strip=True) if price_value else None

        expenses_value = soup.select_one('.price-expenses')
        expenses = expenses_value.get_text(strip=True).replace("Expensas", "") if expenses_value else None

        direccion = soup.find('div', class_='section-location-property section-location-property-classified').find('h4').text.strip()
        split = direccion.split(", ")
        elementos = len(split)

        localidad = split[elementos-2].strip() + str(", ") + split[elementos-1]
        direccion = " ".join(split[:elementos-2])

        features = get_features(soup)
        features_parse = parse_features(features)

        extra_features = get_extra_features(texto_caracteristicas_extra)

        dicc_principal = {
            "Precio": price,
            "Expensas": expenses,
            "Direccion": direccion,
            "Localidad": localidad
        }

        dicc_principal.update(features_parse)

        dicc_principal.update(extra_features)

        escribir_diccionario_a_csv(dicc_principal)
    except:
        print("Saltear propiedad")

def close_cookies(driver):
    cookies_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, 'button[data-qa="cookies-policy-banner"]'))
    )
    cookies_button.click()

def parse_features(features):
    estructura_diccionario = {
        'icon-stotal': None,
        'icon-scubierta': None,
        'icon-ambiente': None,
        'icon-bano': None,
        'icon-dormitorio': None,
        'icon-antiguedad': None,
        'icon-disposicion': None,
        'icon-orientacion': None,
        'icon-luminosidad': None,
        'icon-cochera': None,
        'icon-toilete': None,
        "icon-inmueble": None
    }

    diccionario_final = estructura_diccionario.copy()
    diccionario_final.update(features)
    
    return diccionario_final 

def get_text_extra_features(driver, soup, wait):
    caracteristicas_extra = soup.find(id="reactGeneralFeatures")
    
    texto_caracteristicas_extra = caracteristicas_extra.text
    
    botones = caracteristicas_extra.find_all('button')
    clase_boton = ""
    for boton in botones:
        clase_boton = ".".join(boton.get('class'))
    
    clase_boton = "." + clase_boton
    botones = driver.find_elements(By.CSS_SELECTOR, clase_boton)

    for i, boton in enumerate(botones):      
        wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, clase_boton)))
        boton.click()
        html = driver.page_source
        soup = BeautifulSoup(html, 'html.parser')
        caracteristicas_extra_boton = soup.find(id="reactGeneralFeatures")
        texto_caracteristicas_extra += caracteristicas_extra_boton.text

    return texto_caracteristicas_extra

def get_extra_features(texto_caracteristicas):
    palabras_a_buscar = ["Aire acondicionado", "Alarma", "Amoblado", "Caldera", "Calefacción", "Cancha deportes",
        "Cocina equipada", "Frigobar", "Lavarropas", "Lavavajillas", "Microondas", "Quincho", "SUM",
        "Sauna", "Secarropas", "Termotanque", "Vigilancia", "Ascensor", "Caja Fuerte", "Internet / Wifi",
        "Laundry", "Servicio de limpieza", "Balcón", "Dependencia servicio", "Dormitorio en suite",
        "Jardin", "Lavadero", "Patio", "Terraza", "Apto profesional", "Gimnasio", "Hidromasaje", "Parrilla",
        "Permite mascotas", "Pileta", "Sala de juegos", "Solarium", "Uso comercial", "Amoblado", "Acceso para personas con movilidad reducida"]
    resultados = {}

    for palabra in palabras_a_buscar:
        if palabra in texto_caracteristicas:
            resultados[palabra] = True
        else:
            resultados[palabra] = None

    return resultados


def get_features(soup):
    features_section = soup.find('ul', {'id': 'section-icon-features-property'})

    features = {}

    for item in features_section.find_all('li', class_='icon-feature'):
        icon = item.find('i')
        if icon:
            icon_class = icon.get('class')[0]
            text = item.get_text(strip=True).replace('\n', '').replace('\t', '').replace('  ', ' ')
            features[icon_class] = clean_feature(text)

    return features

def clean_feature(text):
    if " tot." in text:
        return text.split(" ")[0]
    elif " cub." in text:
        return text.split(" ")[0]
    elif " amb." in text:
        return text.split(" ")[0]
    elif " dorm." in text:
        return text.split(" ")[0]
    elif " coch." in text:
        return text.split(" ")[0]
    elif "baño" in text:
        return text[:1]
    elif "toilette" in text:
        return text[:1]
    else:
        return text

def escribir_diccionario_a_csv(diccionario):
    columnas = [
        "Precio", "Expensas", "Direccion", "Localidad", "icon-stotal", "icon-scubierta", 
        "icon-ambiente", "icon-bano", "icon-dormitorio", "icon-antiguedad", "icon-disposicion", 
        "icon-orientacion", "icon-luminosidad", "icon-cochera", "icon-toilete", "icon-inmueble", 
        "Aire acondicionado", "Alarma", "Amoblado", "Caldera", "Calefacción", "Cancha deportes",
        "Cocina equipada", "Frigobar", "Lavarropas", "Lavavajillas", "Microondas", "Quincho", "SUM",
        "Sauna", "Secarropas", "Termotanque", "Vigilancia", "Ascensor", "Caja Fuerte", "Internet / Wifi",
        "Laundry", "Servicio de limpieza", "Balcón", "Dependencia servicio", "Dormitorio en suite",
        "Jardin", "Lavadero", "Patio", "Terraza", "Apto profesional", "Gimnasio", "Hidromasaje", "Parrilla",
        "Permite mascotas", "Pileta", "Sala de juegos", "Solarium", "Uso comercial", "Amoblado", "Acceso para personas con movilidad reducida"
    ]

    with open("inmuebles.csv", mode='a', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=columnas)
        data_to_write = {key: diccionario[key] for key in columnas if key in diccionario}
        
        writer.writerow(data_to_write)


url_base = "https://www.zonaprop.com.ar"

def start_driver():
    # Esto ponia el path de forma automatica pero a mi me esta fallando y no logro arreglarlo.
    service = Service(ChromeDriverManager().install())

    # Lo hago de forma manual. 
    # Tuve que buscar el archivo chromedriver.exe y moverlo a una carpeta accesible
    # Luego lo agregue a el PATH de las variables de entorno desde el panel de control y funciono
    
    # PATH AGUS
    #driver_path = "C:\\chromedriver\\chromedriver.exe"
    # PATH SANTI
    #driver_path = "C:\\chromedriver\\chromedriver.exe"
    # PATH TOMI
    #driver_path = "C:\\chromedriver\\chromedriver.exe"
    # PATH JO
    #driver_path = "C:\\chromedriver\\chromedriver.exe"

    #service = Service(driver_path)
    return service

def get_links(url):
    
    service = start_driver()

    driver = webdriver.Chrome(service=service)
    driver.get(url)

    time.sleep(3) 

    html_content = driver.page_source

    driver.quit()

    soup = BeautifulSoup(html_content, 'html.parser')

    property_links = soup.find_all('div', {'data-qa': 'posting PROPERTY'})
    
    for property_link in property_links:
        data_to_posting = property_link.get('data-to-posting')
        url_completa = url_base + data_to_posting
        obtener_datos(url_completa)


def crear_csv():
    columnas = [
        "Precio", "Expensas", "Direccion", "Localidad", "icon-stotal", "icon-scubierta", 
        "icon-ambiente", "icon-bano", "icon-dormitorio", "icon-antiguedad", "icon-disposicion", 
        "icon-orientacion", "icon-luminosidad", "icon-cochera", "icon-toilete", "icon-inmueble", 
        "Aire acondicionado", "Alarma", "Amoblado", "Caldera", "Calefacción", "Cancha deportes",
        "Cocina equipada", "Frigobar", "Lavarropas", "Lavavajillas", "Microondas", "Quincho", "SUM",
        "Sauna", "Secarropas", "Termotanque", "Vigilancia", "Ascensor", "Caja Fuerte", "Internet / Wifi",
        "Laundry", "Servicio de limpieza", "Balcón", "Dependencia servicio", "Dormitorio en suite",
        "Jardin", "Lavadero", "Patio", "Terraza", "Apto profesional", "Gimnasio", "Hidromasaje", "Parrilla",
        "Permite mascotas", "Pileta", "Sala de juegos", "Solarium", "Uso comercial", "Amoblado","Acceso para personas con movilidad reducida"  
    ]

    with open('inmuebles.csv', 'w', newline='', encoding='utf-8') as archivo_csv:
        escritor = csv.writer(archivo_csv)
        escritor.writerow(columnas)


inicio = 1
fin = 200
crear_csv()
for i in range(inicio,fin): 
    url = ""
    if i == 1:
        url = "https://www.zonaprop.com.ar/departamentos-alquiler-capital-federal-orden-precio-descendente.html"  
    else:
        url = "https://www.zonaprop.com.ar/departamentos-alquiler-capital-federal-orden-precio-descendente" + "-pagina-" + str(i) + ".html"
    get_links(url)