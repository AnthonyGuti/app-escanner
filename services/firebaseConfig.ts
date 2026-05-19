import { getApp, getApps, initializeApp } from 'firebase/app';
// Añadimos 'Firestore' en las importaciones para poder usarlo como tipo
import { Firestore, getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

// Tus credenciales reales de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAzWrIpnynWUH7lwrIGKYM9JVCtvNn6C38",
  authDomain: "appra-estadistica.firebaseapp.com",
  projectId: "appra-estadistica",
  storageBucket: "appra-estadistica.firebasestorage.app",
  messagingSenderId: "527014383641",
  appId: "1:527014383641:web:4937316db22d9d2e031a88"
};

// Inicializamos la aplicación de Firebase de forma segura (evita duplicados en Expo)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// LE DECIMOS A TYPESCRIPT QUE 'db' SERÁ UNA INSTANCIA DE FIRESTORE:
let db: Firestore;

try {
  if (getApps().length > 0 && getFirestore(app)) {
    db = getFirestore(app);
  } else {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
  }
} catch (error) {
  // Si da error la verificación, recuperamos la instancia que ya existe
  db = getFirestore(app);
}

// Exportamos 'db' listo y perfectamente tipado
export { app, db };
