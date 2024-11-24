import { getAuth } from "firebase/auth";
import { Firestore } from "firebase/firestore";
const admin = require("firebase-admin");

let firebaseApp;

function getFirebaseApp(){
    if (!firebaseApp){
        const serviceAccount = require("./serviceAccountKey.json");

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
          });

          firebaseApp = admin;
    }
    return firebaseApp;
}

function getFirebaseAuthenticator(){
    const auth = getAuth(getFirebaseApp());
    return auth;
}

function getFirestore(){
    return Firestore.getFirestore(); 
}

module.exports = { getFirebaseApp, getFirebaseAuthenticator, getFirestore };