'use client';
import type { NextPage } from "next";
import React from "react";
import { useRouter } from "next/navigation";
import {createUserWithEmailAndPassword} from 'firebase/auth';
import { auth } from "./firebase";
import { useState } from 'react';
import { useUser } from "../user/UserContext";
/*
export const metadata = getMetadata({
  title: "Register page",
  description: "Ingresa credenciales de registro.",
});


function buttonPress(){
 alert("you clicked me");
}*/

function createNewUser(email: string,password: string, setEmail: (email: string) => void): Promise<boolean> {
  return createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed up 
    const user = userCredential.user;
    console.log(user);
    setEmail(email)
    return true

  })
  .catch((error) => {
    const errorCode = error.code;
    alert(errorCode);
    return false
  });
}


const RegisterPage: NextPage = () => {
  const [userName,setUserName] = useState('');
  const [password,setPassword] = useState('');
  const { setEmail } = useUser();
  const router = useRouter();

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
                              onClick={async () => {
                                const success = await createNewUser(userName,password, setEmail);
                                if (success) router.push("/");
                              }}
                              className="mb-3 inline-block w-full rounded px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_rgba(0,0,0,0.2)] transition duration-150 ease-in-out hover:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:outline-none focus:ring-0 active:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)]"
                              type="button"
                              style={{
                                background:
                                  "linear-gradient(to right, #ee7724, #d8363a, #dd3675, #b44593)",
                              }}
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
  };

  export default RegisterPage;