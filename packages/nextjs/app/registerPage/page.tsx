'use client';
import type { NextPage } from "next";
import React from "react";
import { useRouter } from "next/navigation";
import {createUserWithEmailAndPassword} from 'firebase/auth';
import { FirebaseError } from "firebase/app";
import { auth } from "./firebase";
import { useState } from 'react';
import { useUser } from "../user/UserContext";
import { db } from "./firebase";
import { setDoc, doc } from "firebase/firestore";
import { useAccount } from "wagmi";
/*
export const metadata = getMetadata({
  title: "Register page",
  description: "Ingresa credenciales de registro.",
});


function buttonPress(){
 alert("you clicked me");
}*/



const RegisterPage: NextPage = () => {
  const [userName,setUserName] = useState('');
  const [password,setPassword] = useState('');
  const { setEmail } = useUser();
  const router = useRouter();
  const { address: connectedAddress } = useAccount();

  async function createNewUser(email: string,password: string, setEmail: (email: string) => void): Promise<boolean> {
    try {
      setEmail(email)
      // Crear el usuario
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      console.log("Usuario creado: ", user);
  
      // Validar que connectedAddress no sea undefined
      if (!connectedAddress) {
        console.error("connectedAddress no está definido.");
        return false;
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
  
      // Si todo fue exitoso
      return true;
    } catch (error) {
      if (error instanceof FirebaseError) {
        console.error("Error de Firebase: ", error.message);
      } else if (error instanceof Error) {
        console.error("Error general: ", error.message);
      } else {
        console.error("Error desconocido: ", error);
      }
  
      return false;
    }
  }

  

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
                        <p className="mb-4">Crea tu cuenta:</p>
                        {/* <!--Username input--> */}
                        <input
                          type="text"
                          className="mb-4 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ingrese su email"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)} 
                        ></input>

                        <br />

                        {/* <!--Password input--> */}
                        <input
                          type="password"
                          className="mb-4 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={password}
                          placeholder="Ingrese su contraseña"
                          onChange={(e) => setPassword(e.target.value)} 
                        ></input>
  
                        {/* <!--Submit button--> */}
                        <div className="mb-12 pb-1 pt-1 text-center">
                            <button 
                              onClick={async () => {
                                const success = await createNewUser(userName,password, setEmail);
                                if (success) router.push("/");
                              }}
                              className="mb-3 inline-block w-full rounded px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_rgba(0,0,0,0.2)] transition duration-150 ease-in-out hover:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:outline-none focus:ring-0 active:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)]"
                              type="button"
                              style={{ backgroundColor: '#8c376c' }}    
                              disabled={!userName || !password}
                            >
                              Registrarse
                            </button>
                        </div>
                      </form>
                    </div>
                  </div>
  
                  {/* <!-- Right column container with background and description--> */}
                  <div
                  className="flex items-center rounded-b-lg lg:w-6/12 lg:rounded-r-lg lg:rounded-bl-none"
                  style={{
                    backgroundImage: 'url(./llaves.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }}  
                >
                  <div className="px-4 py-6 text-white md:mx-6 md:p-12" style={{ marginTop: '-300px', marginLeft: '100px', position: 'absolute', backgroundColor: 'rgba(203, 207, 211, 0.5)', borderRadius: '10px' }}>
                    <h4 className="mb-6 font-semibold" style={{ fontSize: '30px', color: '#8c376c' }}>
                      ¡Bienvenido! 
                      <br/>
                      <br/>
                      Nos sentimos muy felices de sumarte a la familia DARPA
                    </h4>
                  </div>
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  export default RegisterPage;