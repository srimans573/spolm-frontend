// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyBTq_cEhjVN8ZpwBAmYasnOh2a6oiVL-EM",
  authDomain: "spolm-de7f7.firebaseapp.com",
  projectId: "spolm-de7f7",
  storageBucket: "spolm-de7f7.firebasestorage.app",
  messagingSenderId: "9033785005",
  appId: "1:9033785005:web:20f135e626979b5b9ef024",
  measurementId: "G-EYXLDH4QYB"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable IndexedDB persistence so listeners can serve data from local cache
// and avoid unnecessary server reads on reload when data is available locally.
enableIndexedDbPersistence(db).catch((err) => {
  // Common errors include multiple tabs open or unsupported browsers.
  // We log but don't throw so the app still works.
  // eslint-disable-next-line no-console
  console.warn("Could not enable IndexedDB persistence:", err.code || err.message || err);
});