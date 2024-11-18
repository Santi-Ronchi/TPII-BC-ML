'use client';
import type { NextPage } from "next";
import Image from "next/image";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";
import React from "react";
import { useState } from 'react';
import { set } from "nprogress";
import { useSignMessage } from 'wagmi'
import { useAccount } from "wagmi";
import { auth, db } from "../loginPage/firebase";
import { signInWithCustomToken } from "firebase/auth";
import { addDoc, collection, setDoc, doc, query, where, getDocs, getCountFromServer } from "firebase/firestore";

const WalletAuth: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { data: signMessageData, error, isLoading, signMessage, variables } = useSignMessage()
  const [userName,setUserName] = useState('');
  const [emailSet, setEmailInput] = useState(true);
  const [isChecked, setIsChecked] = useState(false);

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

  async function addEmailToDatabase(){
    if (auth.currentUser){
      //console.log(auth.currentUser);
      console.log("Estoy logeado actualmente");
      try {
        const docRef = doc(db,"Wallet-email",localStorage.getItem('DarpaConnectedWallet'));
        await setDoc(docRef, {
          userEmail: userName,
          walletAddr: localStorage.getItem('DarpaConnectedWallet'),
        });
        console.log("Document added with ID: ", localStorage.getItem('DarpaConnectedWallet'));
      } catch (e) {
        console.error("Error adding document: ", e);
      }
      try{
        const docRef = doc(db,"Email-Wallets",userName);
        await setDoc(docRef, {
          userEmail: userName,
          walletAddr: [localStorage.getItem('DarpaConnectedWallet')],
        });
        console.log("Document added to Email-Wallets with ID: ", userName);
      } catch(e){
        console.error("Error adding document: ", e);
      }
    }
  }

  if(emailSet){
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
                          <Image
                            className="mx-auto w-48 rounded-lg"
                            src="./logo-arpa.png"
                            alt="logo" />
                          <h4 className="mb-12 mt-1 pb-1 text-xl font-semibold">
                            Un hogar con tu identidad.
                          </h4>
                        </div>

                          <p className="mb-4">Ingresá con tu wallet:</p>

                          <button
                            type="button"
                            className="inline-block rounded border-2 border-danger px-6 pb-[6px] pt-2 text-xs font-medium uppercase leading-normal text-danger transition duration-150 ease-in-out hover:border-danger-600 hover:bg-neutral-500 hover:bg-opacity-10 hover:text-danger-600 focus:border-danger-600 focus:text-danger-600 focus:outline-none focus:ring-0 active:border-danger-700 active:text-danger-700 dark:hover:bg-neutral-100 dark:hover:bg-opacity-10 mb-4 w-1/2"
                            onClick={() => {signMessage({ message: 'hello world' }); setIsChecked((prev) => !prev);}}
                            style={{background:"linear-gradient(to right, #ee7724, #d8363a, #dd3675, #b44593)",}}>
                            Sign auth message
                          </button>
                          
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => setIsChecked(e.target.checked)}
                            className="w-5 h-5 cursor-not-allowed rounded-md border-gray-300 accent-green-500 ml-4"
                            disabled
                          />
                          <br />
                          <button
                            type="button"
                            className="mb-3 inline-block w-full rounded px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_rgba(0,0,0,0.2)] transition duration-150 ease-in-out hover:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:outline-none focus:ring-0 active:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)]"
                            onClick={() => {
                              requestLogin(signMessageData.toString(), connectedAddress.toString(), 'hello world');
                            } }
                            style={{background:"linear-gradient(to right, #ee7724, #d8363a, #dd3675, #b44593)",}}>
                            Wallet login
                          </button>
                          <br />
                      </div>
                    </div>

                    {/* <!-- Right column container with background and description--> */}
                    <div
                      className="flex items-center rounded-b-lg lg:w-6/12 lg:rounded-r-lg lg:rounded-bl-none"
                      style={{
                        background: "linear-gradient(to right, #ee7724, #d8363a, #dd3675, #b44593)",
                      }}
                    >
                      <div className="px-4 py-6 text-white md:mx-6 md:p-12">
                        <div className="text-center">
                          <Image src="./ARPA-LOGIN-noback.png" alt="logo" />
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
)}//version wallet sin mail asociado 
  else{
    return (

      <section className="">
        {/*<div>
        <div>
          <button onClick={() => signMessage({ message: 'hello world' })}>
            Sign message
          </button>
        </div>
        <button
          onClick={() => {
            requestLogin(signMessageData.toString(), connectedAddress.toString(), 'hello world');
          } }>
          Wallet login
        </button>
        <div>
          Necesitamos que nos proveas de una dirección de mail para poder hacer uso de nuestra app
          <div><label>Mail de usuario: </label></div>

          <input type="text" id="fname" name="fname" value={userName} placeholder="unmail@mail.com" onChange={handleUsernameChange}></input>
          <div></div>
          <button onClick={() => addEmailToDatabase()}>
            Vincular mail
          </button>
        </div>

      </div>*/}
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
                          <Image
                            className="mx-auto w-48 rounded-lg"
                            src="./logo-arpa.png"
                            alt="logo" />
                          <h4 className="mb-12 mt-1 pb-1 text-xl font-semibold">
                            Un hogar con tu identidad.
                          </h4>
                        </div>

                        <p className="mb-4">Ingresá con tu wallet:</p>

                        <button
                          type="button"
                          className="inline-block rounded border-2 border-danger px-6 pb-[6px] pt-2 text-xs font-medium uppercase leading-normal text-danger transition duration-150 ease-in-out hover:border-danger-600 hover:bg-neutral-500 hover:bg-opacity-10 hover:text-danger-600 focus:border-danger-600 focus:text-danger-600 focus:outline-none focus:ring-0 active:border-danger-700 active:text-danger-700 dark:hover:bg-neutral-100 dark:hover:bg-opacity-10 mb-4 w-1/2"
                          onClick={() => { signMessage({ message: 'hello world' }); setIsChecked((prev) => !prev); } }
                          style={{ background: "linear-gradient(to right, #ee7724, #d8363a, #dd3675, #b44593)", }}>
                          Sign auth message
                        </button>

                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => setIsChecked(e.target.checked)}
                          className="w-5 h-5 cursor-not-allowed rounded-md border-gray-300 accent-green-500 ml-4"
                          disabled />
                        <br />
                        <button
                          type="button"
                          className="mb-3 inline-block w-full rounded px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_rgba(0,0,0,0.2)] transition duration-150 ease-in-out hover:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:outline-none focus:ring-0 active:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)]"
                          onClick={() => {
                            requestLogin(signMessageData.toString(), connectedAddress.toString(), 'hello world');
                          } }
                          style={{ background: "linear-gradient(to right, #ee7724, #d8363a, #dd3675, #b44593)", }}>
                          Wallet login
                        </button>
                        <br />

                        <div>
                        Necesitamos que nos proveas de una dirección de mail para poder hacer uso de nuestra app
                        <div><label>Mail de usuario: </label></div>

                        <input type="text" id="fname" name="fname" value={userName} placeholder="unmail@mail.com" onChange={handleUsernameChange}></input>
                        <div></div>
                        <button onClick={() => addEmailToDatabase()}>
                          Vincular mail
                        </button>
                      </div>

                      </div>
                    </div>

                    {/* <!-- Right column container with background and description--> */}
                    <div
                      className="flex items-center rounded-b-lg lg:w-6/12 lg:rounded-r-lg lg:rounded-bl-none"
                      style={{
                        background: "linear-gradient(to right, #ee7724, #d8363a, #dd3675, #b44593)",
                      }}
                    >
                      <div className="px-4 py-6 text-white md:mx-6 md:p-12">
                        <div className="text-center">
                          <Image src="./ARPA-LOGIN-noback.png" alt="logo" />
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


    )
  }


    
  

    
}

export default WalletAuth;