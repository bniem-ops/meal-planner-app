import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCIIz8I-FtD-gz8N6TmzFzcssbQQAHOSmA",
  authDomain: "bn-meal-planning.firebaseapp.com",
  projectId: "bn-meal-planning",
  storageBucket: "bn-meal-planning.firebasestorage.app",
  messagingSenderId: "63544590088",
  appId: "1:63544590088:web:9be810894230ec45cdf6bd",
  measurementId: "G-N9Q7DPK23J"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
