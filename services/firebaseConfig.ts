import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';

// 🚨 SOLUCIÓN INMEDIATA: Desactiva el truco de la imagen que rompe Android
if (typeof window !== 'undefined' && (window as any).HTMLImageElement) {
  delete (window as any).HTMLImageElement;
}

const firebaseConfig = {
  apiKey: "AIzaSyAzWrIpnynWUH7lwrIGKYM9JVCtvNn6C38",
  authDomain: "appra-estadistica.firebaseapp.com",
  projectId: "appra-estadistica",
  storageBucket: "appra-estadistica.firebasestorage.app",
  messagingSenderId: "527014383641",
  appId: "1:527014383641:web:4937316db22d9d2e031a88"
};

const app = initializeApp(firebaseConfig);

export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
});