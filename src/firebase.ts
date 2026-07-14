import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDP6uSNqH32_Ty9SoUzF-qBupFpJ1Bt8Ag",
  authDomain: "prismatic-overview-vdpgw.firebaseapp.com",
  projectId: "prismatic-overview-vdpgw",
  storageBucket: "prismatic-overview-vdpgw.firebasestorage.app",
  messagingSenderId: "407117913236",
  appId: "1:407117913236:web:81e774318d4840fe6ba881"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with the custom database ID from config
const db = getFirestore(app, "ai-studio-8961ff4e-12e9-4f57-aa26-534c6e880a00");

// Test connection as required by firestore guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    console.log("Firebase Firestore connected successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes("client is offline")) {
      console.error("Please check your Firebase configuration. The client is offline.");
    } else {
      console.error("Firestore connection status:", error);
    }
  }
}
testConnection();

export { app, db };
