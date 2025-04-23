import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { ColorSchemeName } from 'react-native';

interface SearchBarProps {
  colorScheme: ColorSchemeName;
  onSearch: (text: string) => void;
  onFilterPress: () => void;
  placeholder?: string;
  showFilterButton?: boolean;
  isFilterActive?: boolean;
}

export function SearchBar({ 
  colorScheme, 
  onSearch, 
  onFilterPress,
  placeholder = 'Buscar vino, bodega, año...',
  showFilterButton = true,
  isFilterActive = false
}: SearchBarProps) {
  const [searchText, setSearchText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const theme = colorScheme ?? 'light';
  
  // Determinar colores basados en el tema
  const backgroundColor = theme === 'dark' ? '#2A2A2A' : '#F0F0F0';
  const textColor = Colors[theme].text;
  const placeholderColor = theme === 'dark' ? '#777' : '#999';
  const iconColor = Colors[theme].tabIconDefault;
  const filterIconColor = isFilterActive 
    ? Colors[theme === 'dark' ? 'dark' : 'light'].wineRed 
    : iconColor;

  // Manejar cambio en el texto de búsqueda
  const handleChangeText = (text: string) => {
    setSearchText(text);
    onSearch(text);
  };

  // Manejar la limpieza del texto de búsqueda
  const handleClear = () => {
    setSearchText('');
    onSearch('');
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={[styles.inputContainer, { backgroundColor }]}>
        <Ionicons name="search" size={20} color={iconColor} style={styles.searchIcon} />
        
        <TextInput
          style={[styles.input, { color: textColor }]}
          value={searchText}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        
        {searchText.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={18} color={iconColor} />
          </TouchableOpacity>
        )}
      </View>

      {showFilterButton && (
        <TouchableOpacity 
          style={[styles.filterButton, isFilterActive && styles.filterButtonActive]}
          onPress={onFilterPress}
        >
          <Ionicons name="filter" size={20} color={filterIconColor} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    height: 48,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    fontFamily: 'Montserrat-Regular',
  },
  clearButton: {
    padding: 8,
  },
  filterButton: {
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: 'rgba(128, 0, 32, 0.1)',
  },
}); 