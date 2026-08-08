import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAzO8U8d48NuWAf8f-IYDsTieOxq4LCArI",
  authDomain: "irishvr-cf8de.firebaseapp.com",
  projectId: "irishvr-cf8de",
  storageBucket: "irishvr-cf8de.firebasestorage.app",
  messagingSenderId: "711838665986",
  appId: "1:711838665986:web:24c8098bae59445f65061b",
  databaseURL: "https://irishvr-cf8de-default-rtdb.europe-west1.firebasedatabase.app",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
