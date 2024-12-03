import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import axios from "axios";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { NextPage } from "next";
import { dataServicios } from "~~/types/utils";

const Servicios: NextPage<{ propiedadId: string }> = ({ propiedadId }) => {
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  const [numeroCuenta, setNumeroCuenta] = useState<string>("");
  const [servicio, setServicio] = useState<keyof dataServicios>("AYSA");
  const [postResponse, setPostResponse] = useState<string | null>(null);
  const [, setGetResponse] = useState<string | null>(null);
  const [parsedGetResponse, setParsedGetResponse] = useState<{
    servicio?: string;
    numeroCuenta?: string;
    saldo?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [leerServicio, setLeerServicio] = useState<dataServicios | null>(null);

  const postUrl = "/api/update-balance";
  const getUrl = "/api/get-balance";

  const handleRequest = async () => {
    console.log("Servicio seleccionado:", servicio);
    console.log("Número de cuenta:", numeroCuenta);

    const requestBody = {
      servicio,
      numeroCuenta,
    };

    try {
      const tableName = "Servicios";
      const userDoc = doc(db, tableName, propiedadId);
      const userSnapshot = await getDoc(userDoc);

      if (userSnapshot.exists()) {
        const existingData = userSnapshot.data() as dataServicios;

        if (existingData[servicio] !== numeroCuenta) {
          await setDoc(userDoc, { ...existingData, [servicio]: numeroCuenta }, { merge: true });
          console.log(`Número de cuenta para ${servicio} actualizado en la base de datos.`);
        } else {
          console.log(`Número de cuenta para ${servicio} ya estaba actualizado.`);
        }
      } else {
        await setDoc(userDoc, { [servicio]: numeroCuenta });
        console.log(`Documento creado con el número de cuenta para ${servicio}.`);
      }

      const postResult = await axios.post(postUrl, requestBody, {
        headers: { "Content-Type": "application/json" },
      });
      setPostResponse(JSON.stringify(postResult.data, null, 2));

      await delay(20000);

      const getResult = await axios.get(getUrl, {
        params: requestBody,
        headers: { "Content-Type": "application/json" },
      });
      const getResponseData = getResult.data;

      setGetResponse(JSON.stringify(getResponseData, null, 2));

      setParsedGetResponse({
        servicio: getResponseData.servicio,
        numeroCuenta: getResponseData.numeroCuenta,
        saldo: getResponseData.saldo,
      });
    } catch (err: any) {
      setError(err.response?.data || err.message);
    }
  };

  const fetchUserData = async (propiedadId: string): Promise<dataServicios | null> => {
    try {
      const tableName = "Servicios";
      const userDoc = doc(db, tableName, propiedadId);
      const userSnapshot = await getDoc(userDoc);
      return userSnapshot.exists() ? (userSnapshot.data() as dataServicios) : null;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const propData = await fetchUserData(propiedadId);
      setLeerServicio(propData);
    };

    loadData();
  }, []);

  useEffect(() => {
    if (leerServicio && servicio) {
      setNumeroCuenta(leerServicio[servicio] || "");
    } else {
      setNumeroCuenta("");
    }
  }, [servicio, leerServicio]);

  return (
    <div>
      <h1>Consulte el estado de cuenta de los servicios asociados a su propiedad</h1>
      <div>
        <label htmlFor="servicio">Seleccione el servicio: </label>
        <select id="servicio" value={servicio} onChange={e => setServicio(e.target.value as keyof dataServicios)}>
          <option value="AYSA">AYSA</option>
          <option value="EDESUR">EDESUR</option>
        </select>
      </div>

      <div>
        <label htmlFor="numeroCuenta">Número de cuenta: </label>
        <input id="numeroCuenta" type="text" value={numeroCuenta} onChange={e => setNumeroCuenta(e.target.value)} />
      </div>

      <button
        onClick={() => handleRequest()}
        style={{
          padding: "8px 16px",
          marginTop: "10px",
          backgroundColor: "#007BFF",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Realizar consulta
      </button>

      <pre>{postResponse != null ? "Consulta enviada. Por favor aguarde unos segundos." : ""}</pre>

      {error && <div>No fue posible obtener la infomacion solicitada</div>}

      {parsedGetResponse && (
        <div>
          {Number(parsedGetResponse.saldo?.replace(".", "").replace(",", ".")) > 0 ? (
            <p>
              El cliente de <strong>{parsedGetResponse.servicio}</strong> número{" "}
              <strong>{parsedGetResponse.numeroCuenta}</strong> tiene un saldo pendiente de{" "}
              <strong>{parsedGetResponse.saldo?.replace(".", "").replace(",", ".")}</strong>.
            </p>
          ) : (
            <p>
              No se adeuda saldo pendiente para el cliente número <strong>{parsedGetResponse.numeroCuenta}</strong>.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Servicios;
