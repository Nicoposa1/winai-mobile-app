import React, { useState, useEffect, createContext, PropsWithChildren, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  birth_date: string | null;
  avatar_url: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isSigningOut: boolean;
  signOut: () => void;
  refreshProfile: () => Promise<void>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  isSigningOut: false,
  signOut: () => {},
  refreshProfile: async () => {},
  signInWithGoogle: async () => ({ success: false }),
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Configure WebBrowser for auth
  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession();
    
    // Handle deep links
    const handleDeepLink = (url: string) => {
      console.log('🔗 Deep link received:', url);
      if (url.includes('auth/callback')) {
        // Let the callback screen handle the URL
        console.log('🔄 Callback URL detected, letting callback screen handle it');
      }
    };

    // Check if app was opened with a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Listen for deep links while app is running
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      
      // If session exists, fetch the profile
      if (session?.user) {
        try {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (error && error.code !== 'PGRST116') { // PGRST116 = row not found
            console.error('Error fetching profile:', error);
          }
          
          setProfile(profileData || null);
        } catch (e) {
          console.error('Error fetching profile:', e);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      
      // If user logs out, clear profile immediately
      if (!session || event === 'SIGNED_OUT') {
        setProfile(null);
        return;
      }
      
      // If user logs in, fetch their profile
      try {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile on auth change:', error);
        }
        
        setProfile(profileData || null);
      } catch (e) {
        console.error('Error fetching profile on auth change:', e);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (!session?.user) return;
    
    try {
      console.log('🔄 Refrescando perfil para usuario:', session.user.id);
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error refreshing profile:', error);
        return;
      }
      
      console.log('📋 Datos del perfil obtenidos:', {
        id: profileData?.id,
        avatar_url: profileData?.avatar_url,
        first_name: profileData?.first_name
      });
      setProfile(profileData || null);
      console.log('✅ Perfil actualizado en contexto');
    } catch (e) {
      console.error('Error refreshing profile:', e);
    }
  };

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      // En desarrollo, usar la URL nativa directamente
      const redirectUrl = 'winai://auth/callback';

      console.log('🔗 Redirect URL:', redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        console.error('Supabase Google sign-in error:', error);
        return { success: false, error: error.message };
      }

      if (data?.url) {
        console.log('🌐 Opening browser with URL:', data.url);
        
        // Abrir el navegador explícitamente
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUrl
        );

        console.log('🔄 Browser result:', result);

        if (result.type === 'success') {
          console.log('🔄 Processing OAuth result...');
          
          // Extraer tokens de la URL
          const url = result.url;
          const hashParams = new URLSearchParams(url.split('#')[1]);
          const access_token = hashParams.get('access_token');
          const refresh_token = hashParams.get('refresh_token');
          
          console.log('🔑 Tokens extracted:', { 
            hasAccessToken: !!access_token, 
            hasRefreshToken: !!refresh_token 
          });

          if (access_token && refresh_token) {
            // Establecer la sesión con los tokens
            const { data, error } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });

            if (error) {
              console.error('❌ Error setting session:', error);
              return { success: false, error: error.message };
            }

            console.log('✅ Session established successfully');
            return { success: true };
          } else {
            console.error('❌ Missing tokens in OAuth response');
            return { success: false, error: 'Missing authentication tokens' };
          }
        } else if (result.type === 'cancel') {
          return { success: false, error: 'User cancelled the authentication' };
        } else {
          return { success: false, error: 'Authentication failed' };
        }
      } else {
        return { success: false, error: 'No authentication URL received' };
      }
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      return { success: false, error: error.message || 'Google Sign-In failed' };
    }
  };

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    isLoading,
    isSigningOut,
    refreshProfile,
    signInWithGoogle,
    signOut: async () => {
      // Set signing out flag and clear state immediately
      setIsSigningOut(true);
      setProfile(null);
      setSession(null);
      await supabase.auth.signOut();
      setIsSigningOut(false);
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
}; 