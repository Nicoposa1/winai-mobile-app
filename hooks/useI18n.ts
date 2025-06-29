import { useTranslation } from 'react-i18next';
import { changeLanguage } from '@/lib/i18n';
import { useState, useEffect } from 'react';

export const useI18n = () => {
  const { t, i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = (language: string) => {
      setCurrentLang(language);
    };

    i18n.on('languageChanged', handleLanguageChange);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const switchLanguage = async (language: string) => {
    await changeLanguage(language);
    setCurrentLang(language);
  };

  const getCurrentLanguage = () => {
    return currentLang;
  };

  const getLanguageName = (code: string) => {
    const languageNames: { [key: string]: string } = {
      en: 'English',
      es: 'Español',
    };
    return languageNames[code] || code;
  };

  return {
    t,
    switchLanguage,
    getCurrentLanguage,
    getLanguageName,
    currentLanguage: currentLang,
  };
}; 