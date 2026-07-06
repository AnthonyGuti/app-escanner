import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { Image } from 'react-native';

// ESCUDO DEFINITIVO ANTI-CRASH (Firebase WebChannel vs Expo 3D)
const originalGetSize = Image.getSize;
// @ts-ignore 
Image.getSize = (uri: any, success: any, failure: any) => {
  if (typeof uri !== 'string') {
    try {
      const uriSeguro = uri && uri.uri ? uri.uri : String(uri);
      return originalGetSize(uriSeguro, success, failure);
    } catch (error) {
      if (failure) failure(error);
      return;
    }
  }
  return originalGetSize(uri, success, failure);
};
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