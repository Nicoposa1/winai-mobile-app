import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAcHx6GLRAA3ZGAnjBOXYajyNx0llHE5C8",
  authDomain: "winai-afc87.firebaseapp.com",
  projectId: "winai-afc87",
  storageBucket: "winai-afc87.appspot.com",
  messagingSenderId: "1083861131378",
  appId: "1:1083861131378:web:c846c61f2d1b4a52c7e2eb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { app, auth }; 