// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB89gsZyXXW2gBnUzOhBR887dEZCfgOS20",
  authDomain: "uruziga-dbd28.firebaseapp.com",
  projectId: "uruziga-dbd28",
  storageBucket: "uruziga-dbd28.firebasestorage.app",
  messagingSenderId: "317175637322",
  appId: "1:317175637322:web:22fac4565ceff1235e8db3",
  measurementId: "G-NSGMQCZK7V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);