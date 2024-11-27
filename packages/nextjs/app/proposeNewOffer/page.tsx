"use client";

import { doc, setDoc } from "firebase/firestore";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { AddressInput, EtherInput, IntegerInput } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { auth, db } from "../loginPage/firebase";

export const ProposeNewOfferPage = () => {
    const searchParams = useSearchParams();
    const contractId = searchParams.get("contractId");

    useEffect(() => {
    if (contractId) {
        console.log(`Contract ID: ${contractId}`);
    }
    }, [contractId]);

    const { address: connectedAddress } = useAccount();
    const [lesseAddress, setLesseAddress] = useState("");
    const [interestRate, setInterestRate] = useState<string | bigint>("");
    const [paymentPeriod, setPaymentPeriod] = useState<string | bigint>("");
    const [contractDuration, setContractDuration] = useState<string | bigint>("");

    const [ethAmount, setEthAmount] = useState("");

    const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract("YourContract");


  return(

    <div className="px-6 pt-10 pb-8 shadow-xl sm:my-auto bg-secondary sm:mx-auto sm:max-w-11/12 md:w-9/12 sm:w-11/12 sm:rounded-lg sm:px-10">
      <img src="ARPA-WIDE.png" alt="logo de ARPA" className="mx-auto imgRounder"/>
      <h1 className="text-xl font-bold">Ingresa la nueva propuesta de contrato:</h1>
      <br /><br />
      <label className="text-md font-bold">Tu Billetera</label>
      <AddressInput value={connectedAddress} placeholder="[O.0]" />
      <br />
      <label className="text-md font-bold">Dueño del inmueble</label>
      <AddressInput value={connectedAddress} placeholder="x_x" />
      <br />
      <label className="text-lg font-bold">Nuevo Precio</label>
      <EtherInput value={ethAmount} onChange={amount => setEthAmount(amount)} />
      <br />
      <label className="text-lg font-bold">Nueva Penalidad porcentual por atraso de pago</label>
      <IntegerInput value = {interestRate} onChange={updatedInterestRate => {
        setInterestRate(updatedInterestRate);
      }}></IntegerInput>
      <br />
      <label className="text-lg font-bold">Nuevo Limite en días para realizar el pago mensual</label>
      <IntegerInput value = {paymentPeriod} onChange={updatedPaymentPeriod => {
        setPaymentPeriod(updatedPaymentPeriod);
      }}></IntegerInput>

      <br />
      <button
        className="btn btn-primary"
          onClick={async () => {
            try {
              await writeYourContractAsync({
                  functionName: "proposeChanges",
                  args: [contractId,ethAmount,interestRate,paymentPeriod]
            }).then(async () =>{
              if (auth.currentUser){
                try{
                  const txValue_str = contractId;
                  const docRef = doc(db,"Contratos",txValue_str);
                  setDoc(docRef,{
                      ownerAddress : connectedAddress,//ownerAddress,
                      lesseAddress : lesseAddress,
                      amount : ethAmount,
                      daysToPay: paymentPeriod,
                      interest: interestRate,
                      duration: contractDuration,
                      state: "DraftReview"
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
        Proponer nuevo contrato de alquiler
    </button>
  </div>

  );
};

export default ProposeNewOfferPage;