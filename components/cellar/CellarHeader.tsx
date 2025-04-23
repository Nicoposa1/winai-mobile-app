import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { ColorSchemeName } from 'react-native';

interface CellarHeaderProps {
  colorScheme: ColorSchemeName;
  onViewToggle: () => void;
  isGridView: boolean;
  onSortPress: () => void;
}

export function CellarHeader({ 
  colorScheme, 
  onViewToggle, 
  isGridView,
  onSortPress 
}: CellarHeaderProps) {
  const theme = colorScheme ?? 'light';

  return (
    <Animated.View 
      entering={FadeInDown.duration(500)}
      style={styles.container}
    >
      <Text style={[styles.title, { color: Colors[theme].text }]}>
        Mi Bodega
      </Text>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onSortPress}
        >
          <Ionicons 
            name="options-outline" 
            size={22} 
            color={Colors[theme].tabIconDefault} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onViewToggle}
        >
          <Ionicons 
            name={isGridView ? "list-outline" : "grid-outline"} 
            size={22} 
            color={Colors[theme].tabIconDefault} 
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Montserrat-Bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 15,
  },
}); 