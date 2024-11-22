"use client";

import React, { useEffect, useState } from "react";
import { User, Contract } from "../../types/utils";
import { db } from "./firebase";
import { doc, getDoc, getDocs, collection, query, where } from "firebase/firestore";

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
      const contractQuery = query(contractRef, where("ownerAddress", "==", wallet));
      const contractSnapshot = await getDocs(contractQuery);
      contractSnapshot.forEach((doc) => {
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
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p className="text-center">Cargando...</p>;
  if (!user) return <p className="text-center text-red-500">No se encontraron datos de usuario.</p>;

  return (
    <div className="p-8 shadow-xl rounded-lg max-w-4xl mx-auto" style={{ background: "linear-gradient(to right, #e5a073, #cc6164, #d4789b, #ae7ca3)",}}>
      {/* User Email */}
      <div className="text-center mb-10">
        <p className="text-2xl font-semibold text-white">
          Email del usuario:{" "}
          <span className="text-yellow-300">{user.userEmail}</span>
        </p>
      </div>
  
      {/* Wallets Section */}
      <div className="mb-12 bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 p-6 rounded-lg shadow-md">
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
  
      {/* Contracts Section */}
      <div className="bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 border-b-2 border-gray-300 dark:border-gray-700 pb-3 mb-4">
          Contratos
        </h3>
        {contracts.length > 0 ? (
          <ul className="space-y-4">
            {contracts.map((contract) => (
              <li key={contract.id} className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 p-4 rounded-md shadow-sm transition-transform transform hover:scale-105 duration-300">
                <strong className="block text-lg text-gray-800 dark:text-gray-200">
                  ID: {contract.id}
                </strong>
                <p className="text-gray-700 dark:text-gray-300">Estado: {contract.state}</p>
                <p className="text-gray-700 dark:text-gray-300">Monto a pagar: {contract.amount}</p>
                <p className="text-gray-700 dark:text-gray-300">
                  Duración: {contract.duration} meses
                </p>
                <p className="text-gray-700 dark:text-gray-300">Interés: {contract.interest}%</p>
                <p className="text-gray-700 dark:text-gray-300">
                  Dirección del inquilino:{" "}
                  <span className="font-semibold">{contract.lesseAddress}</span>
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">No posees contratos activos.</p>
        )}
      </div>
    </div>
  );
};

export default UserProfile;