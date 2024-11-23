'use client';
import type { NextPage } from "next";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";
import React from "react";
import { useState } from 'react';
import { set } from "nprogress";
import { useSignMessage } from 'wagmi'
import { useAccount } from "wagmi";
import { auth, db } from "../loginPage/firebase";
import { signInWithCustomToken } from "firebase/auth";
import { addDoc, collection, setDoc, doc, query, where, getDocs, getCountFromServer } from "firebase/firestore";

const walletAuth: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { data: signMessageData, error, signMessage, variables } = useSignMessage()
  const [userName,setUserName] = useState('');
  const [emailSet, setEmailInput] = useState(true);

  function handleUsernameChange(event: React.ChangeEvent<HTMLInputElement>){
    setUserName(event.target.value);
  }

  async function requestLogin(signedMsg: string, walletAddr: string, msg: string){
  const url = "https://darpabackofficeservice.onrender.com/login/walletLogin"
  const body = JSON.stringify({signedMsg: signedMsg, walletAddr: walletAddr, msg:msg}) 
    try{
        const response = await fetch(url,{
          method:'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            },
            body:body
        });
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }
        const data = await response.json(); 
        const token = data.token; 
        signInWithCustomToken(auth,token).then((userCredential) => {
          // Signed in
          const user = userCredential.user;
          localStorage.setItem('DarpaToken',token);
          localStorage.setItem('DarpaConnectedWallet',walletAddr);
          alert("Signed in");
          console.log("signed in");

        }).catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log("error de autenticacion");
          // ...
        });
        //Tras conectarse, revisar que el mail este en la base de datos
        const ref = collection(db,'Wallet-email');
        const q = query(ref,where("walletAddr",'==',localStorage.getItem("DarpaConnectedWallet")));
        //const queryResult = await getDocs(q);
        const queryResult = await getCountFromServer(q);
        if (queryResult.data().count == 0){
          setEmailInput(false);
          console.log("La wallet no tiene mail asociado")
        } else{
          console.log("La wallet tiene mail asociado");
        }
        //queryResult.forEach((doc) => {console.log(doc.id, '=>', doc.data())});
    }
    catch(error){
      console.log("error.message");
    }
  }

  async function addEmailToDatabase() {
    if (auth.currentUser) {
      console.log("Estoy logeado actualmente");
  
      // Capturar y validar la billetera conectada
      const walletAddr = localStorage.getItem('DarpaConnectedWallet');
      if (!walletAddr) {
        console.error("No se encontró 'DarpaConnectedWallet' en localStorage");
        return; // Termina la función si no hay billetera
      }
  
      try {
        // Referencia al documento usando la billetera
        const docRef = doc(db, "Wallet-email", walletAddr);
        await setDoc(docRef, {
          userEmail: userName,
          walletAddr: walletAddr,
        });
        console.log("Documento añadido con ID: ", walletAddr);
      } catch (e) {
        console.error("Error al añadir documento: ", e);
      }
  
      try {
        // Referencia al documento usando el email
        const docRef = doc(db, "Email-Wallets", userName);
        await setDoc(docRef, {
          userEmail: userName,
          walletAddr: [walletAddr],
        });
        console.log("Documento añadido a Email-Wallets con ID: ", userName);
      } catch (e) {
        console.error("Error al añadir documento: ", e);
      }
    }
  }
  

  if(emailSet){
    return (
      <div>
        <div>
      <button  onClick={() => signMessage({ message: 'hello world' })}>
        Sign message 
      </button>
      </div>
      <button 
        onClick={ () => 
        {requestLogin(signMessageData.toString(),connectedAddress.toString(),'hello world');       
        }}>
        Wallet login
      </button>
      </div>
    )
  }//version wallet sin mail asociado 
  else{
    return (
      <div>
        <div>
      <button  onClick={() => signMessage({ message: 'hello world' })}>
        Sign message 
      </button>
      </div>
      <button 
        onClick={ () => 
        {requestLogin(signMessageData.toString(),connectedAddress.toString(),'hello world');       
        }}>
        Wallet login
      </button>
      <div>
            Necesitamos que nos proveas de una dirección de mail para poder hacer uso de nuestra app
            <div><label>Mail de usuario: </label></div>
            
            <input type="text" id="fname" name="fname" value={userName} placeholder="unmail@mail.com" onChange={handleUsernameChange} ></input>
            <div></div>
        <button onClick = { () => addEmailToDatabase()}>
          Vincular mail
        </button>
      </div>

      </div>
    )
  }


    
  

    
}

export default walletAuth;