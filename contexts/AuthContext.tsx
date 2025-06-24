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
        console.log('🔄 Handling profile on initial load');
        await handleProfileForUser(session.user);
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
      console.log('🔄 Handling profile on auth state change');
      await handleProfileForUser(session.user);
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

  const handleProfileForUser = async (user: User) => {
    console.log('🧪 handleProfileForUser called with user ID:', user.id);
    
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Profile query timeout')), 3000); // 3 second timeout
    });
    
    try {
      console.log('🔍 Searching for existing profile...');
      
      // Race between the actual query and timeout
      const profileQueryPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      const { data: profileData, error } = await Promise.race([
        profileQueryPromise,
        timeoutPromise
      ]) as any;
      
      console.log('🔍 Profile search result:', { profileData, error: error?.message, errorCode: error?.code });
      
      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it for new OAuth users
        console.log('🆕 Creating new profile for OAuth user:', user.id);
        console.log('🆕 User metadata:', user.user_metadata);
        
        const newProfile = {
          id: user.id,
          first_name: null,
          last_name: null,
          birth_date: null,
          avatar_url: user.user_metadata?.avatar_url || null,
        };
        
        console.log('🆕 Profile to insert:', newProfile);
        
        const insertPromise = supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();
        
        const { data: createdProfile, error: createError } = await Promise.race([
          insertPromise,
          timeoutPromise
        ]) as any;
        
        console.log('🆕 Insert result:', { createdProfile, createError: createError?.message });
        
        if (createError) {
          console.error('❌ Error creating profile:', createError);
          // Fallback: create empty profile for navigation
          setProfile({ id: user.id, first_name: null, last_name: null, birth_date: null, avatar_url: null });
        } else {
          console.log('✅ Profile created successfully:', createdProfile);
          setProfile(createdProfile);
        }
      } else if (error) {
        console.error('❌ Error fetching profile:', error);
        // Fallback: create empty profile for navigation
        console.log('🔄 Creating fallback profile due to error');
        setProfile({ id: user.id, first_name: null, last_name: null, birth_date: null, avatar_url: null });
      } else {
        console.log('✅ Existing profile found:', profileData);
        setProfile(profileData);
      }
    } catch (e) {
      console.error('❌ Exception in handleProfileForUser:', e);
      
      // If it's a timeout or any other error, create a fallback profile
      console.log('🔄 Creating fallback profile due to exception:', (e as Error).message);
      setProfile({ 
        id: user.id, 
        first_name: null, 
        last_name: null, 
        birth_date: null, 
        avatar_url: user.user_metadata?.avatar_url || null 
      });
    }
    console.log('🧪 handleProfileForUser completed');
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
            console.log('✅ Session data:', data.session);
            
            // Manually trigger profile fetch/creation since onAuthStateChange might not fire
            if (data.session?.user) {
              console.log('🔄 Manually checking/creating profile after OAuth');
              
              // Create fallback profile immediately for fast navigation
              const fallbackProfile = {
                id: data.session.user.id,
                first_name: null,
                last_name: null,
                birth_date: null,
                avatar_url: data.session.user.user_metadata?.avatar_url || null,
              };
              
              console.log('⚡ Setting fallback profile for fast navigation');
              setProfile(fallbackProfile);
              
              // Try to fetch the real profile in background
              setTimeout(() => {
                if (data.session?.user) {
                  handleProfileForUser(data.session.user).catch(console.error);
                }
              }, 100);
              
              console.log('🔄 Profile handling completed, returning success');
            } else {
              console.log('❌ No user in session data');
            }
            
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