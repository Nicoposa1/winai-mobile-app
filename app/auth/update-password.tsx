import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import { FormInput } from '../../components/FormInput';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/Colors';
import * as Linking from 'expo-linking';

export default function UpdatePasswordScreen() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    console.log('🔧 UpdatePassword screen loaded with params:', params);
    
    const processAuthTokens = async () => {
      try {
        // First, try to get the current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('🔧 Current session:', currentSession ? 'exists' : 'none');
        
        if (currentSession) {
          setSession(currentSession);
          setIsProcessing(false);
          return;
        }

        // If no current session, check for recovery tokens in URL params
        const { access_token, refresh_token } = params;
        
        if (access_token && refresh_token) {
          console.log('🔧 Found tokens in params, setting session...');
          
          const { data, error } = await supabase.auth.setSession({
            access_token: access_token as string,
            refresh_token: refresh_token as string,
          });
          
          if (error) {
            console.error('🔧 Error setting session:', error);
            Alert.alert('Error', 'Invalid or expired reset link. Please request a new password reset.');
            router.replace('/auth/login');
          } else if (data.session) {
            console.log('🔧 Session set successfully');
            setSession(data.session);
          }
        } else {
          // No tokens, check if we can get them from the URL
          const url = await Linking.getInitialURL();
          console.log('🔧 Initial URL:', url);
          
          if (url && url.includes('access_token=')) {
            const urlParams = new URL(url.replace('#', '?'));
            const accessToken = urlParams.searchParams.get('access_token');
            const refreshToken = urlParams.searchParams.get('refresh_token');
            
            if (accessToken && refreshToken) {
              console.log('🔧 Found tokens in URL, setting session...');
              
              const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
              
              if (error) {
                console.error('🔧 Error setting session from URL:', error);
                Alert.alert('Error', 'Invalid or expired reset link. Please request a new password reset.');
                router.replace('/auth/login');
              } else if (data.session) {
                console.log('🔧 Session set successfully from URL');
                setSession(data.session);
              }
            } else {
              Alert.alert('Error', 'Invalid reset link. Please request a new password reset.');
              router.replace('/auth/login');
            }
          } else {
            Alert.alert('Error', 'No reset token found. Please request a new password reset.');
            router.replace('/auth/login');
          }
        }
      } catch (error) {
        console.error('🔧 Error processing auth tokens:', error);
        Alert.alert('Error', 'Failed to process reset link. Please try again.');
        router.replace('/auth/login');
      } finally {
        setIsProcessing(false);
      }
    };

    processAuthTokens();

    // Also listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('🔧 Auth state changed:', session ? 'session exists' : 'no session');
      setSession(session);
      setIsProcessing(false);
    });

    return () => subscription.unsubscribe();
  }, [params, router]);

  async function handleUpdatePassword() {
    if (!password) {
      Alert.alert('Password Required', 'Please enter a new password.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: password });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Your password has been updated successfully. Please log in.');
      // Sign out to clear the recovery session and force a new login
      await supabase.auth.signOut();
      router.replace('/auth/login');
    }
    setLoading(false);
  }

  if (isProcessing || !session) {
    // This state occurs while waiting for the deep link to be processed.
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Verifying...</Text>
        <Text>Please wait while we verify your password reset request.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a New Password</Text>
      <FormInput
        label="New Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Enter your new password"
        textContentType="newPassword"
        autoComplete="password"
        autoCapitalize="none"
        error={null}
      />
      <Button
        title={loading ? 'Updating...' : 'Update Password'}
        onPress={handleUpdatePassword}
        disabled={loading}
        color={Colors.dark.wineRed}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    fontFamily: 'Montserrat-Bold',
  },
}); 