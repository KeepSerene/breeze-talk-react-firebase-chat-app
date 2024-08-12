// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "breeze-talk-chat-react.firebaseapp.com",
  projectId: "breeze-talk-chat-react",
  storageBucket: "breeze-talk-chat-react.appspot.com",
  messagingSenderId: "694777913959",
  appId: "1:694777913959:web:ffd788e0c52bbd0ad8aac2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const firestoreDB = getFirestore();
export const storage = getStorage();
