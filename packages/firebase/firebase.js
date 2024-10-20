import { getAuth } from "firebase/auth";
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

module.exports = { getFirebaseApp, getFirebaseAuthenticator };