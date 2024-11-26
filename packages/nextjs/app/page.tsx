"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { HomeIcon, ArrowLongDownIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import Servicios from "./servicios/Servicios";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Bienvenido a</span>
            <img src="ARPA-WIDE.png" alt="Logo de ARPA" className="imgRounder mx-auto"/>
            <span className="block text-4xl font-bold">Alquileres y Rentas de Propiedades Argentinas</span>
          </h1>
          <br />
          <div className="flex justify-center items-center space-x-2">
            <p className="my-2 font-medium">Billetera conectada:</p>
            <Address address={connectedAddress} />
          </div>
          <p className="text-center text-lg">
            Tu plataforma para facilitar el temido{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              alquiler de propiedades!
            </code>
          </p>
          <p className="text-center text-lg">
            Tanto si sos{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              Propietario
            </code>{" "}
            para mejorar el proceso de contrato, o si sos{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              Inquilino
            </code>{" "}
            con nuestro buscador inteligente para encontrar lo que necesitas.
          </p>
          <div className="flex flex-row justify-around text-center items-center">
            <ArrowLongDownIcon className="h-40 w-40"/>
          </div>
        </div>
        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div>
              <h2 className="text-lg font-bold justify-center text-center items-center">Es por acá:</h2>
              <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
                <HomeIcon className="h-8 w-8 fill-secondary" />
                <p>
                  Empeza por acá poniendo tu{" "}
                  <Link href="/crearAlquiler" passHref className="link">
                    propiedad en alquiler!
                  </Link>{" "}
                </p>
              </div>
            </div>
            {/*<div>
              <h2 className="text-lg font-bold justify-center text-center items-center">Inquilinos, ¿qué están esperando?</h2>
              <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
                <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
                <p>
                  Explorá qué propiedades están disponibles con <strong>MaLe</strong>, nuestro{" "}
                  <Link href="/blockexplorer" passHref className="link">
                    Buscador inteligente (WIP)
                  </Link>{" "}
                </p>
              </div>
            </div>*/}
            <div>
              <h2 className="text-lg font-bold justify-center text-center items-center">¿No sabés el valor de tu alquiler?</h2>
              <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
                <SparklesIcon className="h-8 w-8 fill-secondary" />
                <p>
                  Calculá el{" "} 
                  <Link href="/predecirPrecio" passHref className="link">
                     precio de tu alquiler
                  </Link>{" "}
                   acorde al mercado {" "}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
