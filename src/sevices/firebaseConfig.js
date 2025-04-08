import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
  



const firebaseConfig = {
  apiKey: "AIzaSyCxVK8vcF54JYtylORQeps_Sym9OWGeqpA",
  authDomain: "calculadora-agricultor-react.firebaseapp.com",
  projectId: "calculadora-agricultor-react",
  storageBucket: "calculadora-agricultor-react.firebasestorage.app",
  messagingSenderId: "893159723013",
  appId: "1:893159723013:web:09229e9450af16afc58c6c",
  measurementId: "G-0Z4Q22VB2R"
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
