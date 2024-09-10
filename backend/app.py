import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
CORS(app)  # Habilitar CORS para todos los endpoints

current_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = 'data'
#filename = 'precios_por_localidad.csv'
# PRUEBA CON EL ULTIMO MODELO
filename = 'precios_por_localidad_prov_v2.csv'
filepath = os.path.join(current_dir, data_dir, filename)

df_localidades = pd.read_csv(filepath)

model_path = os.path.join(current_dir, 'modelo_filtrado_v1.pkl')
scaler_path = os.path.join(current_dir, 'scaler_v1.joblib')
model = joblib.load(model_path)
scaler = joblib.load(scaler_path)

model_path_prov = os.path.join(current_dir, 'modelo_filtrado_prov_v2.pkl')
scaler_path_prov = os.path.join(current_dir, 'scaler_prov_v2.joblib')
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
        # ANTERIOR AL ULTIMO modelo_filtrado_prov scaler_prov precios_por_localidad_v1
        #datos_entrada = [[superficie_cubierta,superficie_total,localidad["precio_m2_medio"].values[0],localidad["precio_medio"].values[0],cantidad_ambientes,0,cantidad_dormitorios,cantidad_baños]]    
        #datos_entrada_escalados = scaler_prov.transform(datos_entrada)
        #prediction = model_prov.predict(datos_entrada_escalados)
        
        # ULTIMA PRUEBA
        datos_entrada = [[superficie_total,superficie_cubierta,localidad["precio_m2_medio"].values[0],localidad["precio_m2_medio"].values[0],localidad["precio_medio"].values[0]]]    
        datos_entrada_escalados = scaler_prov.transform(datos_entrada)
        prediction = model_prov.predict(datos_entrada_escalados)



    print("Prediccion: ", prediction)
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

if __name__ == '__main__':
    app.run(debug=True)
