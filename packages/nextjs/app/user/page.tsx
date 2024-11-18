import React from 'react';
import UserProfile from './UserProfile';
import { User } from '../../types/utils';
import { NextPage } from 'next';


const UserPage: NextPage = () => {
  return (
    <><div>
      <UserProfile userId="prueba@gmail.com" />
    </div><div className="text-center mt-8 bg-secondary p-10">
        <h1 className="text-4xl my-0">Dale, ponelo en alquiler</h1>
        <p className="text-neutral">
          Podrás retirar el dinero del contrato a tu billetera conectada cuando un inquilino lo deposite.
          <br /> Con amor,{" "}
          <code className="italic bg-base-300 text-base font-bold [word-spacing:-0.5rem] px-1">
            El equipo de ARPA
          </code>{" "}
        </p>
      </div></>
  );
};

export default UserPage;
