import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import { FormInput } from '../../components/FormInput';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/Colors';

export default function UpdatePasswordScreen() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();

  useEffect(() => {
    // This effect handles the user session from the deep link
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

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

  if (!session) {
    // This state occurs while waiting for the deep link to be processed.
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Verifying...</Text>
        <Text>Please wait while we verify your request.</Text>
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