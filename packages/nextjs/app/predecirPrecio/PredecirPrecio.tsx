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
  
    if (!selectedProvincia || !selectedLocalidad || !superficie_total || !superficie_cubierta || !cantidad_dormitorios || !cantidad_baños || !cantidad_ambientes) {
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
    <div className="px-6 pt-10 pb-8 shadow-xl sm:my-auto bg-secondary sm:mx-auto sm:max-w-11/12 md:w-9/12 sm:w-11/12 sm:rounded-lg sm:px-10">
      <img src="ARPA-WIDE.png" alt="logo de ARPA" className="mx-auto imgRounder" />
      <h1 className="text-xl font-bold">Ingresá los datos de la propiedad:</h1>
      <br /><br />
      <form onSubmit={handleSubmit}>
          <label className="text-md font-bold">Provincia</label>
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
          <label className="text-md font-bold">Localidad</label>
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
            <label className="text-md font-bold">Superficie Total</label>
          <IntegerInput value={superficie_total} onChange={handleSuperficieTotalChange} placeholder="Ingresar superficie total" />
        </div>
        <br />
        <div>
          <label className="text-md font-bold">Superficie cubierta</label>
          <IntegerInput value={superficie_cubierta} onChange={handleSuperficieCubiertaChange} placeholder="Ingresar superficie cubierta" />
        </div>
        <br />
        <div>
          <label className="text-md font-bold">Cantidad de Ambientes</label>
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
        <button type="submit" className="btn btn-primary">Predecir</button>
      </form>
      {prediction && (
        <div>
          <h2 className="text-lg font-bold">Predicción: {prediction.prediction}</h2>
          <p>Propiedades publicadas en la localidad: {prediction.caracteristicas.propiedadesPublicadas}</p>
          {Number(prediction.caracteristicas.propiedadesSimilares) === 0 ? (
            <p>
              Sea el primero en mostrar esta exclusiva propiedad a nuestros clientes más exigentes.<br />
              No existen propiedades publicadas con las características descriptas en la zona.
            </p>
          ) : (
            <>
              <p>Propiedades similares: {prediction.caracteristicas.propiedadesSimilares}</p>
              <p>Precio promedio: {prediction.caracteristicas.precioPromedio}</p>
              <p>Precio mínimo: {prediction.caracteristicas.precioMinimo}</p>
              <p>Precio máximo: {prediction.caracteristicas.precioMaximo}</p>
              <p>Promedio de metros totales: {prediction.caracteristicas.metrosTotalesPromedio}</p>
              <p>Promedio de metros cubiertos: {prediction.caracteristicas.metrosCubiertosPromedio}</p>
              <p>Porcentaje con cochera: {prediction.caracteristicas.cocheraPorcentaje}%</p>
              <p>Porcentaje con seguridad: {prediction.caracteristicas.seguridadPorcentaje}%</p>
              <p>Porcentaje con patio, terraza o balcón: {prediction.caracteristicas.aireLibrePorcentaje}%</p>
              <p>Porcentaje con parrilla: {prediction.caracteristicas.parrillaPorcentaje}%</p>
              <p>Porcentaje que aceptan mascotas: {prediction.caracteristicas.aptoMascotaPorcentaje}%</p>
              <p>Porcentaje con pileta: {prediction.caracteristicas.piletaPorcentaje}%</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};
