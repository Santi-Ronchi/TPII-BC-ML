import React, { useState } from 'react';
import axios from 'axios';

const Servicios: React.FC = () => {
  const [postResponse, setPostResponse] = useState<string | null>(null);
  const [getResponse, setGetResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const postUrl = '/api/update-balance';
  const getUrl = '/api/get-balance';

  const requestBody = {
    servicio: "AYSA",
    numeroCuenta: "1767559",
  };

  const handleRequest = async () => {
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

  return (
    <div>
      <h1>Cliente React</h1>
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
