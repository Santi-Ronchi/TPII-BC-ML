import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
CORS(app) 

current_dir = os.path.dirname(os.path.abspath(__file__))
filename = 'data/precios_por_localidad_v5.csv'
filepath = os.path.join(current_dir, filename)

df_localidades = pd.read_csv(filepath)

model_path = os.path.join(current_dir, 'data\modelos\modelo_filtrado_v1.pkl')
scaler_path = os.path.join(current_dir, 'data\modelos\scaler_v1.joblib')
model = joblib.load(model_path)
scaler = joblib.load(scaler_path)

model_path_prov = os.path.join(current_dir, 'data\modelos\modelo_filtrado_prov_v5.pkl')
scaler_path_prov = os.path.join(current_dir, 'data\modelos\scaler_prov_v5.joblib')
model_prov = joblib.load(model_path_prov)
scaler_prov = joblib.load(scaler_path_prov)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    print(data)
    
    superficie_total = data['superficie_total']
    superficie_cubierta = data['superficie_cubierta']
    cantidad_dormitorios = data['cantidad_dormitorios']
    cantidad_baños = data['cantidad_baños']
    cantidad_ambientes = data['cantidad_ambientes']


    localidad = df_localidades[df_localidades['localidad'] == data['localidad']]

    if data["provincia"] == "Ciudad Autonoma de Buenos Aires":
        datos_entrada = [[superficie_total, superficie_cubierta, cantidad_baños, cantidad_dormitorios, localidad["precio_m2_medio"].values[0], localidad["precio_m2_medio"].values[0],localidad["precio_medio"].values[0]]]    
        datos_entrada_escalados = scaler.transform(datos_entrada)
        prediction = model.predict(datos_entrada_escalados)
    else:
        datos_entrada = [[superficie_total,superficie_cubierta,localidad["precio_m2_medio"].values[0],localidad["precio_medio"].values[0],localidad["precio_m2_medio"].values[0]]]    
        datos_entrada_escalados = scaler_prov.transform(datos_entrada)
        prediction = model_prov.predict(datos_entrada_escalados)

    print("Prediccion: ", prediction)
    propiedades_publicadas = obtener_propiedades_en_localidad(data["provincia"], data["localidad"])
    print("Hay " + str(propiedades_publicadas.shape[0]) + " propiedades publicadas en la localidad de " + data["localidad"] + ", provincia de " + data["provincia"])

    
    propiedades_similares = obtener_propiedades_similares(propiedades_publicadas, cantidad_ambientes, cantidad_baños, superficie_total, superficie_cubierta)
    print("Hay " + str(propiedades_similares.shape[0]) + " propiedades similares publicadas en la localidad de " + data["localidad"] + ", provincia de " + data["provincia"])
    
    
    return jsonify({'prediction': prediction.tolist()})

@app.route('/api/provincias', methods=['GET'])
def get_provincias():
    provincias_unicas = df_localidades['provincia'].unique().tolist()
    print(provincias_unicas)
    return jsonify(provincias_unicas)

@app.route('/api/localidades', methods=['GET'])
def get_localidades():
    provincia_seleccionada = request.args.get('provincia')

    if provincia_seleccionada:
        localidades_filtradas = df_localidades[df_localidades['provincia'] == provincia_seleccionada]
        localidades = localidades_filtradas.to_dict(orient='records')
    else:
        localidades = df_localidades.to_dict(orient='records')

    return jsonify(localidades)

def obtener_propiedades_en_localidad(provincia, localidad):
    current_dir = os.path.dirname(os.path.abspath(__file__))
    print(provincia)
    if provincia == "Ciudad Autonoma de Buenos Aires":
        filename = 'data/inmuebles_CABA.csv'
    else:
        filename = 'data/inmuebles_sin_CABA.csv'
    
    filepath = os.path.join(current_dir, filename)
    df_propiedades = pd.read_csv(filepath)

    df_propiedades = df_propiedades[(df_propiedades['provincia'] == provincia) & (df_propiedades['localidad'] == localidad)]
    
    return df_propiedades


def obtener_propiedades_similares(df_propiedades, ambientes, banios, superficie_total, superficie_cubierta):
    df_propiedades['cantidad_de_ambiente'] = pd.to_numeric(df_propiedades['cantidad_de_ambiente'], errors='coerce')
    df_propiedades['cantidad_de_banios'] = pd.to_numeric(df_propiedades['cantidad_de_banios'], errors='coerce')
    df_propiedades['superficie_total'] = pd.to_numeric(df_propiedades['superficie_total'], errors='coerce')
    df_propiedades['superficie_cubierta'] = pd.to_numeric(df_propiedades['superficie_cubierta'], errors='coerce')
    
    df_propiedades = df_propiedades[(df_propiedades['cantidad_de_ambiente'] == ambientes) & (abs(df_propiedades['cantidad_de_banios'] - banios) <= 1)]
    df_propiedades = df_propiedades[(abs(df_propiedades['superficie_total'] - superficie_total) <= 10) & (abs(df_propiedades['superficie_cubierta'] - superficie_cubierta) <= 10)]
    return df_propiedades

if __name__ == '__main__':
    app.run(debug=True)
