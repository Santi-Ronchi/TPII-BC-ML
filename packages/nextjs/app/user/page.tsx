import React from 'react';
import UserProfile from './UserProfile';
import { NextPage } from 'next';
import { useAccount } from "wagmi";


const UserPage: NextPage = () => {

  //const { address: connectedAddress } = useAccount();
  //const {address: connectedAddress} = useAccount();


  return (
    <>
    <div>
      <UserProfile userId="0x3aF55197db2a66cd3C48840F6F710594D8ed2e6b" />
      { /*
      <UserProfile userId="0x3aF55197db2a66cd3C48840F6F710594D8ed2e6b" />
      {connectedAddress || ""}
      <UserProfile userId="prueba@gmail.com" />
      */}
    </div>
    <div className="text-center mt-8 bg-secondary p-10">
        <h1 className="text-4xl my-0">¿Cómo retiro mi dinero?</h1>
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
