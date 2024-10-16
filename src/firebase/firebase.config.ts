// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyD0fmfbK_h059iA1zFcPJ3rUyZz7ucIZFU",
  authDomain: "fastfirecrm.firebaseapp.com",
  projectId: "fastfirecrm",
  databaseURL: "https://fastfirecrm-default-rtdb.firebaseio.com",
  storageBucket: "fastfirecrm.appspot.com",
  messagingSenderId: "297602990290",
  appId: "1:297602990290:web:dc60a9c2786c1754f22d0b",
  measurementId: "G-XPC750D5LV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

export {
  db,
  auth,
}