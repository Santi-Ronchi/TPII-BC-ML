import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { NextPage } from 'next';
import { useUser } from '../user/UserContext';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { dataServicios } from '~~/types/utils';

const Servicios: NextPage = () => {
  const [numeroCuenta, setNumeroCuenta] = useState<string>(''); 
  const [servicio, setServicio] = useState<keyof dataServicios>('AYSA');
  const [postResponse, setPostResponse] = useState<string | null>(null);
  const [getResponse, setGetResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [leerServicio, setLeerServicio] = useState<dataServicios | null>(null);

  const postUrl = '/api/update-balance';
  const getUrl = '/api/get-balance';

  const handleRequest = async () => {
    console.log('Servicio seleccionado:', servicio);
    console.log('Número de cuenta:', numeroCuenta);

    const requestBody = {
      servicio,
      numeroCuenta,
    };

    try {
      const postResult = await axios.post(postUrl, requestBody, {
        headers: { 'Content-Type': 'application/json' },
      });
      setPostResponse(JSON.stringify(postResult.data, null, 2));

      const getResult = await axios.get(getUrl, {
        params: requestBody,
        headers: { 'Content-Type': 'application/json' },
      });
      setGetResponse(JSON.stringify(getResult.data, null, 2));
    } catch (err: any) {
      setError(err.response?.data || err.message);
    }
  };

  const fetchUserData = async (propiedadId: string): Promise<dataServicios | null> => {
    try {
      const tableName = 'Servicios';
      const userDoc = doc(db, tableName, propiedadId);
      const userSnapshot = await getDoc(userDoc);
      return userSnapshot.exists() ? (userSnapshot.data() as dataServicios) : null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      // ACA LE TENGO QUE PASAR EL ID DE LA PROPIEDAD QUE QUIERO VER
      const propId = '2'; 
      const propData = await fetchUserData(propId);
      setLeerServicio(propData);
    };

    loadData();
  }, []);

  useEffect(() => {
    if (leerServicio && servicio) {
      setNumeroCuenta(leerServicio[servicio] || '');
    } else {
      setNumeroCuenta('');
    }
  }, [servicio, leerServicio]);

  return (
    <div>
      <h1>Consulte el estado de cuenta actual de los servicios asociados a su propiedad</h1>
      <div>
        <label htmlFor="servicio">Seleccione el servicio: </label>
        <select 
          id="servicio" 
          value={servicio} 
          onChange={(e) => setServicio(e.target.value as keyof dataServicios)}
        >
          <option value="AYSA">AYSA</option>
          <option value="EDESUR">EDESUR</option>
        </select>
      </div>

      <div>
        <label htmlFor="numeroCuenta">Número de cuenta: </label>
        <input
          id="numeroCuenta"
          type="text"
          value={numeroCuenta}
          onChange={(e) => setNumeroCuenta(e.target.value)} 
        />
      </div>

      <button onClick={handleRequest}>Realizar POST y GET</button>

      {error && <div style={{ color: 'red' }}>Error: {error}</div>}

      <h2>Respuesta POST:</h2>
      <pre>{postResponse || 'Esperando resultado del POST...'}</pre>

      <h2>Respuesta GET:</h2>
      <pre>{getResponse || 'Esperando resultado del GET...'}</pre>
    </div>
  );
};

export default Servicios;
