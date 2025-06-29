import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { ColorSchemeName } from 'react-native';
import { useI18n } from '@/hooks/useI18n';

interface HeaderProps {
  userName: string;
  colorScheme: ColorSchemeName;
}

export function Header({ userName, colorScheme }: HeaderProps) {
  const theme = colorScheme ?? 'light';
  const { t } = useI18n();

  return (
    <Animated.View 
      entering={FadeInDown.duration(600).delay(100)} 
      style={styles.header}
    >
      <View>
        <Text style={[styles.greetingSecondary, { color: Colors[theme].text }]}>
          {t('home.welcome')}
        </Text>
        <Text style={[styles.greetingPrimary, { color: Colors[theme].text }]}>
          {t('home.hello', { name: userName })}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  greetingPrimary: {
    fontSize: 28,
    fontFamily: 'Montserrat-Bold',
  },
  greetingSecondary: {
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
    opacity: 0.7,
  },
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
}); 