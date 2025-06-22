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

import { FormInput } from '../../components/FormInput';
import { Button } from '../../components/Button';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/Colors';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [formError, setFormError] = useState<{ email: string | null; password: string | null }>({
    email: null,
    password: null,
  });

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Email Required', 'Please enter your email address in the field to reset your password.');
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'winai://auth/update-password',
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Password Reset Email Sent', 'Please check your email for a link to reset your password.');
    }
    setIsLoading(false);
  };

  const handleLogin = async () => {
    let errors: { email: string | null; password: string | null } = { email: null, password: null };
    if (!email) errors.email = 'Email is required.';
    if (!password) errors.password = 'Password is required.';
    setFormError(errors);
    if (errors.email || errors.password) return;

    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    console.log(data);

    if (error) {
      Alert.alert('Login Failed', error.message);
      console.log(error);
    } else {
      router.push('/');
      console.log('Login successful');
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
        colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
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
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to continue</Text>
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
                    textContentType="password"
                    autoComplete="password"
                    autoCapitalize="none"
                    error={formError.password}
                  />

                  <TouchableOpacity
                    onPress={handleForgotPassword}
                    style={styles.forgotPasswordContainer}
                  >
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                  </TouchableOpacity>

                  <Button
                    title="SIGN IN"
                    onPress={handleLogin}
                    isLoading={isLoading}
                    color={Colors.dark.wineRed}
                  />

                  <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerText}>OR</Text>
                    <View style={styles.divider} />
                  </View>

                  <View style={styles.socialContainer}>
                    <TouchableOpacity
                      style={styles.socialButton}
                    >
                      <Image
                        source={require('../../assets/images/facebook.png')}
                        style={styles.socialIcon}
                      />
                      <Text style={styles.socialText}>Facebook</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.socialButton}
                    >
                      <Image
                        source={require('../../assets/images/google.png')}
                        style={styles.socialIcon}
                      />
                      <Text style={styles.socialText}>Google</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.footerContainer}>
                    <Text style={styles.noAccountText}>Don't have an account? </Text>
                    <Link href="/auth/register" asChild>
                      <TouchableOpacity>
                        <Text style={styles.registerText}>Register</Text>
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
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: Colors.dark.wineRed,
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#9E9E9E',
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    width: '48%',
  },
  socialIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  socialText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: '#424242',
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