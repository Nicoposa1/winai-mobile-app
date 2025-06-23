import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 Callback params:', params);
        const { code, error: authError } = params;

        if (authError) {
          console.error('❌ Auth error:', authError);
          router.replace('/auth/login');
          return;
        }

        if (code && typeof code === 'string') {
          console.log('🔑 Exchanging code for session...');
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('❌ Session exchange error:', error);
            router.replace('/auth/login');
          } else {
            console.log('✅ Successfully authenticated with Google');
            router.replace('/');
          }
        } else {
          console.log('❌ No code received');
          router.replace('/auth/login');
        }
      } catch (error) {
        console.error('❌ Callback error:', error);
        router.replace('/auth/login');
      }
    };

    // Pequeño delay para asegurar que los parámetros estén disponibles
    const timeoutId = setTimeout(handleAuthCallback, 100);
    
    return () => clearTimeout(timeoutId);
  }, [params, router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 16 }}>Completing sign in...</Text>
    </View>
  );
} 