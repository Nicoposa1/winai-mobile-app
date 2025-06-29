import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Alert,
  ImageBackground,
  Dimensions,
  Image
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
// import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

import { FormInput } from '../../components/FormInput';
import { Button } from '../../components/Button';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/Colors';

const { width, height } = Dimensions.get('window');

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [formError, setFormError] = useState<{ email: string | null; password: string | null }>({
    email: null,
    password: null,
  });

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    let errors: { email: string | null; password: string | null } = { email: null, password: null };
    
    if (!email) {
      errors.email = 'Email is required.';
    } else if (!validateEmail(email)) {
      errors.email = 'Please enter a valid email address.';
    }
    
    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }
    
    setFormError(errors);
    if (errors.email || errors.password) return;

    setIsLoading(true);
    
    try {
      console.log('🚀 Starting registration for email:', email);
      
      // Simple registration - let Supabase handle duplicate detection
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });
      
      console.log('🔍 Registration response:');
      console.log('Data:', JSON.stringify(data, null, 2));
      console.log('Error:', JSON.stringify(error, null, 2));

      if (error) {
        console.log('Registration error details:', {
          message: error.message,
          status: (error as any).status,
          statusCode: (error as any).statusCode,
          code: (error as any).code
        });
        
        // Handle specific error cases
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('user already registered') ||
            errorMessage.includes('email already registered') ||
            errorMessage.includes('already been registered') ||
            errorMessage.includes('already exists') ||
            errorMessage.includes('duplicate') ||
            errorMessage.includes('signup is disabled') ||
            (error as any).status === 422 ||
            (error as any).statusCode === 422) {
          Alert.alert(
            'Account Already Exists', 
            'An account with this email already exists. Please try logging in instead.',
            [
              { text: 'OK' },
              { text: 'Go to Login', onPress: () => router.push('/auth/login') }
            ]
          );
        } else if (errorMessage.includes('invalid email') || 
                   errorMessage.includes('email not valid')) {
          Alert.alert('Invalid Email', 'Please enter a valid email address.');
        } else if (errorMessage.includes('password') && 
                   (errorMessage.includes('weak') || errorMessage.includes('short'))) {
          Alert.alert('Weak Password', 'Password must be at least 6 characters long and secure.');
        } else if (errorMessage.includes('rate limit') || 
                   errorMessage.includes('too many')) {
          Alert.alert('Too Many Attempts', 'Please wait a moment before trying again.');
        } else {
          Alert.alert('Registration Failed', error.message);
        }
      } else if (data?.user) {
        // Registration successful
        console.log('✅ Registration successful for user:', data.user.email);
        Alert.alert(
          'Registration Successful', 
          'Please check your email to verify your account before logging in.',
          [{ text: 'OK', onPress: () => router.push('/auth/login') }]
        );
      } else {
        // Unexpected response - no error but no user data
        console.log('Unexpected registration response - no error but no user data');
        Alert.alert('Registration Issue', 'There was an issue processing your registration. Please try again.');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert('Registration Failed', 'An unexpected error occurred. Please try again.');
    }
    
    setIsLoading(false);
  };

  return (
    <ImageBackground 
      source={require('../../assets/images/wine.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.8)']}
        style={styles.overlay}
      >
        <SafeAreaView style={styles.container}>
          <StatusBar style="light" />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <View style={styles.headerContainer}>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Start your wine journey today</Text>
              </View>

              <View style={styles.whiteContainer}>
                <View style={styles.formContainer}>
                  <FormInput
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    textContentType="emailAddress"
                    autoComplete="email"
                    autoCapitalize="none"
                    secureTextEntry={false}
                    error={formError.email}
                  />
                  
                  <FormInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    secureTextEntry
                    textContentType="newPassword"
                    autoComplete="password"
                    autoCapitalize="none"
                    error={formError.password}
                  />
                  
                  <Button
                    title="CREATE ACCOUNT"
                    onPress={handleRegister}
                    isLoading={isLoading}
                    color={Colors.dark.wineRed}
                  />

                  <View style={styles.footerContainer}>
                    <Text style={styles.noAccountText}>Already have an account? </Text>
                    <Link href="/auth/login" asChild>
                      <TouchableOpacity>
                        <Text style={styles.registerText}>Sign In</Text>
                      </TouchableOpacity>
                    </Link>
                  </View>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: 20,
    marginTop: height * 0.05,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 8,
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: '#ffffff',
    opacity: 0.9,
  },
  whiteContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
    marginBottom: 30,
  },
  formContainer: {
    padding: 20,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  noAccountText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#666',
  },
  registerText: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    color: Colors.dark.wineRed,
  },
}); 