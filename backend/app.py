from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib

app = Flask(__name__)
CORS(app)  # Habilitar CORS para todos los endpoints

# Cargar el modelo
model = joblib.load('model.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    # Obtener los datos del cuerpo de la solicitud POST
    superficie_total = data['superficie_total']
    precio_m2_medio_localidad = data['precio_m2_medio_localidad']
    precio_medio_localidad = data['precio_medio_localidad']
    precio_m2 = data['precio_m2']

    # Realizar la predicción con el modelo cargado
    prediction = model.predict([[superficie_total, precio_m2_medio_localidad, precio_medio_localidad, precio_m2]])

    # Devolver la predicción como JSON
    return jsonify({'prediction': prediction.tolist()})

if __name__ == '__main__':
    app.run(debug=True)
