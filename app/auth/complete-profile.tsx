import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaskInput from 'react-native-mask-input';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { FormInput } from '../../components/FormInput';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

export default function CompleteProfileScreen() {
  const { user, refreshProfile } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    birthDate: ''
  });
  const [showErrors, setShowErrors] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();

  const validateDate = (dateString: string) => {
    if (!dateString || dateString.length !== 10) return false;

    const [day, month, year] = dateString.split('/').map(Number);
    const date = new Date(year, month - 1, day);

    // Check if date is valid and not in the future
    const today = new Date();
    return date.getDate() === day &&
      date.getMonth() === month - 1 &&
      date.getFullYear() === year &&
      date <= today &&
      year >= 1900;
  };

  const validateFirstName = (name: string) => {
    if (!name.trim()) return 'First name is required';
    if (name.trim().length < 2) return 'First name must be at least 2 characters';
    return '';
  };

  const validateLastName = (name: string) => {
    if (!name.trim()) return 'Last name is required';
    if (name.trim().length < 2) return 'Last name must be at least 2 characters';
    return '';
  };

  const validateBirthDate = (dateString: string) => {
    if (!dateString) return 'Birth date is required';
    if (dateString.length !== 10) return 'Please enter complete date (DD/MM/YYYY)';
    if (!validateDate(dateString)) return 'Please enter a valid birth date';
    return '';
  };

  const capitalizeWords = (text: string) => {
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const handleFirstNameChange = (text: string) => {
    const capitalizedText = capitalizeWords(text);
    setFirstName(capitalizedText);
    // Only show errors if the user has already tried to submit
    if (showErrors) {
      setErrors(prev => ({ ...prev, firstName: validateFirstName(capitalizedText) }));
    }
  };

  const handleLastNameChange = (text: string) => {
    const capitalizedText = capitalizeWords(text);
    setLastName(capitalizedText);
    // Only show errors if the user has already tried to submit
    if (showErrors) {
      setErrors(prev => ({ ...prev, lastName: validateLastName(capitalizedText) }));
    }
  };

  const handleBirthDateChange = (text: string) => {
    setBirthDate(text);
    // Only show errors if the user has already tried to submit
    if (showErrors) {
      setErrors(prev => ({ ...prev, birthDate: validateBirthDate(text) }));
    }
  };

  // Check if form is valid
  const isFormValid = () => {
    return firstName.trim().length >= 2 &&
      lastName.trim().length >= 2 &&
      birthDate.length === 10 &&
      validateDate(birthDate) &&
      !errors.firstName &&
      !errors.lastName &&
      !errors.birthDate;
  };

  async function handleCompleteProfile() {
    // Enable error display when user tries to submit
    setShowErrors(true);

    // Validate all fields one more time
    const firstNameError = validateFirstName(firstName);
    const lastNameError = validateLastName(lastName);
    const birthDateError = validateBirthDate(birthDate);

    setErrors({
      firstName: firstNameError,
      lastName: lastNameError,
      birthDate: birthDateError
    });

    if (firstNameError || lastNameError || birthDateError) {
      Alert.alert('Please fix the errors', 'Check all fields and try again.');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not found. Please log in again.');
      router.replace('/auth/login');
      return;
    }

    setLoading(true);

    // Convert DD/MM/YYYY to YYYY-MM-DD for database
    const [day, month, year] = birthDate.split('/');
    const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

    console.log('🔍 Updating profile for user:', user.id);
    console.log('🔍 Data to update:', {
      first_name: firstName,
      last_name: lastName,
      birth_date: formattedDate
    });

    const { data, error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        birth_date: formattedDate
      })
      .eq('id', user.id)
      .select(); // Add select to see what was updated

    console.log('🔍 Update result:', { data, error });

    if (error) {
      console.error('❌ Update error:', error);
      Alert.alert('Error', error.message);
      setLoading(false);
    } else {
      console.log('✅ Profile updated successfully:', data);
      
      // Refresh the profile in the context
      await refreshProfile();
      
      console.log('🔄 Profile refreshed in context');
      setLoading(false);
      
      // Don't show alert or navigate manually - let the AuthContext handle navigation
      // Alert.alert('Profile Complete!', 'Welcome to WinAI.');
      // router.replace('/(tabs)');
    }
  }

  const isDark = colorScheme === 'dark';
  const backgroundColor = isDark ? Colors.dark.background : Colors.light.background;
  const textColor = isDark ? Colors.dark.text : Colors.light.text;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>Complete Your Profile</Text>
          <Text style={[styles.subtitle, { color: isDark ? Colors.dark.tabIconDefault : Colors.light.tabIconDefault }]}>
            Let's get to know you a little better.
          </Text>
        </View>

        <View style={styles.form}>
          <FormInput
            label="First Name"
            value={firstName}
            onChangeText={handleFirstNameChange}
            placeholder="Enter your first name"
            textContentType="name"
            autoComplete="name-given"
            autoCapitalize="words"
            autoCorrect={false}
            keyboardType="default"
            secureTextEntry={false}
            error={showErrors ? errors.firstName : null}
            darkMode={isDark}
          />

          <FormInput
            label="Last Name"
            value={lastName}
            onChangeText={handleLastNameChange}
            placeholder="Enter your last name"
            textContentType="familyName"
            autoComplete="name-family"
            autoCapitalize="words"
            autoCorrect={false}
            keyboardType="default"
            secureTextEntry={false}
            error={showErrors ? errors.lastName : null}
            darkMode={isDark}
          />

          <View style={styles.dateInputContainer}>
            <Text style={[styles.dateLabel, { color: textColor }]}>Birth Date</Text>
            <MaskInput
              value={birthDate}
              onChangeText={handleBirthDateChange}
              mask={[/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/]}
              placeholder="DD/MM/YYYY"
              style={[
                styles.dateInput,
                isDark ? styles.dateInputDark : styles.dateInputLight,
                showErrors && errors.birthDate && styles.dateInputError
              ]}
              placeholderTextColor={isDark ? "#9E9E9E" : "#757575"}
              keyboardType="numeric"
            />
            {showErrors && errors.birthDate ? (
              <Text style={styles.errorText}>{errors.birthDate}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={loading ? 'Saving...' : 'Save and Continue'}
            onPress={handleCompleteProfile}
            disabled={loading || !isFormValid()}
            color={Colors.dark.wineRed}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    padding: 20,
    paddingTop: 100,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    marginBottom: 20,
  },
  dateInputContainer: {
    marginBottom: 15,
  },
  dateLabel: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    marginBottom: 8,
  },
  dateInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
  },
  dateInputLight: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
    color: '#212121',
  },
  dateInputDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    color: '#FFFFFF',
  },
  dateInputError: {
    borderColor: '#FF5252',
  },
  errorText: {
    color: '#FF5252',
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
    marginTop: 4,
  },
  buttonContainer: {
    marginTop: 20,
  }
}); 