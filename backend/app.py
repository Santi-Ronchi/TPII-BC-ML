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

    
    propiedades_similares = obtener_propiedades_similares(propiedades_publicadas, cantidad_ambientes, cantidad_baños)
    print("Hay " + str(propiedades_similares.shape[0]) + " propiedades similares publicadas en la localidad de " + data["localidad"] + ", provincia de " + data["provincia"])
    
    precio_promedio = obtener_promedio(propiedades_similares, "precio")
    print("El precio promedio para departamentos similares es: ", precio_promedio)
    
    precio_minimo = obtener_minimo(propiedades_similares, "precio")
    print("El precio mas bajo para departamentos similares es: ", precio_minimo)
    
    precio_maximo = obtener_maximo(propiedades_similares, "precio")
    print("El precio mas alto para departamentos similares es: ", precio_maximo)
    
    m_totales_promedio = obtener_promedio(propiedades_similares,"superficie_total")
    print("La cantidad promedio de metros cuadrados es: " + str(m_totales_promedio))

    m_cubiertos_promedio = obtener_promedio(propiedades_similares,"superficie_cubierta")
    print("La cantidad promedio de metros cuadrados cubiertos es: " + str(m_cubiertos_promedio))

    cocheras = promedio_features_especiales(propiedades_similares,"cantidad_de_cocheras")
    print(f"El {cocheras:.2f}% de propiedades similares a la tuya cuentan con cochera")

    seguridad = promedio_propiedades_con_seguridad(propiedades_similares)
    print(f"El {seguridad:.2f}% de propiedades similares a la tuya cuentan con seguridad")

    aire_libre = promedio_propiedades_con_patio_o_terraza(propiedades_similares)
    print(f"El {aire_libre:.2f}% de propiedades similares a la tuya cuentan con patio, balcon o terraza")

    parrilla = promedio_features_especiales(propiedades_similares,"parrilla")
    print(f"El {parrilla:.2f}% de propiedades similares a la tuya cuentan con parrilla")

    apto_mascota = promedio_features_especiales(propiedades_similares,"permite_mascotas")
    print(f"El {apto_mascota:.2f}% de propiedades similares a la tuya admiten mascotas")

    pileta = promedio_features_especiales(propiedades_similares,"pileta")
    print(f"El {pileta:.2f}% de propiedades similares a la tuya cuentan con pileta")

    return jsonify({
    'prediction': prediction.tolist(),
    'caracteristicas': {
        'propiedadesPublicadas': str(propiedades_publicadas.shape[0]),
        'propiedadesSimilares': str(propiedades_similares.shape[0]),
        'precioPromedio': str(precio_promedio),
        'precioMinimo': str(precio_minimo),
        'precioMaximo': str(precio_maximo),
        'metrosTotalesPromedio': str(m_totales_promedio),
        'metrosCubiertosPromedio': str(m_cubiertos_promedio),
        'cocheraPorcentaje': str(cocheras),
        'seguridadPorcentaje': str(seguridad),
        'aireLibrePorcentaje': str(aire_libre),
        'parrillaPorcentaje': str(parrilla),
        'aptoMascotaPorcentaje': str(apto_mascota),
        'piletaPorcentaje': str(pileta)
    }
    })

@app.route('/api/provincias', methods=['GET'])
def get_provincias():
    provincias_unicas = df_localidades['provincia'].unique().tolist()
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
    if provincia == "Ciudad Autonoma de Buenos Aires":
        filename = 'data/inmuebles_CABA_post.csv'
    else:
        filename = 'data/inmuebles_sin_CABA_post.csv'
    
    filepath = os.path.join(current_dir, filename)
    df_propiedades = pd.read_csv(filepath)
    df_propiedades = df_propiedades[(df_propiedades['provincia'] == provincia) & (df_propiedades['localidad'] == localidad)]
    
    return df_propiedades

def obtener_promedio(df_propiedades, feature):
    if len(df_propiedades) > 0:
        return df_propiedades[feature].mean()
    return 0

def obtener_propiedades_similares(df_propiedades, ambientes, banios):  
    df_propiedades = df_propiedades[(df_propiedades['cantidad_de_ambiente'] == ambientes) & (abs(df_propiedades['cantidad_de_banios'] + df_propiedades['cantidad_de_toiletes'] - banios) <= 2)]
    return df_propiedades

def obtener_minimo(df_propiedades, feature):
    if len(df_propiedades) > 0:
        return df_propiedades[feature].min()
    return 0

def obtener_maximo(df_propiedades, feature):
    if len(df_propiedades) > 0:
        return df_propiedades[feature].max()
    return 0

def promedio_features_especiales(df_propiedades, feature):
    if len(df_propiedades) > 0:
        propiedades_filtradas = df_propiedades[df_propiedades[feature] > 0]
        porcentaje_filtrados = (len(propiedades_filtradas) / len(df_propiedades)) * 100
        return porcentaje_filtrados
    return 0    


def promedio_propiedades_con_seguridad(df_propiedades):
    if len(df_propiedades) > 0:
        propiedades_con_seguridad = df_propiedades[(df_propiedades['alarma'] > 0) | (df_propiedades['vigilancia'] > 0)]
        porcentaje_con_seguridad = (len(propiedades_con_seguridad) / len(df_propiedades)) * 100
        return porcentaje_con_seguridad
    return 0

def promedio_propiedades_con_patio_o_terraza(df_propiedades):
    if len(df_propiedades) > 0:
        promedio_propiedad_con_patio_o_terraza = df_propiedades[(df_propiedades['patio'] > 0) | (df_propiedades['jardin'] > 0) | (df_propiedades['terraza'] > 0) | (df_propiedades['balcon'] > 0) | (df_propiedades['quincho'] > 0)]
        promedio_propiedad_con_patio_o_terraza = (len(promedio_propiedad_con_patio_o_terraza) / len(df_propiedades)) * 100
        return promedio_propiedad_con_patio_o_terraza
    return 0 

if __name__ == '__main__':
    app.run(debug=True)
