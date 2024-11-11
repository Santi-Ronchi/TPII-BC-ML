'use client';
import { useSignMessage } from 'wagmi'
import { useAccount } from "wagmi";
import { auth } from "../loginPage/firebase";
import { signInWithCustomToken } from "firebase/auth";



async function requestLogin(walletAddr: string, signatureMessage: String){
    //const { address: connectedAddress } = useAccount();
    //const { data: signMessageData, error, isLoading, signMessage, variables } = useSignMessage();
    //const signatureMessage = signMessage({message: 'Darpa login secret'});
    event?.preventDefault();
    const url = "https://darpabackofficeservice.onrender.com/login/walletLogin";
    const body = JSON.stringify({signedMsg: signatureMessage, walletAddr: walletAddr, msg:'Darpa login secret'});
    try{
        const response = await fetch(url,{
          method:'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            },
            body:body
        });
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }
        const data = await response.json(); 
        const token = data.token; 
        console.log("Token received:", token);
        signInWithCustomToken(auth,token).then((userCredential) => {
          // Signed in
          const user = userCredential.user;
          console.log("signed in");
          // ...
        }).catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log("error de login");
          // ...
        });

    }
    catch(error){
      console.log("error.message");
    }
}

export default requestLogin;