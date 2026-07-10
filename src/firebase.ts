import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import firebaseConfig from "./firebase-config.json";

// Initialize Firebase Core by pointing directly to the inner sdkConfig
export const app = initializeApp(firebaseConfig.result.sdkConfig);

// Initialize Google Analytics
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
