import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBmt3VzYGn1bJ936KTkE82FMJkB-giILG4",
  authDomain: "civiai-3c822.firebaseapp.com",
  projectId: "civiai-3c822",
  storageBucket: "civiai-3c822.firebasestorage.app",
  messagingSenderId: "925051793723",
  appId: "1:925051793723:web:951bd371dc32987c50071e"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;