"use client";

import React, { useEffect, useState } from 'react';
import { User } from '../../types/utils';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

interface UserProfileProps {
  userId: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = doc(db, "Email-Wallets", userId);
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {
          console.log("Datos del usuario:", userSnapshot.data());
          setUser(userSnapshot.data() as User);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (loading) return <p>Cargando...</p>;
  if (!user) return <p>No se encontraron datos de usuario.</p>;

  return (
    <div className="px-6 pt-10 pb-8 shadow-xl sm:my-auto bg-secondary sm:mx-auto sm:max-w-11/12 md:w-9/12 sm:w-11/12 sm:rounded-lg sm:px-10"
    >
      <h2 style={{ fontSize: '24px', color: '#333', marginBottom: '10px' }}>
         {/*user.name  (PORIAMOS POR EJEMPLO PONER EL NOMBRE DEL USUARIO. AGREGAR EN UTILS Y FIREBASE)*/} 
      </h2>
      <p style={{ fontSize: '16px', color: '#555', marginBottom: '20px' }}>
        Email del usuario: <span style={{ color: '#0073e6' }}>{user.userEmail}</span>
      </p>

      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '20px', color: '#333', borderBottom: '2px solid #ddd', paddingBottom: '5px' }}>
          Wallets
        </h3>
        
        {user.walletAddr.length > 0 ? (
          <ul style={{ padding: '0', listStyle: 'none' }}>
            {user.walletAddr.map((wallet, index) => (
              <li
                key={index}
                style={{
                  backgroundColor: '#fff',
                  padding: '10px',
                  margin: '10px 0',
                  borderRadius: '4px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                  color: '#333',
                }}
              >
                {JSON.stringify(wallet)}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: '#999' }}>No hay wallets asociadas.</p>
        )}
        
      </div>

      <div>
        <h3 style={{ fontSize: '20px', color: '#333', borderBottom: '2px solid #ddd', paddingBottom: '5px' }}>
          Contratos
        </h3>
        {/*
        {user.contracts.length > 0 ? (
          <ul style={{ padding: '0', listStyle: 'none' }}>
            {user.contracts.map((contract) => (
              <li
                key={contract.id}
                style={{
                  backgroundColor: '#fff',
                  padding: '10px',
                  margin: '10px 0',
                  borderRadius: '4px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                  color: '#333',
                }}
              >
                <strong>{contract.name}</strong>
                <p style={{ margin: '5px 0' }}>Estado: {contract.status}</p>
                <p style={{ margin: '0' }}>Creado en: {contract.createdAt}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: '#999' }}>No hay contratos disponibles.</p>
        )}
          */}
      </div>
    </div>
  );
};

export default UserProfile;