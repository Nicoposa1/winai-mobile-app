import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

// Import translation resources
import en from '../locales/en.json';
import es from '../locales/es.json';

const LANGUAGE_STORAGE_KEY = 'user_language';

// Get device language and fallback to English
const getDeviceLanguage = () => {
  const deviceLanguage = Localization.locale.split('-')[0]; // Get language code (e.g., 'en' from 'en-US')
  return ['en', 'es'].includes(deviceLanguage) ? deviceLanguage : 'en';
};

// Get stored language or device language
const getStoredLanguage = async () => {
  try {
    const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    return storedLanguage || getDeviceLanguage();
  } catch (error) {
    console.error('Error getting stored language:', error);
    return getDeviceLanguage();
  }
};

// Save language to AsyncStorage
export const saveLanguage = async (language: string) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    console.log('Language saved to AsyncStorage:', language);
  } catch (error) {
    console.error('Error saving language:', error);
  }
};

// Change language and save it
export const changeLanguage = async (language: string) => {
  try {
    await i18n.changeLanguage(language);
    await saveLanguage(language);
    console.log('Language changed to:', language);
  } catch (error) {
    console.error('Error changing language:', error);
  }
};

// Initialize i18n
const initI18n = async () => {
  const savedLanguage = await getStoredLanguage();
  
  i18n
    .use(initReactI18next)
    .init({
      compatibilityJSON: 'v4', // For React Native compatibility
      resources: {
        en: { translation: en },
        es: { translation: es },
      },
      lng: savedLanguage,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false, // React already escapes values
      },
      react: {
        useSuspense: false, // Disable suspense for React Native
      },
    });

  console.log('i18n initialized with language:', savedLanguage);
};

// Initialize i18n immediately
initI18n();

export default i18n; 