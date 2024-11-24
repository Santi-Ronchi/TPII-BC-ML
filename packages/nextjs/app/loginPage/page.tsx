'use client';
import type { NextPage } from "next";
import React from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { useState } from 'react';
import { db } from "./firebase";
import { setDoc, doc } from "firebase/firestore";
import { useAccount } from "wagmi";
import router from "next/router";

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

  async function createNewUser(email: string, password: string) {
    try {
      // Crear el usuario
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      console.log("Usuario creado: ", user);
  
      // Validar que connectedAddress no sea undefined
      if (!connectedAddress) {
        throw new Error("connectedAddress no está definido.");
      }
  
      // Agregar documento a Email-Wallets
      const emailDocRef = doc(db, "Email-Wallets", userName);
      await setDoc(emailDocRef, {
        userEmail: userName,
        walletAddr: [connectedAddress],
      });
      console.log("Documento añadido a Email-Wallets con ID: ", userName);
  
      // Agregar documento a Wallet-email
      const walletDocRef = doc(db, "Wallet-email", connectedAddress);
      await setDoc(walletDocRef, {
        userEmail: userName,
        walletAddr: connectedAddress,
      });
      console.log("Documento añadido con ID: ", connectedAddress);
  
    } catch (error) {
      console.error("Error: ", error);
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
  

//  if (userName != '' && password != ''){
    return (
      <section className="">
        <div className=" h-full p-10">
          <div className="g-6 flex h-full flex-wrap items-center justify-center text-neutral-800 dark:text-neutral-200">
            <div className="w-full">
              <div className="block rounded-lg bg-white shadow-lg dark:bg-neutral-800">
                <div className="g-0 lg:flex lg:flex-wrap">
                  {/* <!-- Left column container--> */}
                  <div className="px-4 md:px-0 lg:w-6/12">
                    <div className="md:mx-6 md:p-12">
                      {/* <!--Logo--> */}
                      <div className="text-center">
                        <img
                          className="mx-auto w-48 rounded-lg"
                          src="./logo-arpa.png"
                          alt="logo"
                        />
                        <h4 className="mb-12 mt-1 pb-1 text-xl font-semibold">
                          Un hogar con tu identidad.
                        </h4>
                      </div>
  
                      <form>
                        <p className="mb-4">Ingresá con tu cuenta:</p>
                        {/* <!--Username input--> */}
                        <input
                          type="text"
                          className="mb-4 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)} 
                        ></input>

                        <br />

                        {/* <!--Password input--> */}
                        <input
                          type="password"
                          className="mb-4 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)} 
                        ></input>
  
                        {/* <!--Submit button--> */}
                        <div className="mb-12 pb-1 pt-1 text-center">
                            <button 
                              onClick={() => {login(userName,password); router.push("/")}}
                              className="mb-3 inline-block w-full rounded px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_rgba(0,0,0,0.2)] transition duration-150 ease-in-out hover:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:outline-none focus:ring-0 active:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)]"
                              type="button"
                              style={{
                                background:
                                  "linear-gradient(to right, #ee7724, #d8363a, #dd3675, #b44593)",
                              }}
                              disabled={!userName || !password}
                            >
                              Log in
                            </button>
                            
                            <button 
                              onClick={() => router.push("/walletAuth")}
                              className="mb-3 inline-block w-full rounded px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_rgba(0,0,0,0.2)] transition duration-150 ease-in-out hover:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:outline-none focus:ring-0 active:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)]"
                              type="button"
                              style={{
                                background:
                                  "linear-gradient(to right, #ee7724, #d8363a, #dd3675, #b44593)",
                              }}
                            >
                              Wallet Log In
                            </button>
                          {/* <!--Forgot password link--> */}
                          <a href="#!">Te olvidaste la contraseña?</a>
                        </div>
  
                        {/* <!--Register button--> */}
                        <div className="flex items-center justify-between pb-6">
                          <p className="">¿No tenes una cuenta? ¿Qué esperas?</p>
                            <button
                              onClick={() => router.push("/registerPage")}
                              type="button"
                              className="inline-block rounded border-2 border-danger px-6 pb-[6px] pt-2 text-xs font-medium uppercase leading-normal text-danger transition duration-150 ease-in-out hover:border-danger-600 hover:bg-neutral-500 hover:bg-opacity-10 hover:text-danger-600 focus:border-danger-600 focus:text-danger-600 focus:outline-none focus:ring-0 active:border-danger-700 active:text-danger-700 dark:hover:bg-neutral-100 dark:hover:bg-opacity-10"
                            >
                              Registrate aca!
                            </button>
                        </div>
                      </form>
                    </div>
                  </div>
  
                  {/* <!-- Right column container with background and description--> */}
                  <div
                    className="flex items-center rounded-b-lg lg:w-6/12 lg:rounded-r-lg lg:rounded-bl-none"
                    style={{
                      background:
                        "linear-gradient(to right, #ee7724, #d8363a, #dd3675, #b44593)",
                    }}
                  >
                    <div className="px-4 py-6 text-white md:mx-6 md:p-12">
                      <div className="text-center">
                        <img src="./ARPA-LOGIN-noback.png" alt="logo"/>
                      </div>
                      <h4 className="mb-6 text-xl font-semibold">
                        Es más que solo un alquiler
                      </h4>
                      <p className="text-sm font-bold">
                        En ARPA nos ocupamos de darte la mejor experiencia a la hora de alquilar,
                        tanto si sos inquilino como si sos propietario, queremos facilitar el proceso
                        para que nadie se quede con bronca, completa transparencia en los contratos
                        gracias al poder de la blockchain y las mejores recomendaciones de precios con
                        MaLe, nuestro asesor virtual inteligente.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
//  }
/*  else {
    return (
      <section className="h-screen flex items-center justify-center">
        <p>Por favor, completa el formulario para iniciar sesión.</p>
      </section>
    );
  }*/
};
  export default LoginPage;