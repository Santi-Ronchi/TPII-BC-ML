"use client";

import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import Link from "next/link";
import { IntegerInput, EtherInput } from "~~/components/scaffold-eth";

export const PredecirPrecio = () => {
  const [superficie_total, setSuperficie_total] = useState<string>("");
  const [precio_m2_medio_localidad, setPrecio_m2_medio_localidad] = useState<string>("");
  const [precio_medio_localidad, setPrecio_medio_localidad] = useState<string>("");
  const [precio_m2, setPrecio_m2] = useState<string>("");
  const [prediction, setPrediction] = useState<number | null>(null);

  const handleSuperficieTotalChange = (value: string | bigint) => {
    setSuperficie_total(String(value));
  };

  const handlePrecioM2MedioLocalidadChange = (value: string | bigint) => {
    setPrecio_m2_medio_localidad(String(value));
  };

  const handlePrecioMedioLocalidadChange = (value: string | bigint) => {
    setPrecio_medio_localidad(String(value));
  };

  const handlePrecioM2Change = (value: string | bigint) => {
    setPrecio_m2(String(value));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    axios.post('http://localhost:5000/predict', {
      superficie_total: parseFloat(superficie_total),
      precio_m2_medio_localidad: parseFloat(precio_m2_medio_localidad),
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

  return (
    <div className="px-6 pt-10 pb-8 shadow-xl sm:my-auto bg-secondary sm:mx-auto sm:max-w-11/12 md:w-9/12 sm:w-11/12 sm:rounded-lg sm:px-10">
      <img src="ARPA-WIDE.png" alt="logo de ARPA" className="mx-auto imgRounder"/>
      <h1 className="text-xl font-bold">Ingresá los datos de la propiedad:</h1>
      <br /><br />
      <form onSubmit={handleSubmit}>
        <div>
          <label className="text-md font-bold">Superficie Total</label>
          <IntegerInput value={superficie_total} onChange={handleSuperficieTotalChange} placeholder="Ingresar superficie total" />
        </div>
        <br />
        <div>
          <label className="text-md font-bold">Precio m² Medio Localidad</label>
          <IntegerInput value={precio_m2_medio_localidad} onChange={handlePrecioM2MedioLocalidadChange} placeholder="Ingresar precio m² medio localidad" />
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
