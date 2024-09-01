import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
CORS(app)  # Habilitar CORS para todos los endpoints

# Cargar el DataFrame del CSV al inicio
current_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = 'data'
filename = 'precios_por_localidad_bs_as.csv'
filepath = os.path.join(current_dir, data_dir, filename)

model_path = os.path.join(current_dir, 'modelo_filtrado.pkl')
scaler_path = os.path.join(current_dir, 'scaler.joblib')
model = joblib.load(model_path)
scaler = joblib.load(scaler_path)

df_localidades = pd.read_csv(filepath)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    print(data)
    # Obtener los datos del cuerpo de la solicitud POST
    superficie_total = data['superficie_total']
    superficie_cubierta = data['superficie_cubierta']
    cantidad_dormitorios = data['cantidad_dormitorios']
    cantidad_baños = data['cantidad_baños']

    localidad = df_localidades[df_localidades['localidad'] == data['localidad']]
    datos_entrada = [[superficie_total, superficie_cubierta, cantidad_baños, cantidad_dormitorios, localidad["precio_m2_medio"].values[0], localidad["precio_m2_medio"].values[0],localidad["precio_medio"].values[0]]]

    datos_entrada_escalados = scaler.transform(datos_entrada)
    print("Datos escalados:", datos_entrada_escalados)

    prediction = model.predict(datos_entrada_escalados)
    print(prediction)
    # Devolver la predicción como JSON
    return jsonify({'prediction': prediction.tolist()})

@app.route('/api/provincias', methods=['GET'])
def get_provincias():
    # Suponiendo que la columna de provincias se llama 'provincia'
    provincias_unicas = df_localidades['provincia'].unique().tolist()
    print(provincias_unicas)
    return jsonify(provincias_unicas)

@app.route('/api/localidades', methods=['GET'])
def get_localidades():
    # Obtener el parámetro de consulta 'provincia' de la URL
    provincia_seleccionada = request.args.get('provincia')

    if provincia_seleccionada:
        # Filtrar las localidades en base a la provincia seleccionada
        localidades_filtradas = df_localidades[df_localidades['provincia'] == provincia_seleccionada]
        localidades = localidades_filtradas.to_dict(orient='records')
    else:
        # Si no se pasa ninguna provincia, devolver todas las localidades
        localidades = df_localidades.to_dict(orient='records')

    return jsonify(localidades)

if __name__ == '__main__':
    app.run(debug=True)
