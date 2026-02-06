import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; 

const firebaseConfig = {

  apiKey: "AIzaSyAKXdCXjaJHfh2Xc83bukhuthJwdb4EWcM",
  authDomain: "e-commerce-5e072.firebaseapp.com",
  projectId: "e-commerce-5e072",
  storageBucket: "e-commerce-5e072.firebasestorage.app",
  messagingSenderId: "579595225271",
  appId: "1:579595225271:web:a01076c0002f2de7a96532",
  measurementId: "G-4GC4BKRTJK"

};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);