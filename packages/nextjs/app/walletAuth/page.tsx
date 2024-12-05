"use client";

import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../loginPage/firebase";
import { useUser } from "../user/UserContext";
import { signInWithCustomToken } from "firebase/auth";
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import type { NextPage } from "next";
import { useSignMessage } from "wagmi";
import { useAccount } from "wagmi";

const WalletAuth: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { data: signMessageData, signMessage } = useSignMessage();
  const [userName, setUserName] = useState("");
  const [emailSet, setEmailInput] = useState(true);
  const [isChecked, setIsChecked] = useState(false);
  const router = useRouter();
  const { setEmail } = useUser();

  async function requestLogin(signedMsg: string, walletAddr: string, msg: string) {
    const url = "https://darpabackofficeservice.onrender.com/login/walletLogin";
    const body = JSON.stringify({ signedMsg: signedMsg, walletAddr: walletAddr, msg: msg });
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: body,
      });
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const data = await response.json();
      const token = data.token;
      signInWithCustomToken(auth, token)
        .then(userCredential => {
          // Signed in
          const user = userCredential.user;
          localStorage.setItem("DarpaToken", token);
          localStorage.setItem("DarpaConnectedWallet", walletAddr);
          alert("Signed in");
          console.log("signed in as:", user);
        })
        .catch(error => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log("error de autenticacion codigo:", errorCode, "mensaje de error:", errorMessage);
        });
      //Tras conectarse, revisar que el mail este en la base de datos
      const ref = collection(db, "Wallet-email");
      const q = query(ref, where("walletAddr", "==", localStorage.getItem("DarpaConnectedWallet")));
      const queryResult = await getDocs(q);
      if (queryResult.empty) {
        setEmailInput(false);
        console.log("La wallet no tiene mail asociado");
      } else {
        const email = queryResult.docs[0].data().userEmail;
        setEmail(email);
        console.log("La wallet tiene mail asociado:", email);
        router.push("/");
      }
    } catch (error) {
      console.log("error.message");
    }
  }

  async function addEmailToDatabase() {
    if (auth.currentUser) {
      //console.log(auth.currentUser);
      console.log("Estoy logeado actualmente");
      const walletAddr = localStorage.getItem("DarpaConnectedWallet");
      if (!walletAddr) {
        throw new Error("No wallet address found in localStorage");
      }
      try {
        if (walletAddr) {
          const docRef = doc(db, "Wallet-email", walletAddr);
          await setDoc(docRef, {
            userEmail: userName,
            walletAddr,
          });
          console.log("Document added with ID: ", walletAddr);
        } else {
          console.error("No wallet address found in localStorage");
          alert("No connected wallet address found in localStorage");
        }
      } catch (e) {
        console.error("Error adding document: ", e);
      }
      try {
        const docRef = doc(db, "Email-Wallets", userName);
        await setDoc(docRef, {
          userEmail: userName,
          walletAddr: [localStorage.getItem("DarpaConnectedWallet")],
        });
        console.log("Document added to Email-Wallets with ID: ", userName);
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    }
  }

  if (emailSet) {
    return (
      <section className="">
        <div className="h-full p-10">
          <div className="g-6 flex h-full flex-wrap items-center justify-center text-neutral-800 dark:text-neutral-200">
            <div className="w-full">
              <div className="block rounded-lg bg-white shadow-lg dark:bg-neutral-800">
                <div className="g-0 lg:flex lg:flex-wrap">
                  {/* <!-- Left column container--> */}
                  <div className="px-4 md:px-0 lg:w-6/12">
                    <div className="md:mx-6 md:p-12">
                      {/* <!--Logo--> */}
                      <div className="text-center">
                        <img className="mx-auto w-48 rounded-lg" src="./logo-arpa.png" alt="logo" />
                        <h4 className="mb-12 mt-1 pb-1 text-xl font-semibold">Un hogar con tu identidad.</h4>
                      </div>

                      <p className="mb-4">¡Podes ingresar directamente con tu wallet!</p>
                      <br />
                      <br />
                      <button
                        type="button"
                        className="inline-block rounded border-2 border-danger px-6 pb-[6px] pt-2 text-xs font-medium uppercase leading-normal text-danger transition duration-150 ease-in-out hover:border-danger-600 hover:bg-neutral-500 hover:bg-opacity-10 hover:text-danger-600 focus:border-danger-600 focus:text-danger-600 focus:outline-none focus:ring-0 active:border-danger-700 active:text-danger-700 dark:hover:bg-neutral-100 dark:hover:bg-opacity-10 mb-4 w-1/2 text-white shadow-[0_4px_9px_-4px_rgba(0,0,0,0.2)] transition duration-150 ease-in-out hover:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:outline-none focus:ring-0 active:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)]"
                        onClick={() => {
                          signMessage({ message: "hello world" });
                          setIsChecked(prev => !prev);
                        }}
                        style={{ backgroundColor: "#8c376c" }}
                      >
                        Sign auth message
                      </button>

                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={e => setIsChecked(e.target.checked)}
                        className="w-5 h-5 cursor-not-allowed rounded-md border-gray-300 accent-green-500 ml-4"
                        disabled
                      />
                      <br />
                      <button
                        type="button"
                        className="mb-3 inline-block w-full rounded px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_rgba(0,0,0,0.2)] transition duration-150 ease-in-out hover:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:outline-none focus:ring-0 active:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)]"
                        onClick={() => {
                          const messageData = signMessageData ?? "defaultMessageData";
                          const address = connectedAddress ?? "0x0000000000000000000000000000000000000000";
                          requestLogin(messageData.toString(), address.toString(), "hello world");
                        }}
                        style={{ backgroundColor: "#8c376c" }}
                      >
                        Wallet login
                      </button>
                      <br />
                    </div>
                  </div>

                  {/* <!-- Right column container with video background--> */}
                  <div className="flex items-center rounded-b-lg lg:w-6/12 lg:rounded-r-lg lg:rounded-bl-none">
                    <video
                      autoPlay
                      muted
                      loop
                      className="w-full h-full object-cover rounded-b-lg lg:rounded-r-lg lg:rounded-bl-none"
                    >
                      <source src="./wallet_login.mp4" type="video/mp4" />
                      Tu navegador no soporta el elemento de video.
                    </video>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  } else {
    return (
      <section className="">
        <div className="h-full p-10">
          <div className="g-6 flex h-full flex-wrap items-center justify-center text-neutral-800 dark:text-neutral-200">
            <div className="w-full">
              <div className="block rounded-lg bg-white shadow-lg dark:bg-neutral-800">
                <div className="g-0 lg:flex lg:flex-wrap">
                  {/* <!-- Left column container--> */}
                  <div className="px-4 md:px-0 lg:w-6/12">
                    <div className="md:mx-6 md:p-12">
                      {/* <!--Logo--> */}
                      <div className="text-center">
                        <img className="mx-auto w-48 rounded-lg" src="./logo-arpa.png" alt="logo" />
                        <h4 className="mb-12 mt-1 pb-1 text-xl font-semibold">Un hogar con tu identidad.</h4>
                      </div>

                      <p className="mb-4">¡Podes ingresar directamente con tu wallet!</p>
                      <br />
                      <br />
                      <button
                        type="button"
                        className="inline-block rounded border-2 border-danger px-6 pb-[6px] pt-2 text-xs font-medium uppercase leading-normal text-danger transition duration-150 ease-in-out hover:border-danger-600 hover:bg-neutral-500 hover:bg-opacity-10 hover:text-danger-600 focus:border-danger-600 focus:text-danger-600 focus:outline-none focus:ring-0 active:border-danger-700 active:text-danger-700 dark:hover:bg-neutral-100 dark:hover:bg-opacity-10 mb-4 w-1/2 text-white shadow-[0_4px_9px_-4px_rgba(0,0,0,0.2)] transition duration-150 ease-in-out hover:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:outline-none focus:ring-0 active:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)]"
                        onClick={() => {
                          signMessage({ message: "hello world" });
                          setIsChecked(prev => !prev);
                        }}
                        style={{ backgroundColor: "#8c376c" }}
                      >
                        Sign auth message
                      </button>

                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={e => setIsChecked(e.target.checked)}
                        className="w-5 h-5 cursor-not-allowed rounded-md border-gray-300 accent-green-500 ml-4"
                        disabled
                      />
                      <br />
                      <button
                        type="button"
                        className="mb-3 inline-block w-full rounded px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_rgba(0,0,0,0.2)] transition duration-150 ease-in-out hover:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:outline-none focus:ring-0 active:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)]"
                        onClick={() => {
                          const messageData = signMessageData ?? "defaultMessageData";
                          const address = connectedAddress ?? "0x0000000000000000000000000000000000000000";
                          requestLogin(messageData.toString(), address.toString(), "hello world");
                        }}
                        style={{ backgroundColor: "#8c376c" }}
                      >
                        Wallet login
                      </button>
                      <br />

                      <div>
                        Necesitamos que nos proveas de una dirección de mail para poder hacer uso de nuestra app
                        <form>
                          {/* <!--Username input--> */}
                          <input
                            type="text"
                            className="mb-4 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ingrese su email"
                            value={userName}
                            onChange={e => setUserName(e.target.value)}
                          ></input>

                          <br />
                          {/* <!--Submit button--> */}
                          <div className="mb-12 pb-1 pt-1 text-center">
                            <button
                              onClick={async () => {
                                addEmailToDatabase();
                                setEmail(userName);
                                router.push("/");
                              }}
                              className="mb-3 inline-block w-full rounded px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_rgba(0,0,0,0.2)] transition duration-150 ease-in-out hover:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:outline-none focus:ring-0 active:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)]"
                              type="button"
                              style={{ backgroundColor: "#8c376c" }}
                            >
                              Vincular mail
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>

                  {/* <!-- Right column container with video background--> */}
                  <div className="flex items-center rounded-b-lg lg:w-6/12 lg:rounded-r-lg lg:rounded-bl-none">
                    <video
                      autoPlay
                      muted
                      loop
                      className="w-full h-full object-cover rounded-b-lg lg:rounded-r-lg lg:rounded-bl-none"
                    >
                      <source src="./wallet_login.mp4" type="video/mp4" />
                      Tu navegador no soporta el elemento de video.
                    </video>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
};

export default WalletAuth;
