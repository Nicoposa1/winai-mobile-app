import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Share,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { WINE_COLORS } from '@/components/wine/WineColors';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Constants from 'expo-constants';

interface SupportOptionProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  onPress: () => void;
  colorScheme: 'light' | 'dark';
  delay?: number;
}

const SupportOption: React.FC<SupportOptionProps> = ({
  icon,
  title,
  description,
  onPress,
  colorScheme,
  delay = 0,
}) => {
  const theme = WINE_COLORS[colorScheme];
  
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(300)}
      style={[styles.optionContainer, { backgroundColor: theme.card }]}
    >
      <TouchableOpacity
        style={styles.optionTouchable}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.optionContent}>
          <View style={[styles.iconContainer, { backgroundColor: theme.burgundy }]}>
            <Ionicons name={icon} size={24} color="#fff" />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.optionTitle, { color: theme.text }]}>{title}</Text>
            <Text style={[styles.optionDescription, { color: theme.textSecondary }]}>
              {description}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function HelpSupportScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = WINE_COLORS[colorScheme];
  const [isLoading, setIsLoading] = useState(false);

  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const buildNumber = Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode || '1';

  const handleEmailSupport = async () => {
    const email = 'support@winai.app';
    const subject = 'WinAI Support Request';
    const body = `
Hi WinAI Support Team,

I need help with:
[Please describe your issue here]

App Version: ${appVersion} (${buildNumber})
Platform: ${Platform.OS} ${Platform.Version}
Device: ${Platform.OS === 'ios' ? 'iOS Device' : 'Android Device'}

Thank you!
    `;

    const emailUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    try {
      const canOpen = await Linking.canOpenURL(emailUrl);
      if (canOpen) {
        await Linking.openURL(emailUrl);
      } else {
        Alert.alert(
          'Email Support',
          `Please send an email to: ${email}`,
          [
            { text: 'Copy Email', onPress: () => Linking.openURL(`mailto:${email}`) },
            { text: 'OK' }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open email client. Please email us at support@winai.app');
    }
  };

  const handleLiveChatSupport = () => {
    Alert.alert(
      'Live Chat Support',
      'Our live chat support is available Monday-Friday, 9 AM - 6 PM EST. Would you like to start a conversation?',
      [
        { text: 'Not Now', style: 'cancel' },
        { 
          text: 'Start Chat', 
          onPress: () => {
            // In a real app, this would open your chat system (Intercom, Zendesk, etc.)
            Alert.alert('Coming Soon', 'Live chat support will be available in the next update!');
          }
        }
      ]
    );
  };

  const handleFAQ = () => {
    Alert.alert(
      'Frequently Asked Questions',
      'This feature is coming soon! For now, please contact support for any questions.',
      [{ text: 'OK' }]
    );
  };

  const handlePrivacyPolicy = async () => {
    const url = 'https://winai.app/privacy-policy';
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open Privacy Policy. Please visit winai.app/privacy-policy');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open Privacy Policy. Please visit winai.app/privacy-policy');
    }
  };

  const handleTermsOfService = async () => {
    const url = 'https://winai.app/terms-of-service';
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open Terms of Service. Please visit winai.app/terms-of-service');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open Terms of Service. Please visit winai.app/terms-of-service');
    }
  };

  const handleAboutApp = () => {
    Alert.alert(
      'About WinAI',
      `Version: ${appVersion} (${buildNumber})\n\nWinAI is your intelligent wine companion, helping you discover, rate, and manage your wine collection with the power of AI.\n\nDeveloped with ❤️ for wine enthusiasts everywhere.`,
      [{ text: 'OK' }]
    );
  };

  const handleReportBug = async () => {
    const email = 'bugs@winai.app';
    const subject = 'Bug Report - WinAI';
    const body = `
Bug Report:

Steps to reproduce:
1. 
2. 
3. 

Expected behavior:


Actual behavior:


App Version: ${appVersion} (${buildNumber})
Platform: ${Platform.OS} ${Platform.Version}
    `;

    const emailUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    try {
      await Linking.openURL(emailUrl);
    } catch (error) {
      Alert.alert('Error', 'Unable to open email client. Please email us at bugs@winai.app');
    }
  };

  const handleFeatureRequest = async () => {
    const email = 'features@winai.app';
    const subject = 'Feature Request - WinAI';
    const body = `
Feature Request:

Feature description:


Why this feature would be helpful:


App Version: ${appVersion} (${buildNumber})
Platform: ${Platform.OS} ${Platform.Version}
    `;

    const emailUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    try {
      await Linking.openURL(emailUrl);
    } catch (error) {
      Alert.alert('Error', 'Unable to open email client. Please email us at features@winai.app');
    }
  };

  const handleRateApp = async () => {
    const appId = Platform.OS === 'ios' ? 'YOUR_IOS_APP_ID' : 'com.winai.app';
    const url = Platform.OS === 'ios' 
      ? `https://apps.apple.com/app/id${appId}?action=write-review`
      : `https://play.google.com/store/apps/details?id=${appId}&showAllReviews=true`;
    
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open app store');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open app store');
    }
  };

  const handleShareApp = async () => {
    try {
      const result = await Share.share({
        message: Platform.OS === 'ios' 
          ? 'Check out WinAI - the intelligent wine companion app! https://apps.apple.com/app/winai'
          : 'Check out WinAI - the intelligent wine companion app! https://play.google.com/store/apps/details?id=com.winai.app',
        title: 'WinAI - Wine Companion App',
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share app');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Support Section */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Get Help</Text>
        
        <SupportOption
          icon="mail-outline"
          title="Email Support"
          description="Get personalized help via email"
          onPress={handleEmailSupport}
          colorScheme={colorScheme}
          delay={100}
        />

        <SupportOption
          icon="chatbubble-outline"
          title="Live Chat"
          description="Chat with our support team"
          onPress={handleLiveChatSupport}
          colorScheme={colorScheme}
          delay={200}
        />

        <SupportOption
          icon="help-circle-outline"
          title="FAQ"
          description="Find answers to common questions"
          onPress={handleFAQ}
          colorScheme={colorScheme}
          delay={300}
        />

        {/* Legal Section */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Legal & Privacy</Text>

        <SupportOption
          icon="shield-outline"
          title="Privacy Policy"
          description="How we protect your data"
          onPress={handlePrivacyPolicy}
          colorScheme={colorScheme}
          delay={400}
        />

        <SupportOption
          icon="document-text-outline"
          title="Terms of Service"
          description="Terms and conditions of use"
          onPress={handleTermsOfService}
          colorScheme={colorScheme}
          delay={500}
        />

        {/* Feedback Section */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Feedback</Text>

        <SupportOption
          icon="bug-outline"
          title="Report a Bug"
          description="Help us improve the app"
          onPress={handleReportBug}
          colorScheme={colorScheme}
          delay={600}
        />

        <SupportOption
          icon="bulb-outline"
          title="Request a Feature"
          description="Suggest new features"
          onPress={handleFeatureRequest}
          colorScheme={colorScheme}
          delay={700}
        />

        <SupportOption
          icon="star-outline"
          title="Rate the App"
          description="Share your experience"
          onPress={handleRateApp}
          colorScheme={colorScheme}
          delay={800}
        />

        <SupportOption
          icon="share-outline"
          title="Share WinAI"
          description="Tell friends about the app"
          onPress={handleShareApp}
          colorScheme={colorScheme}
          delay={900}
        />

        {/* About Section */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>About</Text>

        <SupportOption
          icon="information-circle-outline"
          title="About WinAI"
          description={`Version ${appVersion} (${buildNumber})`}
          onPress={handleAboutApp}
          colorScheme={colorScheme}
          delay={1000}
        />

        {/* Developer Info */}
        <View style={styles.developerInfo}>
          <Text style={[styles.developerText, { color: theme.textSecondary }]}>
            Developed by WinAI Team
          </Text>
          <Text style={[styles.developerText, { color: theme.textSecondary }]}>
            © 2024 WinAI. All rights reserved.
          </Text>
          <Text style={[styles.developerText, { color: theme.textSecondary }]}>
            Contact: support@winai.app
          </Text>
        </View>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'center',
    marginLeft: -34, // Compensate for back button
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 15,
    marginTop: 25,
  },
  optionContainer: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  optionTouchable: {
    padding: 16,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    lineHeight: 20,
  },
  developerInfo: {
    alignItems: 'center',
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  developerText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    marginBottom: 4,
    textAlign: 'center',
  },
}); 