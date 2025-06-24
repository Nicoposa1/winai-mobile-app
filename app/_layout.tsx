import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, Redirect, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { ActivityIndicator, Text, View, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { ReduxProvider } from '@/providers/ReduxProvider';
import { Colors } from '../constants/Colors';
import { supabase } from '../lib/supabase';
// import { GoogleAuthProvider } from '@/contexts/GoogleAuthContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { session, profile, isLoading, isSigningOut } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    console.log('🔄 RootLayoutNav useEffect:', {
      isLoading,
      isSigningOut,
      hasSession: !!session,
      profile: profile ? {
        id: profile.id,
        first_name: profile.first_name,
        last_name: profile.last_name
      } : null,
      currentSegments: segments
    });

    if (isLoading || isSigningOut) return; // Wait for auth to load or signing out to complete

    // Priority 1: No session = go to login (this takes precedence)
    if (!session) {
      console.log('📍 No session, navigating to login');
      router.replace('/auth/login');
      return;
    }

    // Priority 2: Session exists, check profile (but only if we have a session)
    if (session && profile !== null) {
      if (!profile.first_name || !profile.last_name) {
        // User is authenticated but profile is incomplete
        console.log('📍 Profile incomplete, navigating to complete-profile');
        router.replace('/auth/complete-profile');
      } else {
        // User is authenticated and profile is complete
        console.log('📍 Profile complete, checking if should navigate to tabs');
        // Only navigate to tabs if we're not already in the authenticated area
        const inAuthenticatedArea = segments[0] === '(tabs)' || segments[0] === 'profile' || segments[0] === 'edit-profile';
        if (!inAuthenticatedArea) {
          console.log('📍 Not in authenticated area, navigating to tabs');
          router.replace('/(tabs)');
        } else {
          console.log('📍 Already in authenticated area, staying');
        }
      }
    } else if (session && profile === null) {
      console.log('📍 Session exists but profile is null, waiting for profile to load');
    }
    // If session exists but profile is still null, wait for profile to load
  }, [isLoading, isSigningOut, session, profile, router, segments]);

  // Show loading spinner while checking auth or signing out
  if (isLoading || isSigningOut) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  // Render the navigation stack
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    'Montserrat-Regular': require('../assets/fonts/Montserrat/Montserrat-Regular.ttf'),
    'Montserrat-Medium': require('../assets/fonts/Montserrat/Montserrat-Medium.ttf'),
    'Montserrat-SemiBold': require('../assets/fonts/Montserrat/Montserrat-SemiBold.ttf'),
    'Montserrat-Bold': require('../assets/fonts/Montserrat/Montserrat-Bold.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <ReduxProvider>
          <AuthProvider>
            <RootLayoutNav />
            <StatusBar style="auto" />
          </AuthProvider>
        </ReduxProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
