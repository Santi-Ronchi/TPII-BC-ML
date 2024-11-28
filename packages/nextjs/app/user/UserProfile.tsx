"use client";

import React, { useEffect, useState } from "react";
import { User, Contract } from "../../types/utils";
import { db } from "./firebase";
import { doc, getDoc, getDocs, collection, query, where, updateDoc } from "firebase/firestore";
import ContractLists from './ContractLists';
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { ArrowPathIcon } from "@heroicons/react/24/outline";


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
  const [user, setUser] = useState<User | null>(null);
  const [contracts, setContracts] = useState<Contract | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingWallets, setLoadingWallets] = useState<boolean>(true);
  const [userWallets, setUserWallets] = useState<String | null>(null);
  const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract("YourContract");

  const refreshData = async () => {
    const userData = await fetchUserData(userId);
    if (!userData) {
      setLoading(false);
      return;
    }
    setUser(userData);
    const { wallets, contracts } = await fetchWalletsAndContracts(userData.userEmail);
    setUser((prev) => (prev ? { ...prev, walletAddr: wallets } : null));
    setContracts(contracts);
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


  const handleContractChange = async (contractId: bigint, newStatus: string, amount: bigint, functionToCall: string) => {
      let doubleAmount = (BigInt(amount) + BigInt(amount));
      try {
        if (functionToCall == "acceptContract"){
          await writeYourContractAsync({
            functionName: 'acceptContract',
            args: [contractId],
            value: BigInt(doubleAmount),
          });
        }else{
          await writeYourContractAsync({
            functionName: functionToCall,
            args: [contractId],
          });
        }
        const stringId = contractId.toString();
        const contractRef = doc(db, "Contratos", stringId);
        await updateDoc(contractRef, { state: newStatus });
        console.log(`Contract ${contractId} state updated to ${newStatus}.`);
      }catch (e){
        console.error("Error accepting contract:", e);
      }

      try{
        await refreshData();
      }catch (e){
        console.error("Error reloading page:", e);
      }
  }

  if (loading) return <p>Cargando...</p>;
  if (!user) return <p>No se encontraron datos de usuario.</p>;


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
        {Array.isArray(user.walletAddr) && user.walletAddr.length > 0 ? (
          <ul className="space-y-4">
            {user.walletAddr.map((wallet, index) => (
              <li
                key={index}
                className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 p-4 rounded-md shadow-sm transition-transform transform hover:scale-105 duration-300"
              >
                <p className="text-lg text-gray-800 dark:text-gray-200">
                  <strong>Dirección:</strong> {wallet}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">No hay wallets asociadas.</p>
        )}
      </div>

      {/* Refresh Button */}
      <button
        onClick={refreshData}
        className="mb-4 top-4 right-4 bg-blue-500 hover:bg-blue-700 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-transform transform hover:scale-105"
        title="Refresh Data"
      >
        <ArrowPathIcon className="h-6 w-6" />
      </button>
      {/* Contracts Section */}
      <ContractLists contracts={contracts || []} handleContractChange={handleContractChange} />
    </div>
  );
};

export default UserProfile;