"use client";

import React, { useEffect, useState } from "react";
import { Contract, User } from "../../types/utils";
import ContractLists from "./ContractLists";
import { db } from "./firebase";
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

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

const fetchWalletsAndContracts = async (
  userEmail: string,
): Promise<{
  wallets: string[];
  contracts: Contract[];
}> => {
  let walletArray: string[] = [];
  const contractArray: Contract[] = [];

  try {
    // Fetch wallets
    const walletRef = collection(db, "Email-Wallets");
    const walletQuery = query(walletRef, where("userEmail", "==", userEmail));
    const walletSnapshot = await getDocs(walletQuery);
    walletSnapshot.forEach(doc => {
      walletArray = doc.data().walletAddr || [];
    });

    // Fetch contracts
    const contractRef = collection(db, "Contratos");
    for (const wallet of walletArray) {
      const ownerContractQuery = query(contractRef, where("ownerAddress", "==", wallet));
      const ownerContractSnapshot = await getDocs(ownerContractQuery);
      ownerContractSnapshot.forEach(doc => {
        contractArray.push({
          ...doc.data(),
          id: doc.id,
        } as unknown as Contract);
      });
      const lesseContractQuery = query(contractRef, where("lesseAddress", "==", wallet));
      const lesseContractSnapshot = await getDocs(lesseContractQuery);
      lesseContractSnapshot.forEach(doc => {
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
  const [contracts, setContracts] = useState<Contract[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingWallets, setLoadingWallets] = useState<boolean>(true);
  const [, setUserWallets] = useState<string[] | null>(null);
  const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract("YourContract");

  const refreshData = async () => {
    const userData = await fetchUserData(userId);
    if (!userData) {
      setLoading(false);
      return;
    }
    setUser(userData);
    const { wallets, contracts } = await fetchWalletsAndContracts(userData.userEmail);
    setUser(prev => (prev ? { ...prev, walletAddr: wallets } : null));
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
      setUser(prev => (prev ? { ...prev, walletAddr: wallets } : null));
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
          let walletArray: string[] = [];
          if (!user || !user.userEmail) {
            throw new Error("El usuario no está autenticado o no tiene un correo electrónico.");
          }
          try {
            const ref = collection(db, "Email-Wallets");
            const queryWallets = query(ref, where("userEmail", "==", user.userEmail));
            const walletSnapshot = await getDocs(queryWallets);
            walletSnapshot.forEach(doc => {
              walletArray = doc.data().walletAddr;
            });
            const newUserData: User = {
              userEmail: user.userEmail,
              walletAddr: walletArray,
            };
            setUser(newUserData);
          } catch (error) {
            console.log(error);
          }
          setUserWallets(walletArray);

          //Recuperacion de contratos
          const ref = collection(db, "Contratos");
          const contractArray: Contract[] = [];
          for (const aWallet of walletArray) {
            //console.log(aWallet);
            const queryContracts = query(ref, where("ownerAddress", "==", aWallet));
            const contractSnapshot = await getDocs(queryContracts);
            contractSnapshot.forEach(doc => {
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
          }
          setContracts(contractArray);
        } catch (error) {
          console.log(error);
        } finally {
          setLoadingWallets(false);
        }
      }
    };
    fetchUserContracts();
  }, [contracts, loading]);

  const handleContractChange = async (
    contractId: bigint,
    newStatus: string,
    amount: bigint,
    functionToCall:
      | "acceptContract"
      | "rejectLeaseOffer"
      | "rejectProposedChanges"
      | "acceptContractCancelationPropopsitionLessee"
      | "acceptContractCancelationPropopsitionOwner"
      | "proposeContractCancelationMutualAgreementLessee"
      | "acceptContractCancelationPropopsitionLessee"
      | "rejectContractCancelationPropopsitionLessee"
      | "proposeContractCancelationMutualAgreementOwner"
      | "rejectContractCancelationPropopsitionOwner"
      | "acceptContractCancelationPropopsitionOwner"
      | "acceptProposedChanges"
      | "cancelContractOwner"
      | "createContract"
      | "withdraw",
  ) => {
    const doubleAmount = BigInt(amount) + BigInt(amount);
    try {
      if (functionToCall == "acceptContract") {
        await writeYourContractAsync({
          functionName: "acceptContract",
          args: [contractId],
          value: BigInt(doubleAmount),
        });
      } else {
        await writeYourContractAsync({
          functionName: functionToCall,
          args: [contractId],
        });
      }
      const stringId = contractId.toString();
      const contractRef = doc(db, "Contratos", stringId);
      await updateDoc(contractRef, { state: newStatus });
    } catch (e) {
      console.error("Error accepting contract:", e);
    }

    try {
      await refreshData();
    } catch (e) {
      console.error("Error reloading page:", e);
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (!user) return <p>No se encontraron datos de usuario.</p>;

  return (
    <div
      className="p-8 shadow-xl rounded-lg max-w-7xl mx-auto min-h-screen flex flex-col items-center"
      style={{
        backgroundColor: "rgba(203, 207, 211, 0.5)",
        backgroundImage: "url(cuarto_3.jpg)",
        backgroundSize: "cover", // Ajusta el tamaño de la imagen para que cubra todo el elemento
        backgroundRepeat: "no-repeat", // Evita que la imagen se repita
        backgroundPosition: "center", // Centra la imagen
      }}
    >
      {/* User Email */}
      <div className="text-center mb-10 px-6">
        <p className="text-xl font-medium text-gray-700 md:text-4xl lg:text-4xl">
          <span className="block text-gray-500">Apreciamos su confianza</span>
          <span className="text-gray-800 font-semibold">{user.userEmail}</span>
        </p>
      </div>

      {/* Wallets Section */}
      <div
        className="mb-12 w-full bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 p-6 rounded-lg shadow-md"
        style={{ backgroundColor: "rgba(203, 207, 211, 0.5)" }}
      >
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 border-b-2 border-gray-300 dark:border-gray-700 pb-3 mb-4">
          Mis billeteras
        </h3>
        {Array.isArray(user.walletAddr) && user.walletAddr.length > 0 ? (
          <ul className="space-y-4" style={{ backgroundColor: "rgba(203, 207, 211, 0.5)" }}>
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
        className="mb-3 top-4 right-4 bg-blue-500 hover:bg-blue-700 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-transform transform hover:scale-105"
        title="Refresh Data"
        style={{ backgroundColor: "#8c376c" }}
      >
        <ArrowPathIcon className="h-6 w-6" />
      </button>
      {/* Contracts Section */}
      <ContractLists contracts={contracts || []} handleContractChange={handleContractChange} />
    </div>
  );
};

export default UserProfile;
