import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// .env informations
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
const appId = import.meta.env.VITE_FIREBASE_APP_ID;
const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID;

let auth;

if (!apiKey || !authDomain || !projectId) {
    console.error("Firebase credentials are not properly configured. Please, config all credential to resolve.");
} else {
    const firebaseConfig = {
        apiKey,
        authDomain,
        projectId,
        storageBucket,
        messagingSenderId,
        appId,
        measurementId,
    };

    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    getAnalytics(app);

    // AppCheck desativado por enquanto
    // initializeAppCheck(app, {
    //     provider: new ReCaptchaV3Provider("YOUR_SITE_KEY"),
    //     isTokenAutoRefreshEnabled: true,
    // });
}

export { auth };
