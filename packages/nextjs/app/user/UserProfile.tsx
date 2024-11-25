"use client";

import React, { useEffect, useState } from "react";
import { User, Contract } from "../../types/utils";
import { db } from "./firebase";
import { doc, getDoc, getDocs, collection, query, where } from "firebase/firestore";
import ContractLists from './ContractLists';
import { useAccount } from "wagmi";
import Servicios from "../servicios/Servicios";

interface UserProfileProps {
  userId: string;
}

const fetchUserData = async (userId: string): Promise<User | null> => {
  try {
    const tableName = userId.includes("@") ? "Email-Wallets" : "Wallet-email";
    const userDoc = doc(db, tableName, userId);
    const userSnapshot = await getDoc(userDoc);
    return userSnapshot.exists() ? (userSnapshot.data() as User) : null;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

const fetchWalletsAndContracts = async (userEmail: string): Promise<{
  wallets: string[];
  contracts: Contract[];
}> => {
  let walletArray: string[] = [];
  let contractArray: Contract[] = [];
  
  try {
    // Fetch wallets
    const walletRef = collection(db, "Email-Wallets");
    const walletQuery = query(walletRef, where("userEmail", "==", userEmail));
    const walletSnapshot = await getDocs(walletQuery);
    walletSnapshot.forEach((doc) => {
      walletArray = doc.data().walletAddr || [];
    });

    // Fetch contracts
    const contractRef = collection(db, "Contratos");
    for (const wallet of walletArray) {
      const ownerContractQuery = query(contractRef, where("ownerAddress", "==", wallet));
      const ownerContractSnapshot = await getDocs(ownerContractQuery);
      ownerContractSnapshot.forEach((doc) => {
        contractArray.push({
          ...doc.data(),
          id: doc.id,
        } as unknown as Contract);
      });
      const lesseContractQuery = query(contractRef, where("lesseAddress", "==", wallet));
      const lesseContractSnapshot = await getDocs(lesseContractQuery);
      lesseContractSnapshot.forEach((doc) => {
        contractArray.push({
          ...doc.data(),
          id: doc.id,
        } as unknown as Contract);
      });
    }
  } catch (error) {
    console.error("Error fetching wallets or contracts:", error);
  }

  return { wallets: walletArray, contracts: contractArray };
};

const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const { address: connectedAddress } = useAccount();
  const [user, setUser] = useState<User | null>(null);
  const [contracts, setContracts] = useState<Contract | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingWallets, setLoadingWallets] = useState<boolean>(true);
  const [userWallets, setUserWallets] = useState<String | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  const handleButtonClick = (propertyId: string) => {
    setSelectedPropertyId(selectedPropertyId === propertyId ? null : propertyId);
  };
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const userData = await fetchUserData(userId);
      if (!userData) {
        setLoading(false);
        return;
      }

      setUser(userData);

      const { wallets, contracts } = await fetchWalletsAndContracts(userData.userEmail);
      setUser((prev) => (prev ? { ...prev, walletAddr: wallets } : null));
      setContracts(contracts);

      setLoading(false);
    };

    loadData();
  }, [userId]);


  useEffect(() => {
    const fetchUserContracts = async () => {
      if (loadingWallets && loading) {
        try {
          //tengo el email, tengo que extraer la totalidad de las wallets
          let walletArray = [];
          try {
            const ref = collection(db, "Email-Wallets");
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
          catch (error) {
            console.log(error);
          }
          setUserWallets(walletArray);

          //Recuperacion de contratos
          const ref = collection(db, 'Contratos');
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
        catch (error) {
          console.log(error);
        }
        finally {
          setLoadingWallets(false);
        }
      }
    };
    fetchUserContracts();
  }, [contracts, loading]);


  if (loading) return <p>Cargando...</p>;
  if (!user) return <p>No se encontraron datos de usuario.</p>;


  console.log(contracts);

  return (
    <div
      className="p-8 shadow-xl rounded-lg max-w-7xl mx-auto min-h-screen flex flex-col items-center"
      style={{
        background: "linear-gradient(to right, #e5a073, #cc6164, #d4789b, #ae7ca3)",
      }}
    >
      {/* User Email */}
      <div className="text-center mb-10">
        <p className="text-2xl font-semibold text-white">
          Email del usuario:{" "}
          <span className="text-yellow-300">{user.userEmail}</span>
        </p>
      </div>
  
      {/* Wallets Section */}
      <div className="mb-12 w-full bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 border-b-2 border-gray-300 dark:border-gray-700 pb-3 mb-4">
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
        {contracts != null ? (
        <ul style={{ padding: '0', listStyle: 'none' }}>
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
              <p style={{ margin: '5px 0' }}>Duración: {contract.duration} meses</p>
              <p style={{ margin: '5px 0' }}>Interés por falta de pago: {contract.interest}%</p>
              <p style={{ margin: '5px 0' }}>
                Dirección de quien alquila: <strong>{contract.lesseAddress}</strong>
              </p>
              <button
                onClick={() => handleButtonClick(contract.id)}
                style={{
                  padding: '8px 16px',
                  marginTop: '10px',
                  backgroundColor: '#007BFF',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {selectedPropertyId === contract.id ? 'Cerrar Servicios' : 'Ver Servicios'}
              </button>
              {selectedPropertyId === contract.id && (
                <div style={{ marginTop: '20px' }}>
                  <Servicios propiedadId={contract.id} />
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No posees contratos activos</p>
      )}
      </div>
    </div>
  );
};

export default UserProfile;