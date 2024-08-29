"use client";

import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import axios from 'axios';
import { IntegerInput } from "~~/components/scaffold-eth";

export const PredecirPrecio = () => {
  const [superficie_total, setSuperficie_total] = useState<string>("");
  const [superficie_cubierta, setSuperficie_cubierta] = useState<string>("");
  const [precio_medio_localidad, setPrecio_medio_localidad] = useState<string>("");
  const [precio_m2, setPrecio_m2] = useState<string>("");
  const [prediction, setPrediction] = useState<number | null>(null);
  const [provincias, setProvincias] = useState<any[]>([]);
  const [selectedProvincia, setSelectedProvincia] = useState<string>("");
  const [localidades, setLocalidades] = useState<any[]>([]);
  const [selectedLocalidad, setSelectedLocalidad] = useState<string>("");

  const handleSuperficieTotalChange = (value: string | bigint) => {
    setSuperficie_total(String(value));
  };

  const handleSuperficieCubiertaChange = (value: string | bigint) => {
    setSuperficie_cubierta(String(value));
  };

  const handlePrecioMedioLocalidadChange = (value: string | bigint) => {
    setPrecio_medio_localidad(String(value));
  };

  const handlePrecioM2Change = (value: string | bigint) => {
    setPrecio_m2(String(value));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    console.log('Provincia seleccionada:', selectedProvincia);
    console.log('Localidad seleccionada:', selectedLocalidad);
    console.log('Superficie Total:', superficie_total);
    console.log('Superficie Cubierta:', superficie_cubierta);
    console.log('Precio Medio Localidad:', precio_medio_localidad);
    console.log('Precio m²:', precio_m2);
      
    axios.post('http://localhost:5000/predict', {
      superficie_total: parseFloat(superficie_total),
      superficie_cubierta: parseFloat(superficie_cubierta),
      precio_medio_localidad: parseFloat(precio_medio_localidad),
      precio_m2: parseFloat(precio_m2),
    })
    .then(response => {
      setPrediction(response.data.prediction);
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
              <option key={index} value={localidad.localidad}>
                {localidad.localidad}
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
          <label className="text-md font-bold">Precio Medio Localidad</label>
          <IntegerInput value={precio_medio_localidad} onChange={handlePrecioMedioLocalidadChange} placeholder="Ingresar precio medio localidad" />
        </div>
        <br />
        <div>
          <label className="text-md font-bold">Precio m²</label>
          <IntegerInput value={precio_m2} onChange={handlePrecioM2Change} placeholder="Ingresar precio m²" />
        </div>
        <br />
        <button type="submit" className="btn btn-primary">Predecir</button>
      </form>
      {prediction && (
        <div>
          <h2 className="text-lg font-bold">Predicción: {prediction}</h2>
        </div>
      )}
    </div>
  );
};

//export default PredecirPrecio;
