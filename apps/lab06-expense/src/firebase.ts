import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ใส่ config ของคุณ
const firebaseConfig = {
  apiKey: "AIzaSyArM9f89C7MKJQ0oFPF8MVG3V4Lxr_9W3E",
  authDomain: "mobile-phone-2026.firebaseapp.com",
  projectId: "mobile-phone-2026",
  storageBucket: "mobile-phone-2026.appspot.com",
  messagingSenderId: "290430866778",
  appId: "1:290430866778:web:0c4256ce804147196f0f63",
};

// initialize app
const app = initializeApp(firebaseConfig);

// export firestore instance
export const db = getFirestore(app);
