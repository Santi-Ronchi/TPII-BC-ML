"use client";

import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import axios from 'axios';
import { IntegerInput } from "~~/components/scaffold-eth";

export const PredecirPrecio = () => {

  interface PredictionData {
    prediction: number;
    caracteristicas: {
      propiedadesPublicadas: number;
      propiedadesSimilares: number;
      precioPromedio: number;
      precioMinimo: number; 
      precioMaximo: number; 
      metrosTotalesPromedio: number; 
      metrosCubiertosPromedio: number;
      cocheraPorcentaje: number;
      seguridadPorcentaje: number;
      aireLibrePorcentaje: number;
      parrillaPorcentaje: number;
      aptoMascotaPorcentaje: number;
      piletaPorcentaje: number;
    };
  };


  const [superficie_total, setSuperficie_total] = useState<string>("");
  const [superficie_cubierta, setSuperficie_cubierta] = useState<string>("");
  const [cantidad_dormitorios, setCantidad_dormitorios] = useState<string>("");
  const [cantidad_baños, setCantidadBaños] = useState<string>("");
  const [cantidad_ambientes, setCantidad_ambientes] = useState<string>("");
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [provincias, setProvincias] = useState<any[]>([]);
  const [selectedProvincia, setSelectedProvincia] = useState<string>("");
  const [localidades, setLocalidades] = useState<any[]>([]);
  const [selectedLocalidad, setSelectedLocalidad] = useState<string>("");

  const handleSuperficieTotalChange = (value: string | bigint) => {
    setSuperficie_total(String(value));
  };

  const handleCantidadAmbientesChange = (value: string | bigint) => {
    setCantidad_ambientes(String(value));
  };

  const handleSuperficieCubiertaChange = (value: string | bigint) => {
    setSuperficie_cubierta(String(value));
  };

  const handleCantidadDormitoriosChange = (value: string | bigint) => {
    setCantidad_dormitorios(String(value));
  };

  const handleCantidadBañosChange = (value: string | bigint) => {
    setCantidadBaños(String(value));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
  
    if (!selectedProvincia || !selectedLocalidad || !superficie_total || !superficie_cubierta || !cantidad_ambientes) {
      console.error('Faltan campos obligatorios');
      setPrediction(null);
      alert('Por favor, completa todos los campos.');
      return;
    }
  
    console.log('Provincia seleccionada:', selectedProvincia);
    console.log('Localidad seleccionada:', selectedLocalidad);
    console.log('Superficie Total:', superficie_total);
    console.log('Superficie Cubierta:', superficie_cubierta);
    console.log('Cantidad de dormitorios:', cantidad_dormitorios);
    console.log('Cantidad de baños:', cantidad_baños);
    console.log('Cantidad de ambientes:', cantidad_ambientes);
  
    axios.post('http://localhost:5000/predict', {
      superficie_total: parseFloat(superficie_total),
      superficie_cubierta: parseFloat(superficie_cubierta),
      cantidad_dormitorios: parseFloat(cantidad_dormitorios),
      cantidad_baños: parseFloat(cantidad_baños),
      cantidad_ambientes: parseFloat(cantidad_ambientes),
      provincia: selectedProvincia,
      localidad: selectedLocalidad
    })
    .then(response => {
      const { prediction, caracteristicas } = response.data;
      setPrediction({
        prediction,
        caracteristicas
      });
    })
    .catch(error => {
      console.error('There was an error!', error);
    });
  };
    
  

  const fetchProvincias = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/provincias');
      const data = await response.json();
      setProvincias(data);
    } catch (error) {
      console.error('Error fetching provincias:', error);
    }
  };
  
  useEffect(() => {
    fetchProvincias();
  }, []);
  
  const handleProvinciaChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedProvincia = e.target.value;
    setSelectedProvincia(selectedProvincia);
    setSelectedLocalidad('');
    if (selectedProvincia) {
      fetchLocalidades(selectedProvincia);
    }
  };
  
  const fetchLocalidades = async (provincia: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/localidades?provincia=${provincia}`);
      const data = await response.json();
      setLocalidades(data);
    } catch (error) {
      console.error('Error fetching localidades:', error);
    }
  };
  
  const handleLocalidadChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedLocalidad(e.target.value);
  };
  
  return (
    <div className="px-6 pt-10 pb-8 shadow-xl sm:my-auto bg-secondary sm:mx-auto sm:max-w-11/12 md:w-9/12 sm:w-11/12 sm:rounded-lg sm:px-10" style={{ backgroundColor: 'rgba(203, 207, 211, 0.5)' }}>
      <img src="ARPA-WIDE.png" alt="logo de ARPA" className="mx-auto imgRounder" />
      <br /> 
      <div
        className="mb-3 inline-block w-full rounded px-6 pb-8 pt-8 text-center text-lg font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_rgba(0,0,0,0.2)] transition duration-150 ease-in-out hover:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:outline-none focus:ring-0 active:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)]"
        style={{ backgroundColor: '#370921' }}
      >
        CALCULADORA INTELIGENTE
      </div>
      <br />
      <br />
      <form onSubmit={handleSubmit}>
          <label className="text-md font-bold">Provincia *</label>
          <br />
          <select 
            value={selectedProvincia} 
            onChange={handleProvinciaChange} 
            className="text-md font-bold form-select rounded-full w-full h-8">
            <option value="">Seleccionar provincia</option>
            {provincias.map((provincia, index) => (
              <option key={index} value={provincia}>
                {provincia}
              </option>
            ))}
          </select>
          <br />
          <br />
        <div>
          <label className="text-md font-bold">Localidad *</label>
          <br />
          <select value={selectedLocalidad} onChange={handleLocalidadChange} className="text-md font-bold form-select rounded-full w-full h-8">
            <option value="">Seleccionar localidad</option>
            {localidades.map((localidad, index) => (
              <option key={index} value={localidad}>
                {localidad}
              </option>
            ))}
          </select>
        </div>
        <br />
        <div>
            <label className="text-md font-bold">Superficie Total *</label>
          <IntegerInput value={superficie_total} onChange={handleSuperficieTotalChange} placeholder="Ingresar superficie total" />
        </div>
        <br />
        <div>
          <label className="text-md font-bold">Superficie cubierta *</label>
          <IntegerInput value={superficie_cubierta} onChange={handleSuperficieCubiertaChange} placeholder="Ingresar superficie cubierta" />
        </div>
        <br />
        <div>
          <label className="text-md font-bold">Cantidad de Ambientes *</label>
          <IntegerInput value={cantidad_ambientes} onChange={handleCantidadAmbientesChange} placeholder="Ingresar la cantidad de ambientes" />
        </div>
        <br />
        <div>
          <label className="text-md font-bold">Cantidad de dormitorios</label>
          <IntegerInput value={cantidad_dormitorios} onChange={handleCantidadDormitoriosChange} placeholder="Ingresar la cantidad de dormitorios" />
        </div>
        <br />
        <div>
          <label className="text-md font-bold">Cantidad de baños</label>
          <IntegerInput value={cantidad_baños} onChange={handleCantidadBañosChange} placeholder="Ingresar cantidad de baños" />
        </div>
        <br />
        <button 
        className="mb-3 inline-block w-full rounded px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_rgba(0,0,0,0.2)] transition duration-150 ease-in-out hover:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:outline-none focus:ring-0 active:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)]"
        style={{ backgroundColor: '#8c376c' }}
        type="submit">Predecir precio de alquiler</button>
      </form>
      <br />
      <br />
      {prediction && (
      <div >
        <h2 className="text-2xl font-bold text-blue-600 mb-4" style={{ fontSize: '30px', color: '#8c376c' }}>
          Precio recomendado de publicacion de su propiedad: <span className="text-gray-800" style={{ fontSize: '30px', color: '#370921' }}>USD { (prediction.prediction*0.9).toFixed(0) } - {(prediction.prediction*1.1).toFixed(0)} </span>
        </h2>
        
        <div className="mb-4">
          <p className="text-gray-700">
            <span className="font-medium">Propiedades publicadas en la localidad: </span>{prediction.caracteristicas.propiedadesPublicadas}
          </p>
          {Number(prediction.caracteristicas.propiedadesSimilares) === 0 ? (
            <p className="text-red-500 mt-2">
              Sea el primero en mostrar esta exclusiva propiedad a nuestros clientes más exigentes.<br />
              No existen propiedades publicadas con las características descriptas en la zona.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-medium text-gray-600">Propiedades similares:</p>
                <p className="text-gray-800 text-xl font-semibold">{prediction.caracteristicas.propiedadesSimilares}</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-medium text-gray-600">Precio promedio:</p>
                <p className="text-gray-800 text-xl font-semibold">USD {prediction.caracteristicas.precioPromedio}</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-medium text-gray-600">Precio mínimo:</p>
                <p className="text-gray-800 text-xl font-semibold">USD {prediction.caracteristicas.precioMinimo}</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-medium text-gray-600">Precio máximo:</p>
                <p className="text-gray-800 text-xl font-semibold">USD {prediction.caracteristicas.precioMaximo}</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-medium text-gray-600">Promedio de metros totales:</p>
                <p className="text-gray-800 text-xl font-semibold">{prediction.caracteristicas.metrosTotalesPromedio}</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-medium text-gray-600">Promedio de metros cubiertos:</p>
                <p className="text-gray-800 text-xl font-semibold">{prediction.caracteristicas.metrosCubiertosPromedio}</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-medium text-gray-600">Porcentaje con cochera:</p>
                <p className="text-gray-800 text-xl font-semibold">{prediction.caracteristicas.cocheraPorcentaje}%</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-medium text-gray-600">Porcentaje con seguridad:</p>
                <p className="text-gray-800 text-xl font-semibold">{prediction.caracteristicas.seguridadPorcentaje}%</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-medium text-gray-600">Porcentaje con patio, terraza o balcón:</p>
                <p className="text-gray-800 text-xl font-semibold">{prediction.caracteristicas.aireLibrePorcentaje}%</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-medium text-gray-600">Porcentaje con parrilla:</p>
                <p className="text-gray-800 text-xl font-semibold">{prediction.caracteristicas.parrillaPorcentaje}%</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-medium text-gray-600">Porcentaje que aceptan mascotas:</p>
                <p className="text-gray-800 text-xl font-semibold">{prediction.caracteristicas.aptoMascotaPorcentaje}%</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-medium text-gray-600">Porcentaje con pileta:</p>
                <p className="text-gray-800 text-xl font-semibold">{prediction.caracteristicas.piletaPorcentaje}%</p>
              </div>
            </div>
          )}
        </div>
      </div>
    )}
    </div>
  );
};
