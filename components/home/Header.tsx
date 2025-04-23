import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { ColorSchemeName } from 'react-native';

interface HeaderProps {
  userName: string;
  colorScheme: ColorSchemeName;
  onProfilePress: () => void;
}

export function Header({ userName, colorScheme, onProfilePress }: HeaderProps) {
  const theme = colorScheme ?? 'light';
  
  return (
    <Animated.View 
      entering={FadeInDown.duration(600).delay(100)} 
      style={styles.header}
    >
      <View>
        <Text style={[styles.greetingSecondary, { color: Colors[theme].text }]}>
          Bienvenido
        </Text>
        <Text style={[styles.greetingPrimary, { color: Colors[theme].text }]}>
          Hola {userName}
        </Text>
      </View>
      
      <TouchableOpacity onPress={onProfilePress} style={styles.profileButton}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100' }} 
          style={styles.profileImage} 
        />
      </TouchableOpacity>
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