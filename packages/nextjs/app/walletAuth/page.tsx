'use client';
import type { NextPage } from "next";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";
import React from "react";
import { useState } from 'react';
import { set } from "nprogress";
import { useSignMessage } from 'wagmi'
import { useAccount } from "wagmi";
import { auth } from "../loginPage/firebase";
import { signInWithCustomToken } from "firebase/auth";
import { enableNetwork } from "firebase/firestore";

const walletAuth: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { data: signMessageData, error, isLoading, signMessage, variables } = useSignMessage()
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
        console.log("Token received:", token);
        signInWithCustomToken(auth,token).then((userCredential) => {
          // Signed in
          const user = userCredential.user;
          localStorage.setItem('DarpaToken',token);
          alert("Signed in");
          console.log("signed in");
          // ...
        }).catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log("error de login");
          // ...
        });

    }
    catch(error){
      console.log("error.message");
    }
  }

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
  

    
}

export default walletAuth;