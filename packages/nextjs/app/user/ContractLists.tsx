"use client";
import React, { useState } from "react";
import { Contract } from "../../types/utils";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { usePayRent } from "~~/hooks/darpaHooks";
import Servicios from "../servicios/Servicios";
import { useRouter } from "next/navigation";
import AmountToPay from "./AmountToPay";

interface ContractListsProps {
    contracts: Contract[];
    handleContractChange: (contractId: bigint, newStatus: string, amount: bigint, functionToCall: string) => Promise<void>;
  }

const ContractLists: React.FC<ContractListsProps> = ({ contracts, handleContractChange }) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const router = useRouter();
  const { payRent } = usePayRent();

  const handleButtonClick = (propertyId: string) => {
    setSelectedPropertyId(selectedPropertyId === propertyId ? null : propertyId);
  };

  

  const { address: connectedAddress } = useAccount();

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
                      <p className="text-gray-700 dark:text-gray-300">Dias de gracia: {contract.daysToPay}</p>
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
                                    onClick={() => handleContractChange(BigInt(contract.id), "Active", BigInt(contract.amount), "acceptContract")}>
                                    Aceptar
                                  </button>
                                <button className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                                    onClick={() => router.push(`/proposeNewOffer?contractId=${contract.id}`)}>
                                    Negociar
                                </button>
                                <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                    onClick={() => handleContractChange(BigInt(contract.id), "Cancelled", BigInt(contract.amount), "rejectLeaseOffer")}>
                                    Rechazar
                                </button>
                            </div>
                        )}

                      {contract.state == "Active" && (
                        <div className="mt-4 flex gap-4">
                            <AmountToPay contractId={BigInt(contract.id)}></AmountToPay>
                            
                            <button className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                              onClick={() => handleContractChange(BigInt(contract.id), "CancelationPropopsedByLessee", BigInt(contract.amount), "proposeContractCancelationMutualAgreementLessee")}>
                              Rescindir Contrato
                            </button>
                        </div>
                      )}

                      {contract.state == "CancelationProposedByOwner" && (
                        <div className="mt-4 flex gap-4">
                            <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                              onClick={() => handleContractChange(BigInt(contract.id), "Cancelled", BigInt(contract.amount), "acceptContractCancelationPropopsitionLessee")}>
                              Aceptar Rescisión
                            </button>
                            <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                              onClick={() => handleContractChange(BigInt(contract.id), "Active", BigInt(contract.amount), "rejectContractCancelationPropopsitionLessee")}>
                              Rechazar Rescisión
                            </button>
                        </div>
                      )}

                      {contract.state != "Cancelled" && (
                        <>
                          <button
                            onClick={() => handleButtonClick(contract.id)}
                            className="px-4 py-2 mt-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300 transition ease-in-out duration-300"
                          >
                            {selectedPropertyId === contract.id ? 'Cerrar Servicios' : 'Ver Servicios'}
                          </button>
                          {selectedPropertyId === contract.id && (
                            <div style={{ marginTop: '20px' }}>
                              <Servicios propiedadId={contract.id} />
                            </div>
                          )}
                        
                        <button
                              onClick={() => router.push(`/movimientos?propertyId=${contract.id}`)}
                              className="px-4 py-2 mt-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring focus:ring-purple-300 transition ease-in-out duration-300"
                          >
                              Ver Movimientos
                            </button>
                        </>
                        
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
                      <p className="text-gray-700 dark:text-gray-300">Dias de gracia: {contract.daysToPay}</p>
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

                      {contract.state == "DraftReview" && (
                        <div className="mt-4 flex gap-4">
                            <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                onClick={() => handleContractChange(BigInt(contract.id), "Draft", BigInt(contract.amount), "acceptContract")}>
                                Aceptar Cambios
                            </button>
                            <button className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                                onClick={() => router.push(`/reviewNewOffer?contractId=${contract.id}`)}>
                                Negociar
                            </button>
                            <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                onClick={() => handleContractChange(BigInt(contract.id), "Cancelled", BigInt(contract.amount), "rejectLeaseOffer")}>
                                Cerrar Contrato
                            </button>
                        </div>
                      )}

                        {contract.state == "Active" && (
                          <div className="mt-4 flex gap-4">
                              <button className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                                onClick={() => handleContractChange(BigInt(contract.id), "CancelationProposedByOwner", BigInt(contract.amount), "proposeContractCancelationMutualAgreementOwner")}>
                                Rescindir Contrato
                              </button>
                              <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                    onClick={() => handleContractChange(BigInt(contract.id), "Active", 0n, "withdraw")}>
                                    Withdraw
                              </button>
                          </div>
                        )}

                        {contract.state == "CancelationPropopsedByLessee" && (
                          <div className="mt-4 flex gap-4">
                              <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                onClick={() => handleContractChange(BigInt(contract.id), "Cancelled", BigInt(contract.amount), "acceptContractCancelationPropopsitionOwner")}>
                                Aceptar Rescisión
                              </button>
                              <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                onClick={() => handleContractChange(BigInt(contract.id), "Active", BigInt(contract.amount), "rejectContractCancelationPropopsitionOwner")}>
                                Rechazar Rescisión
                              </button>
                          </div>
                        )}

                        {contract.state != "Cancelled" && (
                          <>
                            <button
                              onClick={() => handleButtonClick(contract.id)}
                              className="px-4 py-2 mt-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300 transition ease-in-out duration-300"
                            >
                              {selectedPropertyId === contract.id ? 'Cerrar Servicios' : 'Ver Servicios'}
                            </button>
                            {selectedPropertyId === contract.id && (
                              <div style={{ marginTop: '20px' }}>
                                <Servicios propiedadId={contract.id} />
                              </div>
                            )}

                            <button
                              onClick={() => router.push(`/movimientos?propertyId=${contract.id}`)}
                              className="px-4 py-2 mt-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring focus:ring-purple-300 transition ease-in-out duration-300"
                            >
                              Ver Movimientos
                            </button>
                        </>

                        )}
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