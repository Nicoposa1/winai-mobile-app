import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome, MaterialIcons, Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { WINE_COLORS } from '../wine/WineColors';

interface ProfileOptionProps {
  icon: string;
  iconType?: 'FontAwesome' | 'MaterialIcons' | 'Ionicons';
  label: string;
  onPress: () => void;
  colorScheme?: 'light' | 'dark';
  isDestructive?: boolean;
  delay?: number;
}

export function ProfileOption({ 
  icon, 
  label, 
  onPress, 
  colorScheme = 'light',
  iconType = 'MaterialIcons',
  isDestructive = false,
  delay = 0
}: ProfileOptionProps) {
  const theme = WINE_COLORS[colorScheme];
  
  let IconComponent;
  switch (iconType) {
    case 'FontAwesome':
      IconComponent = FontAwesome;
      break;
    case 'Ionicons':
      IconComponent = Ionicons;
      break;
    default:
      IconComponent = MaterialIcons;
  }
  
  const textColor = isDestructive ? WINE_COLORS.error : theme.text;
  const iconColor = isDestructive ? WINE_COLORS.error : theme.burgundy;
  
  return (
    <Animated.View
      entering={FadeInRight.delay(delay).duration(400)}
    >
      <TouchableOpacity 
        style={[
          styles.container, 
          { 
            backgroundColor: theme.card,
            borderColor: theme.border
          }
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: isDestructive ? 'rgba(255, 59, 48, 0.1)' : 'rgba(128, 0, 32, 0.1)' }]}>
            <IconComponent name={icon as any} size={20} color={iconColor} />
          </View>
          
          <Text style={[styles.label, { color: textColor }]}>
            {label}
          </Text>
        </View>
        
        <MaterialIcons 
          name="chevron-right" 
          size={22} 
          color={theme.textSecondary} 
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
  }
}); 