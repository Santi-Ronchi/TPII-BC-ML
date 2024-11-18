"use client";

import React, { useEffect, useState } from 'react';
import { User, Contract } from '../../types/utils';
import { db } from './firebase';
import { doc, getDoc , getDocs, collection, query, where} from 'firebase/firestore';

interface UserProfileProps {
  userId: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const [user, setUser] = useState<User | null>(null);
  const [contracts, setContracts] = useState<Contract | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingWallets, setLoadingWallets] =  useState<boolean>(true);
  const [userWallets, setUserWallets] = useState<String | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const tableName = userId.includes("@") ? "Email-Wallets" : "Wallet-email";
        const userDoc = doc(db, tableName, userId);
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


  useEffect(() => {
    const fetchUserContracts = async () => {
	  if(loadingWallets && !loading){
      try{
		//tengo el email, tengo que extraer la totalidad de las wallets
		let walletArray = [];
		try{
			const ref = collection(db,"Email-Wallets");
			const queryWallets = query(ref, where("userEmail", "==", user.userEmail));
			const walletSnapshot = await getDocs(queryWallets); 
			walletSnapshot.forEach((doc) => {
				walletArray = doc.data().walletAddr;
			});
			const newUserData: User = {
				userEmail: user.userEmail,
				walletAddr: walletArray
			};
			setUser(newUserData);
		}
		catch(error){
			console.log(error);
		}
		setUserWallets(walletArray);
		
		//Recuperacion de contratos
        const ref = collection(db,'Contratos');		
		let contractArray = [];
		for (const aWallet of walletArray) { 
		  //console.log(aWallet);
          const queryContracts = query(ref, where("ownerAddress", "==", aWallet));
          const contractSnapshot = await getDocs(queryContracts); 
          contractSnapshot.forEach((doc) => {
            const contractData: Contract = {
				amount: doc.data().amount ?? "",
				daysToPay: doc.data().daysToPay ?? "",
				duration: doc.data().duration ?? "",
				interest: doc.data().interest ?? "",
				lesseAddress: doc.data().lesseAddress ?? "",
				ownerAddress: doc.data().ownerAddress ?? "",
				state: doc.data().state ?? "",
				id: doc.id ?? "",
			};
			contractArray.push(contractData);
         });
		};
		setContracts(contractArray);
      }
      catch(error){
        console.log(error);
      }
      finally{
        setLoadingWallets(false);
      }
    }};
    fetchUserContracts();
  }, [contracts,loading]);


  if (loading) return <p>Cargando...</p>;
  if (!user) return <p>No se encontraron datos de usuario.</p>;


  return (
    <div className="px-6 pt-10 pb-8 shadow-xl sm:my-auto bg-secondary sm:mx-auto sm:max-w-11/12 md:w-9/12 sm:w-11/12 sm:rounded-lg sm:px-10"
    >
      <p style={{ fontSize: '16px', color: '#555', marginBottom: '20px' }}>
        Email del usuario: <span style={{ color: '#0073e6' }}>{user.userEmail}</span>
      </p>

      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '20px', color: '#333', borderBottom: '2px solid #ddd', paddingBottom: '5px' }}>
          Wallets
        </h3>
        
        {Array.isArray(user.walletAddr) ? (
          user.walletAddr.length > 0 ? (
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
                  Dirección: {wallet}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#999' }}>No hay wallets asociadas.</p>
          )
        ) : user.walletAddr ? (
          <p
            style={{
              backgroundColor: '#fff',
              padding: '10px',
              margin: '10px 0',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              color: '#333',
            }}
          >
            Dirección: {user.walletAddr}
          </p>
        ) : (
          <p style={{ color: '#999' }}>No hay wallets asociadas.</p>
        )}

        
      </div>

      <div>
        <h3 style={{ fontSize: '20px', color: '#333', borderBottom: '2px solid #ddd', paddingBottom: '5px' }}>
          Contratos
        </h3>
		{
		contracts != null
      ? <ul style={{ padding: '0', listStyle: 'none' }}>
		  {contracts.map((contract) => (
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
			  <strong>ID: {contract.id}</strong>
			  <p style={{ margin: '5px 0' }}>Estado: {contract.state}</p>
			  <p style={{ margin: '5px 0' }}>Monto a pagar: {contract.amount}</p>
			  <p style={{ margin: '5px 0' }}>Duration: {contract.duration} meses</p>
			  <p style={{ margin: '5px 0' }}>Interes por falta de pago: {contract.interest}%</p>
			  <p style={{ margin: '5px 0' }}>Dirección de quien alquila:   
			  <strong>{contract.lesseAddress}</strong></p>
			</li>
		  ))}
	  </ul>
      : <p>No posees contratos activos</p>
		}

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