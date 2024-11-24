"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
//import { useRouter } from "next/router";
//import { IntegerVariant, isValidInteger } from "../scaffold-eth";
import { formatEther, isAddress, parseEther } from "viem";
import { useAccount , useClient} from "wagmi";
//import { useScaffoldContractWrite, useScaffoldEventSubscriber } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { AddressInput,  EtherInput, IntegerInput } from "~~/components/scaffold-eth";
import { addDoc, collection, setDoc, doc } from "firebase/firestore";
import { auth, db } from "../loginPage/firebase";


export const CrearContratoAlquiler = () => {
    //const router = useRouter();
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


      <div className="px-6 pt-10 pb-8 shadow-xl sm:my-auto bg-secondary sm:mx-auto sm:max-w-11/12 md:w-9/12 sm:w-11/12 sm:rounded-lg sm:px-10">
        <img src="ARPA-WIDE.png" alt="logo de ARPA" className="mx-auto imgRounder"/>
        <h1 className="text-xl font-bold">Ingresa los datos de tu propiedad:</h1>
        <br /><br />
        <label className="text-md font-bold">Tu Billetera</label>
        <AddressInput value={connectedAddress} placeholder="Input your owner address" />
        <br />
        <label className="text-md font-bold">Rentador</label>
        <AddressInput onChange={setLesseAddress} value={lesseAddress} placeholder="Input your lesse address" />
        <br />
        <label className="text-md font-bold">ID de la propiedad</label>
        <IntegerInput
          value={txValue}
          onChange={updatedTxValue => {
            setTxValue(updatedTxValue);
        }}
        placeholder="ID de la propiedad"
        />
        <br />
        <label className="text-lg font-bold">Precio</label>
        <EtherInput value={ethAmount} onChange={amount => setEthAmount(amount)} />

        <label className="text-lg font-bold">Penalidad porcentual por atraso de pago</label>
        <IntegerInput value = {interestRate} onChange={updatedInterestRate => {
          setInterestRate(updatedInterestRate);
        }}></IntegerInput>

        <label className="text-lg font-bold">Limite en días para realizar el pago mensual</label>
        <IntegerInput value = {paymentPeriod} onChange={updatedPaymentPeriod => {
          setPaymentPeriod(updatedPaymentPeriod);
        }}></IntegerInput>

        <label className="text-lg font-bold">Duración del contrato(en meses)</label>
        <IntegerInput value = {contractDuration} onChange={updatedContractDuration => {
          setContractDuration(updatedContractDuration);
        }}></IntegerInput>

        <br />
        <button
          className="btn btn-primary"
            onClick={async () => {
              try {
                await writeYourContractAsync({
                    functionName: "CrearContrato",
                    //args: [connectedAddress,connectedAddress,1,777]
                    args: [ethAmount,txValue,lesseAddress,paymentPeriod,interestRate,contractDuration]
                    //args: [ownerAddress,lesseAddress,ethAmount,txValue]
              }).then(async () =>{
                console.log("TODO Creamos el contrato correctamente");
                if (auth.currentUser){
                  try{
                    console.log("Entramos al try para agregar el contrato a firebase");
                    const docRef = doc(db,"Contratos",txValue);
                    setDoc(docRef,{
                        ownerAddress : ownerAddress,
                        lesseAddress : lesseAddress,
                        amount : ethAmount,
                        daysToPay: paymentPeriod,
                        interest: interestRate,
                        duration: contractDuration,
                        state: "Draft"
                      });
                  }
                  catch(e_1){
                    console.error("Error setting greeting:", e_1);
                  }
                } 
              } );

            } catch (e) {
      console.error("Error setting greeting:", e);
      }
      } }>
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