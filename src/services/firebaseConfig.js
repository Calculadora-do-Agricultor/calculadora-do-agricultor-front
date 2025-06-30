import { initializeApp, getApps, getApp } from "firebase/app"; // Adicionado getApps e getApp
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// Configuração vinda do .env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.error("❌ Firebase config incompleto. Verifique o arquivo .env");
}

// Lógica para inicializar o app Firebase apenas uma vez
let app;
if (!getApps().length) { // Se nenhum app Firebase está inicializado
  app = initializeApp(firebaseConfig);
} else {
  app = getApp(); // Se já existe, pega a instância existente do app padrão
}


// Apenas inicialize o App Check se uma chave for fornecida
if (import.meta.env.VITE_RECAPTCHA_SITE_KEY) {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
    isTokenAutoRefreshEnabled: true,
  });
} else {
  console.warn("⚠️ VITE_RECAPTCHA_SITE_KEY não definida. O App Check não será inicializado.");
}


const auth = getAuth(app);
const db = getFirestore(app);

// Inicializa o Analytics apenas em ambiente de produção e quando o navegador suportar
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  try {
    getAnalytics(app);
  } catch (error) {
    console.warn('Analytics não pôde ser inicializado:', error.message);
  }
}

// Suprimir warnings conhecidos do Firebase
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = function(...args) {
    // Suprimir warning específico do BloomFilter do Firebase
    if (args[0] && typeof args[0] === 'string' && args[0].includes('BloomFilter error')) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

export { auth, db, app }; // Exporte 'app' também, caso precise em outros wrappers