import json
import os
from flask import Flask, jsonify, request
from web3 import Web3
from email.message import EmailMessage
import ssl
import smtplib
import time

# Configura Flask
app = Flask(__name__)

# Datos del email
emailPass = "xvlp pfln ptfg btln"
email = "equipo.arpa.72@gmail.com"
emailReceiver = "equipo.arpa.72@gmail.com"
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

# Función para cargar ABI y la dirección del contrato
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
            abi = contract_data.get('abi')  # Extraemos solo la parte del 'abi'
            if not abi:
                print("Error: El archivo no contiene el ABI.")
    else:
        print(f"Error: No se encontró el archivo ABI en {abi_path_absolute}")

    # Cargar dirección del contrato
    if os.path.exists(address_path_absolute):
        print(f"Dirección del contrato encontrada en {address_path_absolute}")
        with open(address_path_absolute, 'r') as address_file:
            address_data = json.load(address_file)
            contract_address = address_data.get('address')  # Extraemos solo la dirección del contrato
            if not contract_address:
                print("Error: No se encontró la dirección del contrato.")
    else:
        print(f"Error: No se encontró el archivo de dirección en {address_path_absolute}")

    return abi, contract_address

# Función para enviar un correo
def enviar_correo(transaction_details):
    # Cargar el template HTML
    with open('email_template.html', 'r', encoding='utf-8') as file:
        html_template = file.read()
    
    # Formatear los detalles de la transacción
    transaction_rows = "".join(
        f"<tr><td>{key}</td><td>{value}</td></tr>"
        for key, value in transaction_details.items()
    )
    
    # Reemplazar el marcador con los detalles de la transacción
    html_content = html_template.replace("{transaction_rows}", transaction_rows)

    # Configura el mensaje de correo
    msg = EmailMessage()
    msg['From'] = email
    msg['To'] = emailReceiver
    msg['Subject'] = subject
    msg.set_content("Este correo requiere un cliente de correo compatible con HTML.", subtype='html')
    msg.add_alternative(html_content, subtype='html')

    # Configura el contexto SSL
    context = ssl.create_default_context()

    # Enviar el correo utilizando el servidor SMTP de Gmail
    with smtplib.SMTP_SSL('smtp.gmail.com', 465, context=context) as smtp:
        smtp.login(email, emailPass)
        smtp.send_message(msg)

# Función para monitorear eventos en el contrato
def monitorear_transacciones(contract, event_name, poll_interval=5):
    # Define el evento a monitorear
    event_filter = contract.events.ContratoCreado.create_filter(from_block='latest')

    print(f"Monitoreando evento {event_name} en el contrato {contract.address}")
    while True:
        # Revisa si hay eventos nuevos
        for event in event_filter.get_new_entries():
            print(f"Nuevo evento: {event}")
            enviar_correo(event.args)  # Envía un correo con los detalles del evento

        # Espera antes de volver a revisar
        time.sleep(poll_interval)

# Endpoint para consultar una transacción por hash
@app.route('/transaction/<tx_hash>', methods=['GET'])
def get_transaction(tx_hash):
    try:
        # Obtiene los detalles de la transacción usando el hash
        transaction = w3.eth.getTransaction(tx_hash)
        # Retorna la transacción en formato JSON
        return jsonify(dict(transaction))
    except Exception as e:
        return jsonify({"error": str(e)})

# Endpoint para consultar el balance de una dirección
@app.route('/balance/<address>', methods=['GET'])
def get_balance(address):
    try:
        # Obtiene el balance de la dirección especificada
        balance = w3.eth.getBalance(address)
        # Convierte el balance a Ether y lo retorna en formato JSON
        return jsonify({"balance": w3.fromWei(balance, 'ether')})
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    # Cargar ABI y dirección del contrato
    abi, contract_address = load_contract_data()
    print("----------- EL ADDRESS DEL CONTRATO ES: ")
    print(contract_address)

    if abi is not None and contract_address is not None:
        # Cargar el contrato
        contract = w3.eth.contract(address=contract_address, abi=abi)
        event_name = "ContratoCreado"  # Nombre del evento que quieres monitorear

        # Inicia el monitoreo en segundo plano
        from threading import Thread
        monitor_thread = Thread(target=monitorear_transacciones, args=(contract, event_name))
        monitor_thread.start()

        # Inicia el servidor Flask en el puerto 5000
        app.run(debug=True, port=5000)
    else:
        print("Error: ABI o dirección del contrato no encontrados.")
