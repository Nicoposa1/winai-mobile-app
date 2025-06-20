import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  Auth,
} from 'firebase/auth';
import { auth as firebaseAuth } from '../config/firebase';
import { router } from 'expo-router';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  error: string | null;
}

const auth: Auth = firebaseAuth;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const register = async (email: string, password: string) => {
    try {
      setError(null);
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
      throw err;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      router.navigate("/auth/login");
    } catch (err: any) {
      setError(err.message || 'An error occurred during logout');
      throw err;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      setError(err.message || 'An error occurred during password reset');
      throw err;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    error
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 