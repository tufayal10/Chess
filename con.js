// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAI0YnHW7A-gURWdKfgG4A2USm7XgPAuOM",
  authDomain: "chess-7aa3c.firebaseapp.com",
  projectId: "chess-7aa3c",
  storageBucket: "chess-7aa3c.firebasestorage.app",
  messagingSenderId: "931547414074",
  appId: "1:931547414074:web:9c9501b3bc5818583f7f03",
  measurementId: "G-1L6MYTEP23"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
