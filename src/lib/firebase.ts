import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyD9sBdcgi4mmeQ5owgQha-dGHH3-HT5AgQ",
  authDomain: "manuara-delivery.firebaseapp.com",
  projectId: "manuara-delivery",
  storageBucket: "manuara-delivery.firebasestorage.app",
  messagingSenderId: "13294198759",
  appId: "1:13294198759:web:e3f105826f74f4f4e82742"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
