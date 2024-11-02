'use client';
import type { NextPage } from "next";
import React from "react";
import { collection, addDoc } from "firebase/firestore"; 
import { db } from "../loginPage/firebase";
import { useAccount } from "wagmi";
import { Address, Balance } from "~~/components/scaffold-eth";

async function writeToDataBase(){
    try {
        const docRef = await addDoc(collection(db, "contratos"), {
          amount: 200,
          idProperty: 1,
          owner: "testOwner"
        });
        console.log("Document written with ID: ", docRef.id);
      } catch (e) {
        console.error("Error adding document: ", e);
      }
}

const testWriteDB: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  return(<div>
    <button onClick={writeToDataBase}>Escribir a DB</button>

    <div className="text-sm font-semibold mb-2">
        Address: <Address address={connectedAddress} />
      </div>
  </div>)

  };

  export default testWriteDB;