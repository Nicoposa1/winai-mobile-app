import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { FormInput } from '../components/FormInput';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';
import { Colors } from '../constants/Colors';
import { useAuth } from '../contexts/AuthContext';
import { useColorScheme } from '../hooks/useColorScheme';
import { WINE_COLORS } from '../components/wine/WineColors';

export default function EditProfileScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const router = useRouter();
  const { profile, refreshProfile, user } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = WINE_COLORS[colorScheme];

  const [formError, setFormError] = useState<{
    firstName: string | null;
    lastName: string | null;
    birthDate: string | null;
  }>({
    firstName: null,
    lastName: null,
    birthDate: null,
  });

  // Load current profile data
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setBirthDate(profile.birth_date || '');
      setIsInitialLoading(false);
    }
  }, [profile]);

  const validateForm = () => {
    let errors: { firstName: string | null; lastName: string | null; birthDate: string | null } = { 
      firstName: null, 
      lastName: null, 
      birthDate: null 
    };
    let isValid = true;

    if (!firstName.trim()) {
      errors.firstName = 'First name is required.';
      isValid = false;
    }

    if (!lastName.trim()) {
      errors.lastName = 'Last name is required.';
      isValid = false;
    }

    // Optional: validate birth date format if provided
    if (birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      errors.birthDate = 'Birth date must be in YYYY-MM-DD format.';
      isValid = false;
    }

    setFormError(errors);
    return isValid;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    if (!user?.id) return;

    setIsLoading(true);

    try {
      const updateData = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        birth_date: birthDate || null,
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        Alert.alert('Error', 'Failed to update profile. Please try again.');
        console.error('Profile update error:', error);
      } else {
        Alert.alert('Success', 'Profile updated successfully!', [
          {
            text: 'OK',
            onPress: () => {
              refreshProfile();
              router.back();
            },
          },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred.');
      console.error('Profile update exception:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitialLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.burgundy} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={theme.burgundy} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.text }]}>Edit Profile</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Form */}
          <View style={[styles.formContainer, { backgroundColor: theme.card }]}>
            <FormInput
              label="First Name"
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter your first name"
              textContentType="givenName"
              autoComplete="given-name"
              autoCapitalize="words"
              secureTextEntry={false}
              error={formError.firstName}
              darkMode={colorScheme === 'dark'}
            />

            <FormInput
              label="Last Name"
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter your last name"
              textContentType="familyName"
              autoComplete="family-name"
              autoCapitalize="words"
              secureTextEntry={false}
              error={formError.lastName}
              darkMode={colorScheme === 'dark'}
            />

            <View style={styles.emailContainer}>
              <Text style={[styles.label, { color: theme.text }]}>Email</Text>
              <TextInput
                value={user?.email || ''}
                placeholder="Email address"
                placeholderTextColor={theme.textSecondary}
                editable={false}
                style={[
                  styles.disabledInput,
                  {
                    backgroundColor: theme.input,
                    borderColor: theme.border,
                    color: theme.textSecondary,
                  }
                ]}
              />
            </View>

            <FormInput
              label="Birth Date (Optional)"
              value={birthDate}
              onChangeText={setBirthDate}
              placeholder="YYYY-MM-DD (e.g., 1990-01-15)"
              textContentType="none"
              autoComplete="off"
              autoCapitalize="none"
              secureTextEntry={false}
              error={formError.birthDate}
              darkMode={colorScheme === 'dark'}
            />

            <View style={styles.saveButton}>
              <Button
                title="SAVE CHANGES"
                onPress={handleSave}
                isLoading={isLoading}
                color={theme.burgundy}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 5,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Montserrat-SemiBold',
  },
  placeholder: {
    width: 40, // Same width as back button for centering
  },
  formContainer: {
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emailContainer: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 8,
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
  },
  disabledInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    opacity: 0.7,
  },
  saveButton: {
    marginTop: 10,
  },
}); 