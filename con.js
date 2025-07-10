// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAI0YnHW7A-gURWdKfgG4A2USm7XgPAuOM",
  authDomain: "chess-7aa3c.firebaseapp.com",
  databaseURL: "https://chess-7aa3c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "chess-7aa3c",
  storageBucket: "chess-7aa3c.appspot.com",
  messagingSenderId: "931547414074",
  appId: "1:931547414074:web:9c9501b3bc5818583f7f03"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
export { database };
