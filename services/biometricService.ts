import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const BIOMETRIC_USER_KEY = 'biometric_user_credentials';

export interface BiometricCapabilities {
  isAvailable: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
  hasHardware: boolean;
  isEnrolled: boolean;
}

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  biometricType?: string;
}

export class BiometricService {
  
  // Check if biometric authentication is available on the device
  static async checkBiometricCapabilities(): Promise<BiometricCapabilities> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      // Filter out PIN/Pattern/Password authentication types, only allow true biometrics
      const biometricTypes = supportedTypes.filter(type => 
        type === LocalAuthentication.AuthenticationType.FINGERPRINT ||
        type === LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION ||
        type === LocalAuthentication.AuthenticationType.IRIS
      );
      
      return {
        isAvailable: hasHardware && isEnrolled && biometricTypes.length > 0,
        supportedTypes: biometricTypes,
        hasHardware,
        isEnrolled,
      };
    } catch (error) {
      console.error('Error checking biometric capabilities:', error);
      return {
        isAvailable: false,
        supportedTypes: [],
        hasHardware: false,
        isEnrolled: false,
      };
    }
  }

  // Get user-friendly name for biometric type
  static getBiometricTypeName(types: LocalAuthentication.AuthenticationType[]): string {
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'Face ID';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'Touch ID';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'Iris';
    }
    return 'Biometric';
  }

  // Check if biometric login is enabled for the user
  static async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
      return enabled === 'true';
    } catch (error) {
      console.error('Error checking biometric enabled status:', error);
      return false;
    }
  }

  // Enable biometric login
  static async enableBiometricLogin(userEmail: string): Promise<BiometricAuthResult> {
    try {
      // First check if biometrics are available
      const capabilities = await this.checkBiometricCapabilities();
      
      if (!capabilities.isAvailable) {
        return {
          success: false,
          error: capabilities.hasHardware 
            ? 'No biometric data enrolled. Please set up fingerprint or face recognition in your device settings.'
            : 'Biometric authentication is not available on this device.',
        };
      }

      // Prompt for biometric authentication to confirm setup
      const authOptions: LocalAuthentication.LocalAuthenticationOptions = {
        promptMessage: 'Authenticate to enable biometric login',
        cancelLabel: 'Cancel',
        disableDeviceFallback: true,
        fallbackLabel: '',
        requireConfirmation: false,
      };

      // On iOS, we need to be more explicit about biometric-only authentication
      if (Platform.OS === 'ios') {
        authOptions.fallbackLabel = '';
        authOptions.disableDeviceFallback = true;
      }
      
      const authResult = await LocalAuthentication.authenticateAsync(authOptions);

      if (authResult.success) {
        // Store biometric settings with user credentials
        await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
        await SecureStore.setItemAsync(BIOMETRIC_USER_KEY, JSON.stringify({
          email: userEmail,
          enabledAt: new Date().toISOString(),
        }));
        
        return {
          success: true,
          biometricType: this.getBiometricTypeName(capabilities.supportedTypes),
        };
      } else {
        return {
          success: false,
          error: authResult.error || 'Biometric authentication failed',
        };
      }
    } catch (error: any) {
      console.error('Error enabling biometric login:', error);
      return {
        success: false,
        error: error.message || 'Failed to enable biometric login',
      };
    }
  }

  // Disable biometric login
  static async disableBiometricLogin(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
      await SecureStore.deleteItemAsync(BIOMETRIC_USER_KEY);
    } catch (error) {
      console.error('Error disabling biometric login:', error);
    }
  }

  // Authenticate with biometrics
  static async authenticateWithBiometrics(): Promise<BiometricAuthResult> {
    try {
      const capabilities = await this.checkBiometricCapabilities();
      
      if (!capabilities.isAvailable) {
        return {
          success: false,
          error: 'Biometric authentication is not available',
        };
      }

      const biometricType = this.getBiometricTypeName(capabilities.supportedTypes);
      
      // Configure authentication options to force biometric-only authentication
      const authOptions: LocalAuthentication.LocalAuthenticationOptions = {
        promptMessage: `Use ${biometricType} to sign in`,
        cancelLabel: 'Cancel',
        disableDeviceFallback: true,
        fallbackLabel: '',
        requireConfirmation: false,
      };

      // On iOS, we need to be more explicit about biometric-only authentication
      if (Platform.OS === 'ios') {
        authOptions.fallbackLabel = '';
        authOptions.disableDeviceFallback = true;
      }
      
      const authResult = await LocalAuthentication.authenticateAsync(authOptions);

      if (authResult.success) {
        return {
          success: true,
          biometricType,
        };
      } else {
        return {
          success: false,
          error: authResult.error || 'Biometric authentication failed',
        };
      }
    } catch (error: any) {
      console.error('Error authenticating with biometrics:', error);
      return {
        success: false,
        error: error.message || 'Biometric authentication failed',
      };
    }
  }

  // Get stored user email for biometric login
  static async getBiometricUserEmail(): Promise<string | null> {
    try {
      const userData = await SecureStore.getItemAsync(BIOMETRIC_USER_KEY);
      if (userData) {
        const parsed = JSON.parse(userData);
        return parsed.email || null;
      }
      return null;
    } catch (error) {
      console.error('Error getting biometric user email:', error);
      return null;
    }
  }

  // Get stored user data for biometric login
  static async getBiometricUserData(): Promise<{ email: string; enabledAt: string } | null> {
    try {
      const userData = await SecureStore.getItemAsync(BIOMETRIC_USER_KEY);
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      console.error('Error getting biometric user data:', error);
      return null;
    }
  }
} 