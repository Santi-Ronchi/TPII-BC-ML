'use client';
import React from 'react';
import UserProfile from './UserProfile';
import { NextPage } from 'next';
import { useUser } from './UserContext';
import UserSinConexion from './UserSinConexion';


const UserPage: NextPage = () => {
  const { email } = useUser();
  
  if (!email) return <div> <UserSinConexion></UserSinConexion></div>;

  return (
    <><div> 
      <UserProfile userId={email} />
    </div><div className="text-center mt-8 bg-secondary p-10" style={{ backgroundColor: 'rgba(203, 207, 211, 0.5)' }}>
        <h1 className="text-4xl my-0">Dale, ponelo en alquiler</h1>
        <p className="text-neutral">
          Podrás retirar el dinero del contrato a tu billetera conectada cuando un inquilino lo deposite.
          <br /> Con amor,{" "}
          <code className="italic bg-base-300 text-base font-bold [word-spacing:-0.5rem] px-1">
            El equipo de DARPA
          </code>{" "}
        </p>
      </div>
      </>
  );
};

export default UserPage;
