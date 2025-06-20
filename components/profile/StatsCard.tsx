import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { WINE_COLORS } from '../wine/WineColors';

interface StatsCardProps {
  icon: string;
  iconType?: 'FontAwesome' | 'MaterialIcons';
  value: number;
  label: string;
  colorScheme?: 'light' | 'dark';
  delay?: number;
}

export function StatsCard({ 
  icon, 
  value, 
  label, 
  colorScheme = 'light', 
  iconType = 'FontAwesome',
  delay = 0
}: StatsCardProps) {
  const theme = WINE_COLORS[colorScheme];
  
  const IconComponent = iconType === 'FontAwesome' ? FontAwesome : MaterialIcons;
  
  return (
    <Animated.View 
      style={[styles.container, { backgroundColor: theme.card }]}
      entering={FadeInDown.delay(delay).duration(400)}
    >
      <View style={[styles.iconContainer, { backgroundColor: theme.burgundyLight }]}>
        <IconComponent name={icon as any} size={22} color="#fff" />
      </View>
      <Text style={[styles.value, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 100,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  value: {
    fontSize: 22,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
    textAlign: 'center',
  }
}); 