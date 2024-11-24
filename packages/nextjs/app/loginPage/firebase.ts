'use client';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  "type": "service_account",
  "project_id": "darpa-tpp",
  "projectId": "darpa-tpp",
  "private_key_id": "460f28636c8f7a477e57eaece8fc7daf25c379eb",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC4qYtEGifH/LC7\nFtSXP7L55pOGw4ZsBheHqPG8tba1STip5scuURTWRYSuLGx+cCY//TqT8lezRf0n\nDj/XQwxvdk1Nr97zgyKzfXtURTVF4mkhlrXE/kFSWw1/Bl9jW8vlwKjU21YP8RF8\nouWiesPOsCJ0fbARi1o8iOytfhCdhuhlp/w+gaZWYEyp1y8D6dpMIiv9yKvomKJI\nOgxa2rIQwmC/hayCuSkJHVGpKa/n6vRSgbXBijuIT7cLNhcHtclVqKOUowoNn5Ez\n9VHhZBJlEVSpH98q3/hLLbS8rHM96VA4zv8mK5krWaFKxmkaVCA08RkHdJMORvRR\n2lTSOu11AgMBAAECggEAAY5KzOyW0uGx+tQ4P1FQkzgaRxjk9t+y7rgsLTsEtTtO\n3b5C2wTg3ZChYQxLxQxHLjkrzKz5My/5muIiWeXH4t/cH+BFoHHwPBM9vkSFAeKP\nSzKnXmexVN3NMSRJxR8JX+qtzCP68iXFpXID6Ei2LKAhnNn66UhDdDNydwsTCG4O\nY5bq88Y3jITOlfLeLiHQdJmAz5KA08emsTAfbba0MiUgL8GPdKT4rdHiXykOGsHD\nLrrOznVEjlY1XmBueOB7jM0kAq06sA84mrtow5rDiQQLoBl1VDOB1Fot+SnAc3d/\nq2Ppn95qdpytKWNnVJptfxauv1Gc+cUvZQDC36cCAwKBgQDawpY16yI4SZ2vBLPH\niABW3r+hdD8ciqMGdGHVzicxffnQsgP3P6xEW2JXX2Y9lvUcKKOzLFMKaAmLB7W6\nTG0/GOYiTmCYK0FmlKgVnuLtbbC3b+dTcNX+0TSI9Fn2T0PnvxS6Uox3ac4M+HK0\nxkfkNLW0aaRvv1FPnbPxwwWbxwKBgQDYGP9xKS5xzdnTdkGOvOZhxuJjtklRHA6U\nj7MlZNhTSP6nSfkSR2lQfd6+JnwAlSzjwgTcXWQoRMcydwmWxh9PnHzkuufKiQHU\nGZ2tOV+fALCaEMTnX7UdyCrv+FuhYVcRrIi7JzXjiid2npBC0EH4EmKRgq2dmxMV\nqhwW/LfU4wKBgCOc2/FJJxf8vAPbAx1vgYai2pWBJCkUVLffSHITDoRbGskjwcuF\nfRjfu6G3sSBDrAF6iDPJ+nbOOwd8KNR8Tqif+A8LrWP4XrxBZR+n7w9x9PvX5tPJ\nobzK9/93sBGOE+LtU4WFnMJv4hBwfdP6F4gKIK6PKCrc/XK1nK617frPAoGAJ7x5\nBELxUmXq3xKIvYmIx4P9zx4O30ZMfA7sfzzK9o2enf5hOXY+LFno4ohLFwRXS846\nfJcDus/i3Sm8bqghy87XvGuOAdUtq+XF87twFNnYn4vj2TPlJwPOuW+u0b8Hdq2G\nOvvb0epulUZU+qQ27TncPCuOZ0PDv6EXJzbzSscCgYA6tXocoKJAySrfhIb94FzY\nFHFXfrK2b6tQeu66g7zVfnUk5U5vD56DqQvu7cvTrvFQl/Oc6WStqxqPfVAaoIvw\nHAShLQPcUD8mp4lPEKL7YH49zMS2yK65r9Lg2Vj8bh6B+7pjL3qM7eOVA9qckRcJ\nGD7yMVd9F9enjMrb//dlew==\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-tduz9@darpa-tpp.iam.gserviceaccount.com",
  "client_id": "104546899210263829145",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-tduz9%40darpa-tpp.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com",
  "apiKey" : "AIzaSyAcM9-2esYZb5wW8f501Acfnkvw6nLZJIs"
};
//const app = initializeApp(firebaseConfig);
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);


export {auth, db};