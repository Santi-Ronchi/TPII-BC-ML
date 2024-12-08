from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from mailjet_rest import Client
import os

app = Flask(__name__)
CORS(app)  

load_dotenv()

MAILJET_API_KEY = os.getenv('MAILJET_API_KEY')
MAILJET_SECRET_KEY = os.getenv('MAILJET_SECRET_KEY')

# Mailjet
mailjet = Client(auth=(MAILJET_API_KEY, MAILJET_SECRET_KEY), version='v3.1')

@app.route('/send-email', methods=['POST'])
def send_email():
    data = request.json  # Datos del frontend
    name = data.get('name')
    email = data.get('email')
    message = data.get('message')

    if not name or not email or not message:
        return jsonify({'error': 'Todos los campos son obligatorios'}), 400

    # Configura el contenido del correo
    email_data = {
        'Messages': [
            {
                'From': {
                    'Email': "equipo.arpa.72@gmail.com",
                    'Name': f"{name}"
                },
                'To': [
                    {
                        'Email': "equipo.arpa.72@gmail.com",
                        'Name': "DARPA"
                    }
                ],
                'Subject': "Nuevo mensaje desde el formulario de contacto",
                'TextPart': f"Nombre: {name}\nCorreo: {email}\nMensaje: {message}",
                'HTMLPart': f"""
                    <h3>Nuevo mensaje desde el formulario de contacto</h3>
                    <p><strong>Nombre:</strong> {name}</p>
                    <p><strong>Correo:</strong> {email}</p>
                    <p><strong>Mensaje:</strong> {message}</p>
                """
            }
        ]
    }

    try:
        result = mailjet.send.create(data=email_data)
        if result.status_code == 200:
            return jsonify({'message': 'Correo enviado exitosamente'}), 200
        else:
            return jsonify({'error': 'Error al enviar el correo', 'details': result.json()}), 500
    except Exception as e:
        return jsonify({'error': 'Error interno del servidor', 'details': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
