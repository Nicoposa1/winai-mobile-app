import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
  NativeModuleError
} from '@react-native-google-signin/google-signin';
import { Alert } from 'react-native';
import { router } from 'expo-router';

// Define los tipos para el contexto
interface GoogleAuthContextType {
  isGoogleSigninInProgress: boolean;
  googleUser: any | null; // Usando any para evitar problemas de tipado
  signInWithGoogle: () => Promise<void>;
  registerWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

// Crea el contexto
const GoogleAuthContext = createContext<GoogleAuthContextType | undefined>(undefined);

// Web client ID from Google Cloud Console
const WEB_CLIENT_ID = '1083861131378-8d9rj7fghkp1skhfv4ovj2l1idbvqrph.apps.googleusercontent.com'; // Reemplazar con tu Web Client ID
// iOS Client ID from Google Cloud Console
const IOS_CLIENT_ID = '1083861131378-8d9rj7fghkp1skhfv4ovj2l1idbvqrph.apps.googleusercontent.com'; // Reemplazar con tu iOS Client ID

// Hook personalizado para acceder al contexto
export const useGoogleAuth = () => {
  const context = useContext(GoogleAuthContext);
  if (!context) {
    throw new Error('useGoogleAuth debe ser usado dentro de un GoogleAuthProvider');
  }
  return context;
};

// Props para el proveedor
interface GoogleAuthProviderProps {
  children: ReactNode;
  webClientId?: string;
  iosClientId?: string;
}

// Componente proveedor
export const GoogleAuthProvider: React.FC<GoogleAuthProviderProps> = ({
  children,
  webClientId = WEB_CLIENT_ID,
  iosClientId = IOS_CLIENT_ID,
}) => {
  const [isGoogleSigninInProgress, setIsGoogleSigninInProgress] = useState(false);
  const [googleUser, setGoogleUser] = useState<any | null>(null);

  // Configura GoogleSignin al cargar el componente
  useEffect(() => {
    // Configure GoogleSignin
    GoogleSignin.configure({
      webClientId,
      iosClientId,
      offlineAccess: true,
    });
  }, [webClientId, iosClientId]);

  const handleGoogleSignInError = (error: NativeModuleError) => {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      Alert.alert('Sign in cancelled');
    } else if (error.code === statusCodes.IN_PROGRESS) {
      Alert.alert('Sign in already in progress');
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      Alert.alert('Google Play services not available');
    } else {
      Alert.alert('Google Sign-In Error', error.message || 'An unknown error occurred');
      console.error('Google Sign-In Error:', error);
    }
  };

  // Inicia sesión con Google
  const signInWithGoogle = async () => {
    try {
      setIsGoogleSigninInProgress(true);
      
      // Check if user is already signed in
      const isSignedIn = await GoogleSignin.getCurrentUser() !== null;
      if (isSignedIn) {
        await GoogleSignin.signOut();
      }
      
      // Perform Google Sign-in
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      // El userInfo completo es lo que debemos guardar
      setGoogleUser(userInfo);
      
      // Here you would typically integrate with your backend/Firebase
      // const { idToken } = userInfo;
      // if (idToken) {
      //   // Create Firebase credential with the Google ID token
      //   // const credential = firebase.auth.GoogleAuthProvider.credential(idToken);
      //   // Sign in with credential from the Google user
      //   // await firebase.auth().signInWithCredential(credential);
      // }
      
      router.replace('/(tabs)');
    } catch (error) {
      handleGoogleSignInError(error as NativeModuleError);
    } finally {
      setIsGoogleSigninInProgress(false);
    }
  };

  const registerWithGoogle = async () => {
    try {
      setIsGoogleSigninInProgress(true);
      
      // Check if user is already signed in
      const isSignedIn = await GoogleSignin.getCurrentUser() !== null;
      if (isSignedIn) {
        await GoogleSignin.signOut();
      }
      
      // Perform Google Sign-in for registration
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      // El userInfo completo es lo que debemos guardar
      setGoogleUser(userInfo);
      
      // Here you would typically integrate with your backend/Firebase for registration
      // const { idToken } = userInfo;
      // if (idToken) {
      //   // Create Firebase credential with the Google ID token
      //   // const credential = firebase.auth.GoogleAuthProvider.credential(idToken);
      //   // Sign in with credential from the Google user
      //   // await firebase.auth().signInWithCredential(credential);
      // }
      
      router.replace('/(tabs)');
    } catch (error) {
      handleGoogleSignInError(error as NativeModuleError);
    } finally {
      setIsGoogleSigninInProgress(false);
    }
  };

  // Cierra sesión con Google
  const signOut = async () => {
    try {
      setIsGoogleSigninInProgress(true);
      await GoogleSignin.signOut();
      setGoogleUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert('Sign Out Error', 'An error occurred during sign out');
    } finally {
      setIsGoogleSigninInProgress(false);
    }
  };

  // Valor del contexto
  const value: GoogleAuthContextType = {
    isGoogleSigninInProgress,
    googleUser,
    signInWithGoogle,
    registerWithGoogle,
    signOut,
  };

  return (
    <GoogleAuthContext.Provider value={value}>
      {children}
    </GoogleAuthContext.Provider>
  );
};

// Exporta el componente de botón de inicio de sesión con Google
export { GoogleSigninButton }; 