'use client';
import React from 'react';
import UserProfile from './UserProfile';
import { NextPage } from 'next';
import { UserProvider, useUser } from './UserContext';


const UserPage: NextPage = () => {
  const { email } = useUser();
  
  if (!email) return <p>Debe iniciar sesion para ver la informacion de usuario.</p>;

  return (
    <><div> 
      <UserProfile userId={email} />
    </div><div className="text-center mt-8 bg-secondary p-10" style={{ backgroundColor: 'rgba(203, 207, 211, 0.5)' }}>
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
};

export default UserPage;
