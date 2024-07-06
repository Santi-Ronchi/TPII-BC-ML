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


export const CrearContratoAlquiler = () => {
    //const router = useRouter();
    const userAccount = useAccount();

    const { address: connectedAddress } = useAccount();
    const [ownerAddress, setOwnerAddress] = useState("");
    const [lesseAddress, setLesseAddress] = useState("");

    const [ethAmount, setEthAmount] = useState("");
    const [txValue, setTxValue] = useState<string | bigint>("");

    


    const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract("YourContract");
    return(


      <div>
        <AddressInput onChange={setOwnerAddress} value={ownerAddress} placeholder="Input your owner address" />;
        <AddressInput onChange={setLesseAddress} value={lesseAddress} placeholder="Input your lesse address" />;
        <IntegerInput
          value={txValue}
          onChange={updatedTxValue => {
            setTxValue(updatedTxValue);
        }}
        placeholder="ID de la propiedad"
        />;
        <EtherInput value={ethAmount} onChange={amount => setEthAmount(amount)} />;

        <button
          className="btn btn-primary"
            onClick={async () => {
              try {
                await writeYourContractAsync({
                    functionName: "CrearContrato",
                    //args: [connectedAddress,connectedAddress,1,777]
                    args: [ownerAddress,lesseAddress,ethAmount,txValue]
              });
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