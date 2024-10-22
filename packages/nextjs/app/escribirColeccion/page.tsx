'use client';
import type { NextPage } from "next";
import React from "react";
import { collection, addDoc } from "firebase/firestore"; 
import { db } from "../loginPage/firebase";

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
 
  return(<div>
    <button onClick={writeToDataBase}>Escribir a DB</button>
  </div>)

  };

  export default testWriteDB;