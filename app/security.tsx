import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { WINE_COLORS } from '@/components/wine/WineColors';
import { useAuth } from '@/contexts/AuthContext';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { exportUserDataWithWines } from '@/services/dataExportService';
import { DataExportModal } from '@/components/DataExportModal';
import { BiometricModal } from '@/components/BiometricModal';
import { BiometricService } from '@/services/biometricService';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface SecurityOption {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  type: 'toggle' | 'action';
  enabled?: boolean;
  onPress?: () => void;
}

export default function SecurityScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = WINE_COLORS[colorScheme];
  const { user } = useAuth();
  const wines = useSelector((state: RootState) => state.wine.wines);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  // Load biometric status on component mount
  React.useEffect(() => {
    const loadBiometricStatus = async () => {
      try {
        const isEnabled = await BiometricService.isBiometricEnabled();
        setBiometricEnabled(isEnabled);
      } catch (error) {
        console.error('Error loading biometric status:', error);
      }
    };

    loadBiometricStatus();
  }, []);

  const [securitySettings, setSecuritySettings] = useState<SecurityOption[]>([
    {
      id: 'biometric',
      title: 'Biometric Login',
      subtitle: 'Use fingerprint or face recognition to log in',
      icon: 'finger-print',
      type: 'toggle',
      enabled: biometricEnabled,
    },
    {
      id: 'change_password',
      title: 'Change Password',
      subtitle: 'Update your account password',
      icon: 'key',
      type: 'action',
      onPress: () => handleChangePassword(),
    },
    // {
    //   id: 'privacy_settings',
    //   title: 'Privacy Settings',
    //   subtitle: 'Control who can see your wine collection',
    //   icon: 'eye-off',
    //   type: 'action',
    //   onPress: () => handlePrivacySettings(),
    // },
    {
      id: 'data_export',
      title: 'Download Your Data',
      subtitle: 'Export all your wine data and preferences',
      icon: 'download',
      type: 'action',
      onPress: () => setShowExportModal(true),
    },
  ]);

  const toggleSetting = (id: string) => {
    if (id === 'biometric') {
      setShowBiometricModal(true);
      return;
    }

    setSecuritySettings(prev =>
      prev.map(setting =>
        setting.id === id && setting.type === 'toggle'
          ? { ...setting, enabled: !setting.enabled }
          : setting
      )
    );

    // Here you would typically save the setting to your backend
    console.log(`Security setting ${id} toggled`);
  };

  const handleChangePassword = () => {
    router.push('/change-password');
  };



  const handlePrivacySettings = () => {
    Alert.alert(
      'Privacy Settings',
      'Configure who can see your wine collection:\n\n• Public - Everyone can see\n• Friends - Only friends can see\n• Private - Only you can see',
      [{ text: 'OK' }]
    );
  };

  const handleDataExport = async () => {
    const result = await exportUserDataWithWines(wines);
    
    if (!result.success) {
      throw new Error(result.error || 'Error al exportar los datos');
    }
  };

  const handleBiometricToggle = (enabled: boolean) => {
    setBiometricEnabled(enabled);
    
    // Update the security settings state
    setSecuritySettings(prev =>
      prev.map(setting =>
        setting.id === 'biometric'
          ? { ...setting, enabled }
          : setting
      )
    );
  };

  const renderSecurityOption = (option: SecurityOption, index: number) => (
    <Animated.View
      key={option.id}
      entering={FadeInDown.delay(index * 100).duration(400)}
    >
      <TouchableOpacity
        style={[
          styles.option,
          {
            backgroundColor: theme.background,
            borderColor: theme.border,
          }
        ]}
        onPress={option.type === 'action' ? option.onPress : undefined}
        disabled={option.type === 'toggle'}
        activeOpacity={option.type === 'action' ? 0.7 : 1}
      >
        <View style={[styles.iconContainer, { backgroundColor: theme.burgundy }]}>
          <Ionicons name={option.icon} size={20} color="white" />
        </View>
        
        <View style={styles.optionContent}>
          <Text style={[styles.optionTitle, { color: theme.text }]}>
            {option.title}
          </Text>
          <Text style={[styles.optionSubtitle, { color: theme.textSecondary }]}>
            {option.subtitle}
          </Text>
        </View>

        {option.type === 'toggle' ? (
          <Switch
            value={option.enabled}
            onValueChange={() => toggleSetting(option.id)}
            trackColor={{
              false: theme.border,
              true: theme.burgundy
            }}
            thumbColor={option.enabled ? '#fff' : '#f4f3f4'}
            ios_backgroundColor={theme.border}
          />
        ) : (
          <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Security
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Security Info */}
        <Animated.View
          style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          entering={FadeInDown.duration(400)}
        >
          <View style={[styles.infoIcon, { backgroundColor: `${theme.burgundy}20` }]}>
            <Ionicons name="shield-checkmark" size={24} color={theme.burgundy} />
          </View>
          <Text style={[styles.infoTitle, { color: theme.text }]}>
            Keep Your Account Secure
          </Text>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            Protect your wine collection and personal data with these security features.
          </Text>
        </Animated.View>

        {/* Security Options */}
        <View style={styles.optionsContainer}>
          {securitySettings.map((option, index) => renderSecurityOption(option, index + 1))}
        </View>

        {/* Account Info */}
        <Animated.View
          style={[styles.accountInfo, { backgroundColor: theme.card, borderColor: theme.border }]}
          entering={FadeInDown.delay(800).duration(400)}
        >
          <Text style={[styles.accountInfoTitle, { color: theme.text }]}>
            Account Information
          </Text>
          <View style={styles.accountDetail}>
            <Text style={[styles.accountLabel, { color: theme.textSecondary }]}>Email:</Text>
            <Text style={[styles.accountValue, { color: theme.text }]}>{user?.email}</Text>
          </View>
          <View style={styles.accountDetail}>
            <Text style={[styles.accountLabel, { color: theme.textSecondary }]}>Account Created:</Text>
            <Text style={[styles.accountValue, { color: theme.text }]}>
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Data Export Modal */}
      <DataExportModal
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
        onConfirm={handleDataExport}
        colorScheme={colorScheme}
      />

      {/* Biometric Modal */}
      <BiometricModal
        visible={showBiometricModal}
        onClose={() => setShowBiometricModal(false)}
        onToggle={handleBiometricToggle}
        isEnabled={biometricEnabled}
        userEmail={user?.email || ''}
        colorScheme={colorScheme}
      />
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
    borderBottomColor: 'rgba(128, 0, 32, 0.1)',
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
  optionsContainer: {
    gap: 12,
    marginBottom: 30,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
    marginRight: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    lineHeight: 18,
  },
  accountInfo: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  accountInfoTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 15,
  },
  accountDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  accountLabel: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
  },
  accountValue: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
  },
}); 