import { PredecirPrecio } from "./PredecirPrecio";
import type { NextPage } from "next";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Predecir precio de alquiler",
  description: "Ingresa los datos de tu propiedad para encontrar un precio de alquiler acorde al mercado.",
});

const Predecir: NextPage = () => {
  return (
    <>
      <div className="section">
        <div className="centered">
          <PredecirPrecio />
        </div>
      </div>

      <div className="text-center mt-8 bg-secondary p-10" style={{ backgroundColor: "rgba(203, 207, 211, 0.5)" }}>
        <h1 className="text-4xl my-0">Dale, ponelo en alquiler</h1>
        <p className="text-neutral">
          Podrás retirar el dinero del contrato a tu billetera conectada cuando un inquilino lo deposite.
          <br /> Con amor,{" "}
          <code className="italic bg-base-300 text-base font-bold [word-spacing:-0.5rem] px-1">
            El equipo de ARPA
          </code>{" "}
        </p>
      </div>
    </>
  );
};

export default Predecir;
