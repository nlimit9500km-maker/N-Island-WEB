import { initializeApp } from "firebase/app";
import { initializeFirestore, setLogLevel } from "firebase/firestore";

// Disable internal Firebase logs to prevent them from showing as errors when running in offline/preview environments
setLogLevel('silent');

const firebaseConfig = {
  projectId: "gen-lang-client-0881204837",
  appId: "1:977113091505:web:1bb33efbb02fdb389ac190",
  apiKey: "AIzaSyALlXifBvWJLAHA1NEDu499z0HvhAn0XLM",
  authDomain: "gen-lang-client-0881204837.firebaseapp.com",
  storageBucket: "gen-lang-client-0881204837.firebasestorage.app",
  messagingSenderId: "977113091505",
};

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  ignoreUndefinedProperties: true,
}, "ai-studio-611cfb5e-7db4-434e-bb94-bb1a0df7c5b3");

