'use client';
import type { NextPage } from "next";
import React from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./firebase";
import { useState } from 'react';
import { getDoc, updateDoc, arrayUnion, setDoc, doc } from "firebase/firestore";
import { useUser } from "../user/UserContext";
import { useAccount } from "wagmi";
import { FirebaseError } from "firebase/app";
import './login.css'


const LoginPage: NextPage = () => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const { setEmail } = useUser();
  const { address: connectedAddress } = useAccount();
  const router = useRouter();

  function handleUsernameChange(event: React.ChangeEvent<HTMLInputElement>) {
    setUserName(event.target.value);
  }

  function handlePasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value);
  }



  async function login(email: string, password: string): Promise<void> {
    try {
      // Iniciar sesión con Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setEmail(email);

      if (!connectedAddress) {
        console.error("connectedAddress no está definido.");
        alert("No hay una wallet conectada.");
        return;
      }

      // Referencia al documento de "Email-Wallets" basado en el email
      const emailDocRef = doc(db, "Email-Wallets", email);
      const emailDocSnapshot = await getDoc(emailDocRef);

      if (emailDocSnapshot.exists()) {
        const emailData = emailDocSnapshot.data();
        const walletAddr = emailData.walletAddr || [];

        // Verificar si la wallet ya está asociada
        if (!walletAddr.includes(connectedAddress)) {
          // Agregar la wallet a la lista existente
          await updateDoc(emailDocRef, {
            walletAddr: arrayUnion(connectedAddress),
          });
          console.log(`Wallet ${connectedAddress} añadida a la cuenta de ${email}`);
        } else {
          console.log(`La wallet ${connectedAddress} ya está asociada con ${email}`);
        }
      }

      // Referencia al documento de "Wallet-email" basado en la wallet
      const walletDocRef = doc(db, "Wallet-email", connectedAddress);
      const walletDocSnapshot = await getDoc(walletDocRef);

      if (!walletDocSnapshot.exists()) {
        // Si no existe, crear un nuevo documento
        await setDoc(walletDocRef, {
          userEmail: email,
          walletAddr: connectedAddress,
        });
        console.log(`Documento creado para la wallet ${connectedAddress} con el email ${email}`);
      } else {
        console.log(`El documento para la wallet ${connectedAddress} ya existe.`);
      }

      alert("Login exitoso");
      router.push("./")
    } catch (error) {
      console.error("Error en el login:", error);

      if (error instanceof FirebaseError) {
        alert(`Error de Firebase: ${error.message}`);
      } else if (error instanceof Error) {
        alert(`Error: ${error.message}`);
      } else {
        alert("Error desconocido durante el login.");
      }
    }
  }


  //  if (userName != '' && password != ''){
  return (
    <section className="" style={{ backgroundColor: 'rgba(203, 207, 211, 0.5)' }}>
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
                      {/* <!--Username input--> */}
                      <input
                        type="text"
                        className="mb-4 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ingrese su email" value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                      />

                      <br />

                      {/* <!--Password input--> */}
                      <input
                        type="password"
                        className="mb-4 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ingrese su contraseña" value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      ></input>

                      {/* <!--Submit button--> */}
                      <div className="mb-12 pb-1 pt-1 text-center">
                        <button
                          onClick={async () => {
                            login(userName, password);
                          }}
                          className="mb-3 inline-block w-full rounded px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_rgba(0,0,0,0.2)] transition duration-150 ease-in-out hover:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:outline-none focus:ring-0 active:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)]"
                          type="button"
                          style={{ backgroundColor: '#8c376c' }}
                          disabled={!userName || !password}
                        >
                          Log in
                        </button>

                        <button
                          onClick={() => router.push("/walletAuth")}
                          className="mb-3 inline-block w-full rounded px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_rgba(0,0,0,0.2)] transition duration-150 ease-in-out hover:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:outline-none focus:ring-0 active:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)]"
                          type="button"
                          style={{ backgroundColor: '#8c376c' }}
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
                          className="mb-3 inline-block w-full rounded px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_rgba(0,0,0,0.2)] transition duration-150 ease-in-out hover:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:outline-none focus:ring-0 active:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)]"
                          style={{ backgroundColor: '#8c376c' }}
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
                >
                  <video
                    autoPlay
                    muted
                    loop
                    className="w-full max-h-[800px] object-cover rounded-b-lg lg:rounded-r-lg lg:rounded-bl-none"
                  >
                    <source src="./video1.mp4" type="video/mp4" />
                    Tu navegador no soporta el elemento de video.
                  </video>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="text-sm font-bold">
      </p>
    </section>
  );
};
export default LoginPage;
