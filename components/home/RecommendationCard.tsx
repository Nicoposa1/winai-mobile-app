import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '@/constants/Colors';
import { ColorSchemeName } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface RecommendationProps {
  id: string;
  name: string;
  winery: string;
  year: number;
  image: string;
  match: number;
  colorScheme: ColorSchemeName;
  backgroundColor: string;
  accentColor: string;
  onPress: () => void;
}

export function RecommendationCard({
  name,
  winery,
  year,
  image,
  match,
  colorScheme,
  backgroundColor,
  accentColor,
  onPress
}: RecommendationProps) {
  const theme = colorScheme ?? 'light';

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor }]}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <Image source={{ uri: image }} style={styles.image} />
      
      <BlurView 
        intensity={90} 
        tint={theme === 'dark' ? 'dark' : 'light'}
        style={styles.info}
      >
        <View>
          <Text style={[styles.name, { color: Colors[theme].text }]}>
            {name}
          </Text>
          <Text style={[styles.details, { color: Colors[theme].tabIconDefault }]}>
            {winery} • {year}
          </Text>
        </View>
        <View style={styles.matchContainer}>
          <Text style={[styles.matchText, { color: accentColor }]}>
            {match}%
          </Text>
          <Text style={[styles.matchLabel, { color: Colors[theme].tabIconDefault }]}>
            match
          </Text>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: SCREEN_WIDTH * 0.65,
    height: 180,
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  info: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  name: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
  details: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
  },
  matchContainer: {
    alignItems: 'center',
  },
  matchText: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
  },
  matchLabel: {
    fontSize: 10,
    fontFamily: 'Montserrat-Regular',
  },
}); 