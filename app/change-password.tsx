import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { WINE_COLORS } from '@/components/wine/WineColors';
import { FormInput } from '@/components/FormInput';
import { Button } from '@/components/Button';
import { supabase } from '@/lib/supabase';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export default function ChangePasswordScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = WINE_COLORS[colorScheme];

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [userProvider, setUserProvider] = useState<string | null>(null);
  const [isOAuthUser, setIsOAuthUser] = useState(false);

  // Password validation
  const validatePassword = (password: string): PasswordValidation => {
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  };

  const validation = validatePassword(newPassword);
  const isPasswordValid = Object.values(validation).every(Boolean);

  // Check user authentication provider on component mount
  React.useEffect(() => {
    const checkUserProvider = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Check if user has any OAuth providers
          const oauthProviders = user.app_metadata?.providers || [];
          const hasOAuth = oauthProviders.includes('google') || oauthProviders.includes('facebook');
          
          setIsOAuthUser(hasOAuth);
          setUserProvider(oauthProviders[0] || 'email');
          
          console.log('User providers:', oauthProviders);
          console.log('Is OAuth user:', hasOAuth);
        }
      } catch (error) {
        console.error('Error checking user provider:', error);
      }
    };

    checkUserProvider();
  }, []);

  const handleChangePassword = async () => {
    // Clear previous errors
    setErrors({});
    const newErrors: {[key: string]: string} = {};

    // Validation for OAuth users (no current password needed)
    if (!isOAuthUser && !currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    }
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (newPassword && !isPasswordValid) {
      newErrors.newPassword = 'Password does not meet requirements';
    }
    if (!isOAuthUser && currentPassword && newPassword && currentPassword === newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      if (isOAuthUser) {
        // For OAuth users (Google, Facebook), just set the password directly
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (updateError) {
          throw updateError;
        }

        Alert.alert(
          'Contraseña Establecida',
          `Se ha establecido una contraseña para tu cuenta de ${userProvider}. Ahora puedes usar tanto ${userProvider} como email/contraseña para iniciar sesión.`,
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        // For email users, verify current password first
        const { data: user } = await supabase.auth.getUser();
        if (!user.user?.email) {
          throw new Error('User email not found');
        }

        // Attempt to sign in with current password to verify it
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.user.email,
          password: currentPassword,
        });

        if (signInError) {
          setErrors({ currentPassword: 'Current password is incorrect' });
          return;
        }

        // Update password
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (updateError) {
          throw updateError;
        }

        Alert.alert(
          'Contraseña Actualizada',
          'Tu contraseña ha sido cambiada exitosamente.',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      }

    } catch (error: any) {
      console.error('Password change error:', error);
      Alert.alert(
        'Error',
        error.message || 'No se pudo actualizar la contraseña. Inténtalo de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordRequirement = (text: string, isValid: boolean, delay: number) => (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(300)}
      style={[styles.requirement, { opacity: newPassword ? 1 : 0.5 }]}
    >
      <Ionicons
        name={isValid ? 'checkmark-circle' : 'close-circle'}
        size={16}
        color={isValid ? '#4CAF50' : theme.textSecondary}
      />
      <Text style={[
        styles.requirementText,
        {
          color: isValid ? '#4CAF50' : theme.textSecondary,
          fontFamily: isValid ? 'Montserrat-Medium' : 'Montserrat-Regular',
        }
      ]}>
        {text}
      </Text>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {isOAuthUser ? 'Establecer Contraseña' : 'Cambiar Contraseña'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Info Card */}
          <Animated.View
            style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            entering={FadeInDown.duration(400)}
          >
            <View style={[styles.infoIcon, { backgroundColor: `${theme.burgundy}20` }]}>
              <Ionicons name="shield-checkmark" size={24} color={theme.burgundy} />
            </View>
            <Text style={[styles.infoTitle, { color: theme.text }]}>
              {isOAuthUser ? 'Establecer Contraseña' : 'Cambiar Contraseña'}
            </Text>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              {isOAuthUser 
                ? `Tu cuenta fue creada con ${userProvider}. Puedes establecer una contraseña para tener acceso adicional con email.`
                : 'Elige una contraseña fuerte para mantener tu colección de vinos segura.'
              }
            </Text>
          </Animated.View>

          {/* Current Password - Only show for non-OAuth users */}
          {!isOAuthUser && (
            <Animated.View entering={FadeInDown.delay(200).duration(400)}>
              <FormInput
                label="Contraseña Actual"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={true}
                placeholder="Ingresa tu contraseña actual"
                error={errors.currentPassword}
                textContentType="password"
                autoComplete="current-password"
                autoCapitalize="none"
              />
            </Animated.View>
          )}

          {/* New Password */}
          <Animated.View entering={FadeInDown.delay(isOAuthUser ? 200 : 300).duration(400)}>
            <FormInput
              label={isOAuthUser ? "Nueva Contraseña" : "Nueva Contraseña"}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={true}
              placeholder={isOAuthUser ? "Crea una contraseña" : "Ingresa tu nueva contraseña"}
              error={errors.newPassword}
              textContentType="newPassword"
              autoComplete="new-password"
              autoCapitalize="none"
            />
          </Animated.View>

          {/* Password Requirements */}
          {newPassword.length > 0 && (
            <Animated.View
              style={[styles.requirementsCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              entering={FadeInDown.delay(isOAuthUser ? 300 : 400).duration(400)}
            >
              <Text style={[styles.requirementsTitle, { color: theme.text }]}>
                Requisitos de Contraseña
              </Text>
              {renderPasswordRequirement('Al menos 8 caracteres', validation.minLength, isOAuthUser ? 350 : 450)}
              {renderPasswordRequirement('Una letra mayúscula', validation.hasUppercase, isOAuthUser ? 400 : 500)}
              {renderPasswordRequirement('Una letra minúscula', validation.hasLowercase, isOAuthUser ? 450 : 550)}
              {renderPasswordRequirement('Un número', validation.hasNumber, isOAuthUser ? 500 : 600)}
              {renderPasswordRequirement('Un carácter especial', validation.hasSpecialChar, isOAuthUser ? 550 : 650)}
            </Animated.View>
          )}

          {/* Confirm Password */}
          <Animated.View entering={FadeInDown.delay(isOAuthUser ? 400 : 500).duration(400)}>
            <FormInput
              label="Confirmar Nueva Contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={true}
              placeholder="Confirma tu nueva contraseña"
              error={errors.confirmPassword}
              textContentType="newPassword"
              autoComplete="new-password"
              autoCapitalize="none"
            />
          </Animated.View>

          {/* Update Button */}
          <Animated.View
            style={styles.buttonContainer}
            entering={FadeInDown.delay(isOAuthUser ? 500 : 600).duration(400)}
          >
            <Button
              title={loading 
                ? (isOAuthUser ? 'Estableciendo Contraseña...' : 'Actualizando Contraseña...') 
                : (isOAuthUser ? 'Establecer Contraseña' : 'Actualizar Contraseña')
              }
              onPress={handleChangePassword}
              isLoading={loading}
              color={theme.burgundy}
            />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat-SemiBold',
  },
  placeholder: {
    width: 34,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  infoCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 30,
  },
  infoIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 8,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  requirementsCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 15,
  },
  requirementsTitle: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 12,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 13,
    marginLeft: 8,
  },
  buttonContainer: {
    marginTop: 30,
  },
}); 