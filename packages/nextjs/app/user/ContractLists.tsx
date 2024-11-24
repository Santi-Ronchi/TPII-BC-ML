"use client";

import React, { useEffect, useState } from "react";
import { User, Contract } from "../../types/utils";
import { db } from "./firebase";
import { doc, getDoc, getDocs, collection, query, where } from "firebase/firestore";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface ContractListsProps {
    contracts: Contract[];
  }

const ContractLists: React.FC<ContractListsProps> = ({ contracts }) => {

  const { address: connectedAddress } = useAccount();
    
  const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract("YourContract");

    return(
        <div className="w-full bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 border-b-2 border-gray-300 dark:border-gray-700 pb-3 mb-4">
          Contratos asociados a {connectedAddress}
        </h2>
        {contracts.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-6 mt-6">
            {/* Lessee Contracts */}
            <div className="flex-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-lg">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 border-b-2 border-gray-300 dark:border-gray-700 pb-3 mb-4">
                Contratos como Inquilino
              </h3>
              <ul className="space-y-4">
                {contracts
                  .filter((contract) => contract.lesseAddress === connectedAddress)
                  .map((contract) => (
                    <li
                      key={contract.id}
                      className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 p-4 rounded-md shadow-sm transition-transform transform hover:scale-105 duration-300"
                    >
                      <strong className="block text-lg text-gray-800 dark:text-gray-200">
                        ID: {contract.id}
                      </strong>
                      <p className="text-gray-700 dark:text-gray-300">Estado: {contract.state}</p>
                      <p className="text-gray-700 dark:text-gray-300">Monto a pagar: {contract.amount}</p>
                      <p className="text-gray-700 dark:text-gray-300">
                        Duración: {contract.duration} meses
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">Interés: {contract.interest}%</p>
                      <p className="text-gray-700 dark:text-gray-300">
                        Dirección del dueño:{" "}
                        <span className="font-semibold">{contract.ownerAddress}</span>
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">
                        Dirección del inquilino:{" "}
                        <span className="font-semibold">{contract.lesseAddress}</span>
                      </p>

                      {contract.state == "Draft" && (
                            <div className="mt-4 flex gap-4">
                            <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                onClick={async () => {
                                    try {
                                    await writeYourContractAsync({
                                        functionName: "AceptarContrato",
                                        args: [contract.id]
                                    });
                                } catch (e) {
                            console.error("Error setting greeting:", e);
                            }
                            } }>
                                Aceptar
                            </button>
                            <button className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors">
                                Negociar
                            </button>
                            <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
                                Rechazar
                            </button>
                            </div>
                        )}
                    </li>
                  ))}
              </ul>
            </div>
  
            {/* Owner Contracts */}
            <div className="flex-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-lg">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 border-b-2 border-gray-300 dark:border-gray-700 pb-3 mb-4">
                Contratos como Dueño
              </h3>
              <ul className="space-y-4">
                {contracts
                  .filter((contract) => contract.ownerAddress === connectedAddress)
                  .map((contract) => (
                    <li
                      key={contract.id}
                      className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 p-4 rounded-md shadow-sm transition-transform transform hover:scale-105 duration-300"
                    >
                      <strong className="block text-lg text-gray-800 dark:text-gray-200">
                        ID: {contract.id}
                      </strong>
                      <p className="text-gray-700 dark:text-gray-300">Estado: {contract.state}</p>
                      <p className="text-gray-700 dark:text-gray-300">Monto a pagar: {contract.amount}</p>
                      <p className="text-gray-700 dark:text-gray-300">
                        Duración: {contract.duration} meses
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">Interés: {contract.interest}%</p>
                      <p className="text-gray-700 dark:text-gray-300">
                        Dirección del dueño:{" "}
                        <span className="font-semibold">{contract.ownerAddress}</span>
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">
                        Dirección del inquilino:{" "}
                        <span className="font-semibold">{contract.lesseAddress}</span>
                      </p>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">No posees contratos activos.</p>
        )}
      </div>
    );
};

export default ContractLists;