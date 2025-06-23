import React, { useState, useEffect, createContext, PropsWithChildren, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

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
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  isSigningOut: false,
  signOut: () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

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

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    isLoading,
    isSigningOut,
    refreshProfile,
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