import type { NextPage } from "next";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";
//solo para probar
import { CrearContratoAlquiler } from "./CrearContratoAlquiler";

export const metadata = getMetadata({
  title: "Debug Contracts",
  description: "Debug your deployed 🏗 Scaffold-ETH 2 contracts in an easy way",
});

const CrearAlquiler: NextPage = () => {
  return (
    <>
      <CrearContratoAlquiler/>

      <div className="text-center mt-8 bg-secondary p-10">
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

export default CrearAlquiler;