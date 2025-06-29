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
  Image,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

import { FormInput } from '../../components/FormInput';
import { Button } from '../../components/Button';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import { BiometricService } from '../../services/biometricService';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '../../hooks/useI18n';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');
  const router = useRouter();
  const { signInWithGoogle, session, profile } = useAuth();
  const { t } = useI18n();
  const [formError, setFormError] = useState<{ email: string | null; password: string | null }>({
    email: null,
    password: null,
  });

  // Check biometric availability on component mount
  React.useEffect(() => {
    const checkBiometricAvailability = async () => {
      try {
        const isEnabled = await BiometricService.isBiometricEnabled();
        if (isEnabled) {
          const capabilities = await BiometricService.checkBiometricCapabilities();
          if (capabilities.isAvailable) {
            setBiometricEnabled(true);
            setBiometricAvailable(true);
            setBiometricType(BiometricService.getBiometricTypeName(capabilities.supportedTypes));
          }
        }
      } catch (error) {
        console.error('Error checking biometric availability:', error);
      }
    };

    checkBiometricAvailability();
  }, []);

  // Reset loading states only when session AND profile are ready (navigation completed)
  React.useEffect(() => {
    if (session && profile) {
      console.log('🔄 Session and profile ready, resetting loading states');
      setIsGoogleLoading(false);
      setIsLoading(false);
      setIsBiometricLoading(false);
    }
  }, [session, profile]);

  // Safety timeout to reset loading state if it gets stuck
  React.useEffect(() => {
    if (isGoogleLoading) {
      const timeout = setTimeout(() => {
        console.log('⏰ Google loading timeout, resetting state');
        setIsGoogleLoading(false);
      }, 15000); // 15 seconds timeout

      return () => clearTimeout(timeout);
    }
  }, [isGoogleLoading]);

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert(t('auth.login.errors.emailRequired'), t('auth.login.errors.emailRequired'));
      return;
    }

    setIsLoading(true);
    
    // Determine the correct redirect URL based on the environment
    const isDevelopment = __DEV__;
    const redirectUrl = isDevelopment 
      ? 'http://192.168.0.3:3000/reset-password'  // Backend web page for password reset (using local IP for mobile access)
      : 'https://yourapp.com/reset-password';  // Production backend URL
    
    console.log('🔄 Sending password reset email with redirect:', redirectUrl);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      Alert.alert(t('common.error'), error.message);
    } else {
      Alert.alert(
        t('auth.login.forgotPasswordEmailSent'), 
        isDevelopment 
          ? t('auth.login.forgotPasswordMessageDev')
          : t('auth.login.forgotPasswordMessage')
      );
    }
    setIsLoading(false);
  };

  const handleLogin = async () => {
    let errors: { email: string | null; password: string | null } = { email: null, password: null };
    if (!email) errors.email = t('auth.login.errors.emailRequired');
    if (!password) errors.password = t('auth.login.errors.passwordRequired');
    setFormError(errors);
    if (errors.email || errors.password) return;

    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    console.log(data);

    if (error) {
      Alert.alert(t('common.error'), error.message);
      console.log(error);
    } else {
      router.push('/');
      console.log('Login successful');
    }
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        console.log('✅ Google OAuth completado exitosamente');
        // La navegación será manejada por RootLayoutNav cuando detecte la nueva sesión
        // No establecemos setIsGoogleLoading(false) aquí porque queremos mantener el loading
        // hasta que RootLayoutNav navegue a la página correcta
      } else {
        Alert.alert(t('common.error'), result.error || t('auth.login.errors.unknownError'));
        setIsGoogleLoading(false);
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('auth.login.errors.unknownError'));
      setIsGoogleLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setIsBiometricLoading(true);
    try {
      const result = await BiometricService.authenticateWithBiometrics();
      
      if (result.success) {
        // Get the stored user data
        const userData = await BiometricService.getBiometricUserData();
        
        if (userData?.email) {
          console.log('✅ Biometric authentication successful for:', userData.email);
          
          // For security, we'll show a success message and auto-fill the email
          // The user still needs to enter their password for full authentication
          // This is a security best practice - biometrics should be used as a convenience feature
          setEmail(userData.email);
          
          Alert.alert(
            t('auth.login.biometricSuccess'),
            t('auth.login.biometricSuccessMessage'),
            [{ text: t('common.ok') }]
          );
          
          // Focus on password field would be nice here
          // In a production app, you might want to implement a more sophisticated flow
          // such as storing an encrypted token that can be used for authentication
          
        } else {
          Alert.alert(t('common.error'), t('auth.login.biometricNoData'));
        }
      } else {
        if (result.error && !result.error.includes('canceled')) {
          Alert.alert(t('common.error'), result.error);
        }
      }
    } catch (error: any) {
      console.error('Biometric login error:', error);
      Alert.alert(t('common.error'), t('auth.login.biometricError'));
    } finally {
      setIsBiometricLoading(false);
    }
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
        <StatusBar style="light" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          enabled={true}
        >
          <SafeAreaView style={styles.container}>
            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.headerContainer}>
                <Text style={styles.title}>{t('auth.login.title')}</Text>
                <Text style={styles.subtitle}>{t('auth.login.subtitle')}</Text>
              </View>

              <View style={styles.whiteContainer}>
                <View style={styles.formContainer}>
                  <FormInput
                    label={t('auth.login.email')}
                    value={email}
                    onChangeText={setEmail}
                    placeholder={t('auth.login.email')}
                    textContentType="emailAddress"
                    autoComplete="email"
                    autoCapitalize="none"
                    secureTextEntry={false}
                    error={formError.email}
                  />

                  <FormInput
                    label={t('auth.login.password')}
                    value={password}
                    onChangeText={setPassword}
                    placeholder={t('auth.login.password')}
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
                    <Text style={styles.forgotPasswordText}>{t('auth.login.forgotPassword')}</Text>
                  </TouchableOpacity>

                  <Button
                    title={t('auth.login.signInButton')}
                    onPress={handleLogin}
                    isLoading={isLoading}
                    color={Colors.dark.wineRed}
                  />

                  {/* Biometric Login Button */}
                  {biometricEnabled && biometricAvailable && (
                    <TouchableOpacity
                      style={styles.biometricButton}
                      onPress={handleBiometricLogin}
                      disabled={isBiometricLoading || isLoading || isGoogleLoading}
                    >
                      {isBiometricLoading ? (
                        <ActivityIndicator size="small" color={Colors.dark.wineRed} />
                      ) : (
                        <Ionicons 
                          name={biometricType === 'Face ID' ? 'scan' : 'finger-print'} 
                          size={20} 
                          color={Colors.dark.wineRed} 
                        />
                      )}
                    </TouchableOpacity>
                  )}

                  <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerText}>{t('auth.login.or')}</Text>
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
                      <Text style={styles.socialText}>{t('auth.login.signInWithFacebook')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.socialButton}
                      onPress={handleGoogleSignIn}
                      disabled={isGoogleLoading || isLoading}
                    >
                      {isGoogleLoading ? (
                        <ActivityIndicator size="small" color={Colors.dark.wineRed} />
                      ) : (
                        <>
                          <Image
                            source={require('../../assets/images/google.png')}
                            style={styles.socialIcon}
                          />
                          <Text style={styles.socialText}>{t('auth.login.signInWithGoogle')}</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>

                  <View style={styles.footerContainer}>
                    <Text style={styles.noAccountText}>{t('auth.login.noAccount')} </Text>
                    <TouchableOpacity onPress={() => {
                      console.log('Register button pressed');
                      router.push('/auth/register');
                    }}>
                      <Text style={styles.registerText}>{t('auth.login.signUp')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
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
    minHeight: height * 0.9,
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
  biometricButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 20,
    backgroundColor: `${Colors.dark.wineRed}10`,
    alignSelf: 'center',
  },
}); 