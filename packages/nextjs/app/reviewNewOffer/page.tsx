"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from "../loginPage/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useAccount } from "wagmi";
import { AddressInput, EtherInput, IntegerInput } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const ProposeNewOfferPage = () => {
  const searchParams = useSearchParams();
  const contractId = searchParams.get("contractId");
  const contractIdString: string = contractId ?? "0";
  const router = useRouter();

  useEffect(() => {
    if (contractId) {
      console.log(`Contract ID: ${contractId}`);
    }
  }, [contractId]);

  const { address: connectedAddress } = useAccount();
  const [interestRate, setInterestRate] = useState<string | bigint>("");
  const [paymentPeriod, setPaymentPeriod] = useState<string | bigint>("");

  const [ethAmount, setEthAmount] = useState("");

  const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract("YourContract");

  return (
    <div
      className="px-6 pt-10 pb-8 shadow-xl sm:my-auto bg-secondary sm:mx-auto sm:max-w-11/12 md:w-9/12 sm:w-11/12 sm:rounded-lg sm:px-10"
      style={{
        backgroundColor: "rgba(203, 207, 211, 0.5)",
        backgroundImage: "url(tele.jpg)",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <img src="ARPA-WIDE.png" alt="logo de ARPA" className="mx-auto imgRounder" />
      <br />
      <div
        className="mb-3 inline-block w-full rounded px-6 pb-8 pt-8 text-center text-lg font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_rgba(0,0,0,0.2)] transition duration-150 ease-in-out hover:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:outline-none focus:ring-0 active:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)]"
        style={{ backgroundColor: "#370921" }}
      >
        NEGOCIACION DEL CONTRATO
      </div>
      <br />
      <br />
      <label className="text-lg font-bold text-white">ID del contrato:</label>
      <AddressInput
        value={contractIdString}
        placeholder="Ingrese el ID del contrato"
        onChange={function (): void {
          throw new Error("Function not implemented.");
        }}
      />
      <br />
      <br />
      <label className="text-lg font-bold text-white">Tu billetera:</label>
      <AddressInput value={connectedAddress} />
      <br />
      <br />
      <label className="text-lg font-bold text-white">Nuevo Precio:</label>
      <EtherInput
        value={ethAmount}
        onChange={amount => setEthAmount(amount)}
        placeholder="Ingrese el nuevo precio sugerido"
      />
      <br />
      <br />
      <label className="text-lg font-bold text-white">Nueva Penalidad porcentual por atraso de pago:</label>
      <IntegerInput
        value={interestRate}
        onChange={updatedInterestRate => {
          setInterestRate(updatedInterestRate);
        }}
        placeholder="Ingrese la nueva penalidad sugerida"
      ></IntegerInput>
      <br />
      <br />
      <label className="text-lg font-bold text-white">Nuevo Limite en días para realizar el pago mensual:</label>
      <IntegerInput
        value={paymentPeriod}
        onChange={updatedPaymentPeriod => {
          setPaymentPeriod(updatedPaymentPeriod);
        }}
        placeholder="Ingrese el nuevo nuemero de dias sugerido para realizar el pago mensual"
      ></IntegerInput>

      <br />
      <br />
      <button
        className="mb-3 inline-block w-full rounded px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_rgba(0,0,0,0.2)] transition duration-150 ease-in-out hover:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:outline-none focus:ring-0 active:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)]"
        style={{ backgroundColor: "#8c376c" }}
        onClick={async () => {
          try {
            await writeYourContractAsync({
              functionName: "reviewProposedChanges",
              args: [BigInt(contractIdString), BigInt(ethAmount), BigInt(interestRate), BigInt(paymentPeriod)],
            });
            if (auth.currentUser) {
              try {
                const contractRef = doc(db, "Contratos", contractIdString);
                await updateDoc(contractRef, {
                  state: "DraftReview",
                  amount: ethAmount,
                  interest: interestRate,
                  daysToPay: paymentPeriod,
                });
              } catch (e_1) {
                console.error("Error setting greeting:", e_1);
              }
            }
          } catch (e) {
            console.error("Error setting greeting:", e);
          }
          router.push("/user");
        }}
      >
        Proponer nuevas condiciones de alquiler
      </button>
      <br />
      <br />
    </div>
  );
};

export default ProposeNewOfferPage;
