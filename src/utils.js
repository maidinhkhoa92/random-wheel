import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBSJl4Nz4zC5fJ3lPZvAkAVEUCpZJshEnk",
  authDomain: "random-6248c.firebaseapp.com",
  databaseURL: "https://random-6248c-default-rtdb.firebaseio.com",
  projectId: "random-6248c",
  storageBucket: "random-6248c.appspot.com",
  messagingSenderId: "623323776548",
  appId: "1:623323776548:web:f519611231413f10df7ab1"
};
initializeApp(firebaseConfig);

export const db = getFirestore();
