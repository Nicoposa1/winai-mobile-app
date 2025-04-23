import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { ColorSchemeName } from 'react-native';

interface AIExploreSectionProps {
  title: string;
  subtitle: string;
  colorScheme: ColorSchemeName;
  themeColors: {
    accent: string;
  };
  onCameraPress: () => void;
  onAIDiscoverPress: () => void;
}

export function AIExploreSection({
  title,
  subtitle,
  colorScheme,
  themeColors,
  onCameraPress,
  onAIDiscoverPress
}: AIExploreSectionProps) {
  const theme = colorScheme ?? 'light';

  return (
    <Animated.View 
      entering={FadeInDown.duration(600).delay(600)}
      style={styles.section}
    >
      <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
        {title}
      </Text>
      <Text style={[styles.sectionSubtitle, { color: Colors[theme].tabIconDefault }]}>
        {subtitle}
      </Text>
      
      <View style={styles.aiButtonsContainer}>
        <TouchableOpacity 
          style={[styles.aiButton, { backgroundColor: themeColors.accent }]}
          activeOpacity={0.8}
          onPress={onCameraPress}
        >
          <FontAwesome name="camera" size={24} color="#FFF" />
          <Text style={styles.aiButtonText}>Explorar con foto</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.aiButton, { backgroundColor: theme === 'dark' ? '#3D3647' : '#333' }]}
          activeOpacity={0.8}
          onPress={onAIDiscoverPress}
        >
          <FontAwesome name="magic" size={24} color="#FFF" />
          <Text style={styles.aiButtonText}>Descubrir con IA</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    marginBottom: 16,
  },
  aiButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  aiButton: {
    flex: 1,
    margin: 8,
    height: 100,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  aiButtonText: {
    marginTop: 8,
    color: '#fff',
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
  },
}); 