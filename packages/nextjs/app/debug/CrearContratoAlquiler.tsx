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


export const CrearContratoAlquiler = () => {
    //const router = useRouter();
    const userAccount = useAccount();

    const { address: connectedAddress } = useAccount();
    const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract("YourContract");
    return(

    <button
        className="btn btn-primary"
            onClick={async () => {
            try {
                await writeYourContractAsync({
                    functionName: "CrearContrato",
                    args: [connectedAddress,connectedAddress,1,777]
      });
    } catch (e) {
      console.error("Error setting greeting:", e);
    }
  }}
>
  Crear contrato de alquiler
</button>);

    //const { writeAsync, isLoading } = useScaffoldWriteContract({
    //    contractName: "CrowdFund",
    //    functionName: "createFundRun",
    //    args: [titleInput, descInput, targetInput, deadlineInput, ownersList],
    //    onBlockConfirmation: txnReceipt => {
    //      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
    //    },
    //  });
}