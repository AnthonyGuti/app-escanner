// 1. Importamos las funciones de la App
import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
// 2. Importamos las funciones y el tipo de dato de Firestore
import { Firestore, getFirestore, initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAzWrIpnynWUH7lwrIGKYM9JVCtvNn6C38",
  authDomain: "appra-estadistica.firebaseapp.com",
  projectId: "appra-estadistica",
  storageBucket: "appra-estadistica.firebasestorage.app",
  messagingSenderId: "527014383641",
  appId: "1:527014383641:web:4937316db22d9d2e031a88"
};

// Inicializamos la App (evitando duplicados)
const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Definimos 'db' con el tipo Firestore para que TypeScript esté feliz
let db: Firestore;

try {
  // Intentamos la configuración con Long Polling para tu Android
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  });
} catch (e) {
  // Si ya existe, simplemente la recuperamos
  db = getFirestore(app);
}

export { db };
