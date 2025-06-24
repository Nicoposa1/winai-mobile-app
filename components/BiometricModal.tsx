import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WINE_COLORS } from '@/components/wine/WineColors';
import { Button } from '@/components/Button';
import { BiometricService, BiometricCapabilities } from '@/services/biometricService';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInDown, 
  SlideOutDown,
  ZoomIn,
  ZoomOut
} from 'react-native-reanimated';

interface BiometricModalProps {
  visible: boolean;
  onClose: () => void;
  onToggle: (enabled: boolean) => void;
  isEnabled: boolean;
  userEmail: string;
  colorScheme: 'light' | 'dark';
}

export function BiometricModal({ 
  visible, 
  onClose, 
  onToggle, 
  isEnabled, 
  userEmail, 
  colorScheme 
}: BiometricModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [capabilities, setCapabilities] = useState<BiometricCapabilities | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const theme = WINE_COLORS[colorScheme];

  useEffect(() => {
    if (visible) {
      checkCapabilities();
    }
  }, [visible]);

  const checkCapabilities = async () => {
    setIsLoading(true);
    try {
      const caps = await BiometricService.checkBiometricCapabilities();
      setCapabilities(caps);
    } catch (error) {
      console.error('Error checking capabilities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBiometric = async () => {
    if (!capabilities) return;

    setIsLoading(true);
    setError(null);

    try {
      if (isEnabled) {
        // Disable biometric login
        await BiometricService.disableBiometricLogin();
        onToggle(false);
        setSuccess(true);
      } else {
        // Enable biometric login
        const result = await BiometricService.enableBiometricLogin(userEmail);
        
        if (result.success) {
          onToggle(true);
          setSuccess(true);
        } else {
          setError(result.error || 'Failed to enable biometric login');
        }
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSuccess(false);
    onClose();
  };

  const getBiometricIcon = (): keyof typeof Ionicons.glyphMap => {
    if (!capabilities?.supportedTypes.length) return 'finger-print';
    
    if (capabilities.supportedTypes.includes(1)) { // FACIAL_RECOGNITION
      return 'scan';
    }
    return 'finger-print';
  };

  const getBiometricName = (): string => {
    if (!capabilities?.supportedTypes.length) return 'Biometric';
    return BiometricService.getBiometricTypeName(capabilities.supportedTypes);
  };

  const renderLoadingContent = () => (
    <Animated.View 
      entering={ZoomIn.duration(300)}
      exiting={ZoomOut.duration(200)}
      style={[styles.modalContent, styles.loadingContent, { backgroundColor: theme.card }]}
    >
      <ActivityIndicator size="large" color={theme.burgundy} />
      <Text style={[styles.loadingTitle, { color: theme.text }]}>
        Checking Device Capabilities...
      </Text>
    </Animated.View>
  );

  const renderUnavailableContent = () => (
    <Animated.View 
      entering={SlideInDown.duration(300)}
      exiting={SlideOutDown.duration(200)}
      style={[styles.modalContent, { backgroundColor: theme.card }]}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: '#FF634720' }]}>
          <Ionicons name="alert-circle" size={32} color="#FF6347" />
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.title, { color: theme.text }]}>
        Biometric Login Unavailable
      </Text>
      
      <Text style={[styles.description, { color: theme.textSecondary }]}>
        {!capabilities?.hasHardware 
          ? 'Your device does not support biometric authentication.'
          : 'No biometric data is enrolled on your device. Please set up fingerprint or face recognition in your device settings first.'
        }
      </Text>

      <View style={styles.singleButtonContainer}>
        <Button
          title="OK"
          onPress={handleClose}
          color={theme.burgundy}
        />
      </View>
    </Animated.View>
  );

  const renderSuccessContent = () => (
    <Animated.View 
      entering={ZoomIn.duration(300)}
      exiting={ZoomOut.duration(200)}
      style={[styles.modalContent, { backgroundColor: theme.card }]}
    >
      <View style={[styles.successIcon, { backgroundColor: `${theme.burgundy}20` }]}>
        <Ionicons name="checkmark-circle" size={48} color={theme.burgundy} />
      </View>
      
      <Text style={[styles.successTitle, { color: theme.text }]}>
        {isEnabled ? 'Biometric Login Enabled!' : 'Biometric Login Disabled'}
      </Text>
      <Text style={[styles.successDescription, { color: theme.textSecondary }]}>
        {isEnabled 
          ? `You can now use ${getBiometricName()} to sign in to your account.`
          : 'Biometric login has been disabled for your account.'
        }
      </Text>

      <View style={styles.singleButtonContainer}>
        <Button
          title="Perfect"
          onPress={handleClose}
          color={theme.burgundy}
        />
      </View>
    </Animated.View>
  );

  const renderErrorContent = () => (
    <Animated.View 
      entering={ZoomIn.duration(300)}
      exiting={ZoomOut.duration(200)}
      style={[styles.modalContent, { backgroundColor: theme.card }]}
    >
      <View style={[styles.errorIcon, { backgroundColor: '#FF634720' }]}>
        <Ionicons name="alert-circle" size={48} color="#FF6347" />
      </View>
      
      <Text style={[styles.errorTitle, { color: theme.text }]}>
        Setup Failed
      </Text>
      <Text style={[styles.errorDescription, { color: theme.textSecondary }]}>
        {error}
      </Text>

      <View style={styles.errorActions}>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: theme.burgundy }]}
          onPress={handleToggleBiometric}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.cancelButton, { borderColor: theme.border }]}
          onPress={handleClose}
        >
          <Text style={[styles.cancelText, { color: theme.textSecondary }]}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderMainContent = () => (
    <Animated.View 
      entering={SlideInDown.duration(300)}
      exiting={SlideOutDown.duration(200)}
      style={[styles.modalContent, { backgroundColor: theme.card }]}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: theme.burgundy }]}>
          <Ionicons name={getBiometricIcon()} size={32} color="white" />
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.title, { color: theme.text }]}>
        {isEnabled ? `Disable ${getBiometricName()}` : `Enable ${getBiometricName()}`}
      </Text>
      
      <Text style={[styles.description, { color: theme.textSecondary }]}>
        {isEnabled 
          ? `${getBiometricName()} login is currently enabled for your account. You can disable it if you prefer to use only your password.`
          : `Use ${getBiometricName()} to sign in quickly and securely. Your biometric data stays on your device and is never shared.`
        }
      </Text>

      {!isEnabled && (
        <View style={styles.securityInfo}>
          <View style={styles.securityItem}>
            <Ionicons name="shield-checkmark" size={16} color={theme.burgundy} />
            <Text style={[styles.securityText, { color: theme.text }]}>
              Your biometric data never leaves your device
            </Text>
          </View>
          <View style={styles.securityItem}>
            <Ionicons name="lock-closed" size={16} color={theme.burgundy} />
            <Text style={[styles.securityText, { color: theme.text }]}>
              Encrypted and stored securely
            </Text>
          </View>
          <View style={styles.securityItem}>
            <Ionicons name="time" size={16} color={theme.burgundy} />
            <Text style={[styles.securityText, { color: theme.text }]}>
              Faster than typing your password
            </Text>
          </View>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.cancelButton, { borderColor: theme.border }]}
          onPress={handleClose}
        >
          <Text style={[styles.cancelText, { color: theme.textSecondary }]}>
            Cancel
          </Text>
        </TouchableOpacity>
        
        <View style={styles.confirmButton}>
          <Button
            title={isEnabled ? 'Disable' : 'Enable'}
            onPress={handleToggleBiometric}
            isLoading={isLoading}
            color={isEnabled ? '#FF6347' : theme.burgundy}
          />
        </View>
      </View>
    </Animated.View>
  );

  const renderContent = () => {
    if (isLoading && !capabilities) return renderLoadingContent();
    if (success) return renderSuccessContent();
    if (error) return renderErrorContent();
    if (capabilities && !capabilities.isAvailable) return renderUnavailableContent();
    return renderMainContent();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View 
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
      >
        <TouchableOpacity 
          style={styles.overlayTouch}
          activeOpacity={1}
          onPress={isLoading ? undefined : handleClose}
        >
          <View style={styles.modalContainer}>
            {renderContent()}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  overlayTouch: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    lineHeight: 22,
    marginBottom: 20,
  },
  securityInfo: {
    marginBottom: 24,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  securityText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    marginLeft: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
  },
  confirmButton: {
    flex: 2,
  },
  loadingContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat-SemiBold',
    marginTop: 20,
    textAlign: 'center',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'center',
    marginBottom: 12,
  },
  successDescription: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  singleButtonContainer: {
    alignSelf: 'stretch',
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 22,
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'center',
    marginBottom: 12,
  },
  errorDescription: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  errorActions: {
    gap: 12,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
  },
}); 