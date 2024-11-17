'use client';
import type { NextPage } from "next";
import React from "react";
import {createUserWithEmailAndPassword} from 'firebase/auth';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { useState } from 'react';
import { db } from "./firebase";
import { setDoc, doc } from "firebase/firestore";
import { useAccount } from "wagmi";

const LoginPage: NextPage = () => {
  const [userName,setUserName] = useState('');
  const [password,setPassword] = useState('');
  const { address: connectedAddress } = useAccount();

  function handleUsernameChange(event: React.ChangeEvent<HTMLInputElement>){
    setUserName(event.target.value);
  }

  function handlePasswordChange(event: React.ChangeEvent<HTMLInputElement>){
    setPassword(event.target.value);
  }

  async function createNewUser(email: string,password: string){
    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed up 
      const user = userCredential.user;
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      // ..
    });
    try{
      const docRef = doc(db,"Email-Wallets",userName);
      await setDoc(docRef, {
        userEmail: userName,
        walletAddr: [connectedAddress],
      });
      console.log("Document added to Email-Wallets with ID: ", userName);
    } catch(e){
      console.error("Error adding document: ", e);
    };
    try {
      const docRef = doc(db,"Wallet-email",connectedAddress);
      await setDoc(docRef, {
        userEmail: userName,
        walletAddr: localStorage.getItem('DarpaConnectedWallet'),
      });
      console.log("Document added with ID: ", connectedAddress);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  function login(email: string, password: string){
    event?.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed up 
      const user = userCredential.user;
      alert("login succesful");
      
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(errorCode);
      // ..
    });
  }
  

  if (userName != '' && password != ''){
    return (
      <>
          <form>
            Registrate en nuestra aplicacion
            <div></div>
            <label>Mail de usuario: </label>
            <input type="text" id="fname" name="fname" value={userName} placeholder="unmail@mail.com" onChange={handleUsernameChange} ></input>
            <div></div>
            <label>Password: </label>
            <input type="password" id="fpass" name="fpass" value={password}  placeholder="password" onChange={handlePasswordChange}></input>
            <div></div>
            <button onClick={() => createNewUser(userName,password)} >Crear nuevo usuario</button>
            <div></div>
            <button onClick={() => login(userName,password)} >Ingresar usuario</button>
          </form>
        
  
          <div className="text-center mt-8 bg-secondary p-10">
              <h1 className="text-4xl my-0">Dale, ponelo en alquiler</h1>
              <p className="text-neutral">
              Podrás retirar el dinero del contrato a tu billetera conectada cuando un inquilino lo deposite.
              <br /> Con amor,{" "}
              <code className="italic bg-base-300 text-base font-bold [word-spacing:-0.5rem] px-1">
                  El equipo de ARPA
              </code>{" "}
              </p>
          </div>
      </>
    );
  } else {
    return (
      <>
          <form>
            Registrate en nuestra aplicacion
            <div></div>
            <label>Mail de usuario: </label>
            <input type="text" id="fname" name="fname" value={userName} placeholder="unmail@mail.com" onChange={handleUsernameChange} ></input>
            <div></div>
            <label>Password: </label>
            <input type="password" id="fpass" name="fpass" value={password}  placeholder="password" onChange={handlePasswordChange}></input>
            <div></div>
            <button onClick={() => createNewUser(userName,password)} disabled>Crear nuevo usuario</button>
            <div></div>
            <button onClick={() => login(userName,password)} disabled>Ingresar usuario</button>
          </form>
        
  
          <div className="text-center mt-8 bg-secondary p-10">
              <h1 className="text-4xl my-0">Dale, ponelo en alquiler</h1>
              <p className="text-neutral">
              Podrás retirar el dinero del contrato a tu billetera conectada cuando un inquilino lo deposite.
              <br /> Con amor,{" "}
              <code className="italic bg-base-300 text-base font-bold [word-spacing:-0.5rem] px-1">
                  El equipo de ARPA
              </code>{" "}
              </p>
          </div>
      </>
    );
  }

  };

  export default LoginPage;