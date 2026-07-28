import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider,
  GithubAuthProvider,
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';

// Firebase configuration using Vite environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if Firebase is configured
const isFirebaseConfigured = !!(
  firebaseConfig.apiKey && 
  firebaseConfig.authDomain && 
  firebaseConfig.projectId
);

let app;
let auth;
let googleProvider;
let facebookProvider;
let githubProvider;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    
    facebookProvider = new FacebookAuthProvider();
    facebookProvider.setCustomParameters({ display: 'popup' });
    
    githubProvider = new GithubAuthProvider();
  } catch (error) {
    console.error("Lỗi khởi tạo Firebase:", error);
  }
} else {
  console.warn(
    "⚠️ CHƯA CẤU HÌNH HỆ THỐNG FIREBASE!\n" +
    "Vui lòng tạo file .env trong thư mục frontend/ và thêm các biến môi trường sau:\n" +
    "VITE_FIREBASE_API_KEY=your_key\n" +
    "VITE_FIREBASE_AUTH_DOMAIN=your_domain\n" +
    "VITE_FIREBASE_PROJECT_ID=your_id\n" +
    "VITE_FIREBASE_STORAGE_BUCKET=your_bucket\n" +
    "VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id\n" +
    "VITE_FIREBASE_APP_ID=your_app_id"
  );
}

export { 
  app, 
  auth, 
  googleProvider, 
  facebookProvider,
  githubProvider,
  isFirebaseConfigured,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
};

