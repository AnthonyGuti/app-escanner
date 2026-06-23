import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { Image } from 'react-native'; // <-- NUEVO: Importamos Image para protegerlo

// ======================================================================
// ESCUDO DEFINITIVO ANTI-CRASH (Firebase WebChannel vs Expo 3D)
// ======================================================================
const originalGetSize = Image.getSize;
// @ts-ignore - Ignoramos la advertencia de TypeScript para sobreescribir
Image.getSize = (uri: any, success: any, failure: any) => {
  // Si Firebase intenta meter algo que no sea un texto puro (un objeto)...
  if (typeof uri !== 'string') {
    try {
      // Extraemos el texto a la fuerza para que Android no se asuste
      const uriSeguro = uri && uri.uri ? uri.uri : String(uri);
      return originalGetSize(uriSeguro, success, failure);
    } catch (error) {
      // Si Firebase manda basura indescifrable, fingimos que falló suavemente
      // en lugar de dejar que explote toda la aplicación.
      if (failure) failure(error);
      return;
    }
  }
  // Si es una imagen normal de tu aplicación, pasa sin problemas
  return originalGetSize(uri, success, failure);
};
// ======================================================================


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
  experimentalForceLongPolling: true
});