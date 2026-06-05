import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { environment } from "../environments/environment";

// CashFlow Web App's Firebase configuration
const firebaseConfig = environment.firebase;

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
const googleAuthProvider = new GoogleAuthProvider();

export { firebaseApp, firebaseAuth, googleAuthProvider };
