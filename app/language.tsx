import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { WINE_COLORS } from '@/components/wine/WineColors';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useI18n } from '@/hooks/useI18n';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

interface LanguageOptionProps {
  language: Language;
  isSelected: boolean;
  onSelect: (code: string) => void;
  colorScheme: 'light' | 'dark';
  delay?: number;
}

const LanguageOption: React.FC<LanguageOptionProps> = ({
  language,
  isSelected,
  onSelect,
  colorScheme,
  delay = 0,
}) => {
  const theme = WINE_COLORS[colorScheme];
  
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(300)}
      style={[
        styles.languageContainer,
        { 
          backgroundColor: theme.card,
          borderColor: isSelected ? theme.burgundy : 'transparent',
          borderWidth: isSelected ? 2 : 1,
        }
      ]}
    >
      <TouchableOpacity
        style={styles.languageTouchable}
        onPress={() => onSelect(language.code)}
        activeOpacity={0.7}
      >
        <View style={styles.languageContent}>
          <View style={styles.languageInfo}>
            <Text style={styles.flagText}>{language.flag}</Text>
            <View style={styles.textContainer}>
              <Text style={[styles.languageName, { color: theme.text }]}>
                {language.name}
              </Text>
              <Text style={[styles.nativeName, { color: theme.textSecondary }]}>
                {language.nativeName}
              </Text>
            </View>
          </View>
          <View style={[
            styles.radioButton,
            { 
              borderColor: isSelected ? theme.burgundy : theme.textSecondary,
              backgroundColor: isSelected ? theme.burgundy : 'transparent'
            }
          ]}>
            {isSelected && (
              <Ionicons name="checkmark" size={16} color="#fff" />
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function LanguageScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = WINE_COLORS[colorScheme];
  const { t, switchLanguage, getCurrentLanguage, getLanguageName } = useI18n();
  
  // Lista de idiomas disponibles - solo inglés y español
  const languages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  ];

  // Estado del idioma seleccionado
  const [selectedLanguage, setSelectedLanguage] = useState(getCurrentLanguage());

  // Actualizar el estado cuando cambie el idioma
  useEffect(() => {
    setSelectedLanguage(getCurrentLanguage());
  }, [getCurrentLanguage()]);

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
  };

  const handleSaveLanguage = async () => {
    const selectedLang = languages.find(lang => lang.code === selectedLanguage);
    
    Alert.alert(
      t('language.languageUpdated'),
      t('language.languageUpdatedMessage', { language: selectedLang?.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('language.apply'), 
          onPress: async () => {
            try {
              await switchLanguage(selectedLanguage);
              // Pequeño delay para asegurar que el idioma se guardó
              setTimeout(() => {
                router.back();
              }, 500);
            } catch (error) {
              console.error('Error changing language:', error);
              Alert.alert(t('common.error'), 'Failed to change language');
            }
          }
        }
      ]
    );
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
        <Text style={[styles.headerTitle, { color: theme.text }]}>{t('language.title')}</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveLanguage}
        >
          <Text style={[styles.saveButtonText, { color: theme.burgundy }]}>
            {t('language.save')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Description */}
        <Animated.View
          entering={FadeInDown.delay(50).duration(300)}
          style={styles.descriptionContainer}
        >
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {t('language.description')}
          </Text>
        </Animated.View>

        {/* Languages List */}
        <View style={styles.languagesContainer}>
          {languages.map((language, index) => (
            <LanguageOption
              key={language.code}
              language={language}
              isSelected={selectedLanguage === language.code}
              onSelect={handleLanguageSelect}
              colorScheme={colorScheme}
              delay={100 + (index * 50)}
            />
          ))}
        </View>

        {/* Footer Info */}
        <Animated.View
          entering={FadeInDown.delay(500).duration(300)}
          style={styles.footerInfo}
        >
          <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
            <Ionicons name="information-circle-outline" size={20} color={theme.burgundy} />
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              {t('language.description')}
            </Text>
          </View>
        </Animated.View>
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
    marginLeft: -50, // Compensate for save button
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  descriptionContainer: {
    marginBottom: 30,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    lineHeight: 24,
    textAlign: 'center',
  },
  languagesContainer: {
    gap: 12,
  },
  languageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  languageTouchable: {
    padding: 16,
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flagText: {
    fontSize: 32,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 2,
  },
  nativeName: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerInfo: {
    marginTop: 40,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
}); 