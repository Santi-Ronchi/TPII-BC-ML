"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
//import { useRouter } from "next/router";
//import { IntegerVariant, isValidInteger } from "../scaffold-eth";
import { formatEther, isAddress, parseEther } from "viem";
import { useAccount, useClient } from "wagmi";
//import { useScaffoldContractWrite, useScaffoldEventSubscriber } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { AddressInput, EtherInput, IntegerInput } from "~~/components/scaffold-eth";
import { addDoc, collection, setDoc, doc } from "firebase/firestore";
import { auth, db } from "../loginPage/firebase";


export const CrearContratoAlquiler = () => {
  const userAccount = useAccount();


  const { address: connectedAddress } = useAccount();
  const [lesseAddress, setLesseAddress] = useState("");
  const [interestRate, setInterestRate] = useState<string | bigint>("");
  const [paymentPeriod, setPaymentPeriod] = useState<string | bigint>("");
  const [contractDuration, setContractDuration] = useState<string | bigint>("");

  const [ethAmount, setEthAmount] = useState("");
  const [txValue, setTxValue] = useState<string | bigint>("");

    const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract("YourContract");

    return(

    <div className="px-6 pt-10 pb-8 shadow-xl sm:my-auto bg-secondary sm:mx-auto sm:max-w-11/12 md:w-9/12 sm:w-11/12 sm:rounded-lg sm:px-10" 
      style={{ 
        backgroundColor: 'rgba(203, 207, 211, 0.5)',
        backgroundImage: 'url(cuarto.jpg)',
        backgroundSize: 'cover', // Ajusta el tamaño de la imagen para que cubra todo el elemento
        backgroundRepeat: 'no-repeat', // Evita que la imagen se repita
        backgroundPosition: 'center' // Centra la imagen
      }} > 
    
      <img src="ARPA-WIDE.png" alt="logo de ARPA" className="mx-auto imgRounder" />
      <br />
      <div
        className="mb-3 inline-block w-full rounded px-6 pb-8 pt-8 text-center text-lg font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_rgba(0,0,0,0.2)] transition duration-150 ease-in-out hover:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:outline-none focus:ring-0 active:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)]"
        style={{ backgroundColor: '#370921' }}
      >
        CREA TU CONTRATO
      </div>
      <br /><br />
      <label className="text-md font-bold text-white">Tu Billetera</label>
      <AddressInput value={connectedAddress} placeholder="Input your owner address" />
      <br />
      <label className="text-md font-bold text-white">Rentador</label>
      <AddressInput onChange={setLesseAddress} value={lesseAddress} placeholder="Ingrese billetera del inquilino" />
      <br />
      <label className="text-md font-bold text-white">ID de la propiedad</label>
      <IntegerInput
        value={txValue}
        onChange={updatedTxValue => {
          setTxValue(updatedTxValue);
        }}
        placeholder="ID de la propiedad"
      />
      <br />
      <label className="text-lg font-bold text-white">Precio</label>
      <EtherInput value={ethAmount} onChange={amount => setEthAmount(amount)} placeholder="Ingrese precio del contrato" />
      <br />
      <label className="text-lg font-bold text-white">Penalidad porcentual por atraso de pago</label>
      <IntegerInput value={interestRate} onChange={updatedInterestRate => {
        setInterestRate(updatedInterestRate);
      }} placeholder="Ingrese penalidad porcentual"></IntegerInput>
      <br />
      <label className="text-lg font-bold text-white">Limite en días para realizar el pago mensual</label>
      <IntegerInput value={paymentPeriod} onChange={updatedPaymentPeriod => {
        setPaymentPeriod(updatedPaymentPeriod);
      }} placeholder="Ingrese limite en días para realizar el pago mensual"></IntegerInput>
      <br />
      <label className="text-lg font-bold custom-text-style text-white">Duración del contrato(en meses)</label>
      <IntegerInput value={contractDuration} onChange={updatedContractDuration => {
        setContractDuration(updatedContractDuration);
      }} placeholder="Ingrese duración del contrato"></IntegerInput>

      <br />
      <button
        className="mb-3 inline-block w-full rounded px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_rgba(0,0,0,0.2)] transition duration-150 ease-in-out hover:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:outline-none focus:ring-0 active:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)]"
        style={{ backgroundColor: '#8c376c' }}
        onClick={async () => {
          try {
            await writeYourContractAsync({
              functionName: "createContract",
              args: [ethAmount, txValue, lesseAddress, paymentPeriod, interestRate, contractDuration]
            }).then(async () => {
              if (auth.currentUser) {
                try {
                  const txValue_str = typeof txValue === 'bigint' ? txValue.toString() : txValue;
                  const docRef = doc(db, "Contratos", txValue_str);
                  setDoc(docRef, {
                    ownerAddress: connectedAddress,//ownerAddress,
                    lesseAddress: lesseAddress,
                    amount: ethAmount,
                    daysToPay: paymentPeriod,
                    interest: interestRate,
                    duration: contractDuration,
                    state: "Draft"
                  });
                }
                catch (e_1) {
                  console.error("Error setting greeting:", e_1);
                }
              }
            });

          } catch (e) {
            console.error("Error setting greeting:", e);
          }
        }}>
        Crear contrato de alquiler
      </button>
    </div>

  );

  //const { writeAsync, isLoading } = useScaffoldWriteContract({
  //    contractName: "CrowdFund",
  //    functionName: "createFundRun",
  //    args: [titleInput, descInput, targetInput, deadlineInput, ownersList],
  //    onBlockConfirmation: txnReceipt => {
  //      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
  //    },
  //  });
}