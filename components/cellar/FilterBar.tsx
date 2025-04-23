import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { ColorSchemeName } from 'react-native';

export type FilterCategory = 'type' | 'year' | 'country' | 'tasted';
export type FilterOption = {
  id: string;
  label: string;
  category: FilterCategory;
};

interface FilterBarProps {
  colorScheme: ColorSchemeName;
  filters: {
    type: FilterOption[];
    year: FilterOption[];
    country: FilterOption[];
    tasted: FilterOption[];
  };
  selectedFilters: string[];
  onFilterSelect: (filterId: string, category: FilterCategory) => void;
}

export function FilterBar({ 
  colorScheme, 
  filters, 
  selectedFilters, 
  onFilterSelect 
}: FilterBarProps) {
  const theme = colorScheme ?? 'light';
  
  const themeColors = {
    backgroundColor: theme === 'dark' ? '#2A2A2A' : '#F0F0F0',
    activeBackground: theme === 'dark' ? '#85263D' : '#800020',
    activeText: '#FFFFFF',
    text: Colors[theme].text,
    border: theme === 'dark' ? '#3D3D3D' : '#E0E0E0',
  };

  const renderFilterCategory = (
    title: string, 
    options: FilterOption[], 
    category: FilterCategory
  ) => (
    <View style={styles.categoryContainer}>
      <Text style={[styles.categoryTitle, { color: Colors[theme].tabIconDefault }]}>
        {title}
      </Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.optionsContainer}
      >
        {options.map((option) => {
          const isSelected = selectedFilters.includes(option.id);
          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.filterOption,
                { backgroundColor: themeColors.backgroundColor, borderColor: themeColors.border },
                isSelected && { backgroundColor: themeColors.activeBackground }
              ]}
              onPress={() => onFilterSelect(option.id, category)}
            >
              <Text 
                style={[
                  styles.optionText,
                  { color: themeColors.text },
                  isSelected && { color: themeColors.activeText }
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <Animated.View 
      entering={FadeInDown.duration(300)}
      exiting={FadeOutUp.duration(300)}
      style={styles.container}
    >
      {renderFilterCategory('Tipo', filters.type, 'type')}
      {renderFilterCategory('Año', filters.year, 'year')}
      {renderFilterCategory('País', filters.country, 'country')}
      {renderFilterCategory('Estado', filters.tasted, 'tasted')}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 15,
  },
  categoryContainer: {
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 8,
  },
  optionsContainer: {
    paddingRight: 20,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 13,
    fontFamily: 'Montserrat-Medium',
  },
}); 