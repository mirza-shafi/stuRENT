import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAwsLffajjpkvYgzA_vNC45ZAoJrJhR0hM",
  authDomain: "sturent-17f09.firebaseapp.com",
  projectId: "sturent-17f09",
  storageBucket: "sturent-17f09.firebasestorage.app",
  messagingSenderId: "161094591261",
  appId: "1:161094591261:web:a77cae407c1ac081d5b7f4",
  measurementId: "G-ENY9YRTTGC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth and Google Provider
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
