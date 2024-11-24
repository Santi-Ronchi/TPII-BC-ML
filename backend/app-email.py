import json
import os
from flask import Flask, jsonify, request
from web3 import Web3
from email.message import EmailMessage
import time
from dotenv import load_dotenv
from mailjet_rest import Client
import firebase_admin
from firebase_admin import credentials, firestore
from threading import Thread

# Cargar las variables de entorno desde el archivo .env
load_dotenv()

MAILJET_API_KEY = os.getenv('MAILJET_API_KEY')
MAILJET_SECRET_KEY = os.getenv('MAILJET_SECRET_KEY')

# Inicializar Firebase Admin SDK
cred = credentials.Certificate('/home/josefina/TPII-BC-ML/backend/credentials.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

# Configurar Flask
app = Flask(__name__)

# Datos del email
email = "equipo.arpa.72@gmail.com"
subject = "Nuevo contrato de alquiler"

# Configura el proveedor del nodo blockchain local (localhost:8545 por defecto)
w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:8545'))

# Verifica la conexión a la blockchain
if w3.is_connected():
    print("Conectado a la blockchain local")
else:
    print("Error al conectarse a la blockchain")


# Obtener el directorio actual del script
script_dir = os.path.dirname(os.path.abspath(__file__))

# Usar rutas relativas basadas en el directorio del script
abi_path = os.path.join(script_dir, '../packages/hardhat/artifacts/contracts/YourContract.sol/YourContract.json')
address_path = os.path.join(script_dir, '../packages/hardhat/deployments/localhost/YourContract.json')

# Cargar ABI y la dirección del contrato
def load_contract_data():
    abi = None
    contract_address = None

    # Obtener rutas absolutas
    abi_path_absolute = os.path.abspath(abi_path)
    address_path_absolute = os.path.abspath(address_path)

    # Cargar ABI
    if os.path.exists(abi_path_absolute):
        print(f"ABI encontrado en {abi_path_absolute}")
        with open(abi_path_absolute, 'r') as abi_file:
            contract_data = json.load(abi_file)
            abi = contract_data.get('abi')
            if not abi:
                print("Error: El archivo no contiene el ABI.")
    else:
        print(f"Error: No se encontró el archivo ABI en {abi_path_absolute}")

    # Cargar dirección del contrato
    if os.path.exists(address_path_absolute):
        print(f"Dirección del contrato encontrada en {address_path_absolute}")
        with open(address_path_absolute, 'r') as address_file:
            address_data = json.load(address_file)
            contract_address = address_data.get('address')
            if not contract_address:
                print("Error: No se encontró la dirección del contrato.")
    else:
        print(f"Error: No se encontró el archivo de dirección en {address_path_absolute}")

    return abi, contract_address

# Consultar Firebase para obtener los correos electrónicos asociados
def get_emails_from_wallets(owner_wallet, lessee_wallet):
    emails = []
    for wallet in [owner_wallet, lessee_wallet]:
        doc_ref = db.collection("Wallet-email").document(wallet)
        doc = doc_ref.get()
        if doc.exists:
            email = doc.to_dict().get("userEmail")
            if email:
                emails.append(email)
    return emails

# Enviar un correo usando Mailjet
def send_email(transaction_details, emails):
    # Cargar el template HTML
    with open('email_template.html', 'r', encoding='utf-8') as file:
        html_template = file.read()
    
    # Extraer la información de la transacción
    owner = transaction_details['Owner']
    lesse = transaction_details['Lesse']
    monto = transaction_details['Monto']
    duration = transaction_details['Duration']
    grace_period = transaction_details['GracePeriod']
    
    # Crear el bloque de detalles del contrato con la información extraída
    contract_details = f"""
        <p><strong>Billetera dueño:</strong> {owner}</p>
        <p><strong>Billetera inquilino:</strong> {lesse}</p>
        <p><strong>Duración del contrato:</strong> {duration} meses</p>
        <p><strong>Monto del alquiler (en meses):</strong> {monto}</p>
        <p><strong>Período de tolerancia del pago mensual:</strong> {grace_period}</p>
    """
    
    # Reemplazar la sección de detalles del contrato en el template
    html_content = html_template.replace("{contract_details}", contract_details)

    # Configurar el cliente de Mailjet
    mailjet = Client(auth=(MAILJET_API_KEY, MAILJET_SECRET_KEY), version='v3.1')

    # Crear el listado de destinatarios
    to_emails = [{"Email": email, "Name": "Usuario"} for email in emails]

    # Cuerpo del mensaje de correo
    data = {
        'Messages': [
            {
                "From": {
                    "Email": email,
                    "Name": "ARPA"
                },
                "To": to_emails,
                "Subject": "Detalles del contrato de alquiler",
                "TextPart": "Este correo requiere un cliente de correo compatible con HTML.",
                "HTMLPart": html_content
            }
        ]
    }

    # Enviar el correo
    result = mailjet.send.create(data=data)

    if result.status_code == 200:
        print(f"Correo enviado exitosamente: {result.json()}")
    else:
        print(f"Error al enviar correo: {result.status_code} {result.json()}")

# Función para monitorear eventos en el contrato
def monitor_transactions(contract, event_name, poll_interval=5):
    # Define el evento a monitorear
    event_filter = contract.events.ContratoCreado.create_filter(from_block='latest')

    print(f"Monitoreando evento {event_name} en el contrato {contract.address}")
    while True:
        for event in event_filter.get_new_entries():
            print(f"Nuevo evento: {event}")
            owner_wallet = event['args']['Owner']
            lessee_wallet = event['args']['Lesse']

            # Obtener emails de Firebase
            emails = get_emails_from_wallets(owner_wallet, lessee_wallet)

            print(f"Mail del Owner: {emails[0]} ,mail del Lesse: {emails[1]}") #


            if emails:
                send_email(event.args, emails)
            else:
                print("No se encontraron emails asociados a las wallets.")

        time.sleep(poll_interval)

if __name__ == '__main__':
    abi, contract_address = load_contract_data()
    if abi and contract_address:
        contract = w3.eth.contract(address=contract_address, abi=abi)
        event_name = "ContratoCreado"
        monitor_thread = Thread(target=monitor_transactions, args=(contract, event_name))
        monitor_thread.start()
        app.run(debug=True, port=5000)
    else:
        print("Error: ABI o dirección del contrato no encontrados.")
