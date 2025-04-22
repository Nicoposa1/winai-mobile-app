import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ColorSchemeName } from 'react-native';
import { WINE_COLORS } from './WineColors';

export type TabOption = 'photo' | 'manual';

interface TabSelectorProps {
  activeTab: TabOption;
  onTabChange: (tab: TabOption) => void;
  colorScheme?: ColorSchemeName;
}

export function TabSelector({ activeTab, onTabChange, colorScheme = 'light' }: TabSelectorProps) {
  const themeColors = WINE_COLORS[colorScheme ?? 'light'];
  
  return (
    <View style={styles.tabsContainer}>
      <Tab 
        title="Con foto" 
        active={activeTab === 'photo'} 
        onPress={() => onTabChange('photo')}
        themeColors={themeColors}
      />
      <Tab 
        title="Manual" 
        active={activeTab === 'manual'} 
        onPress={() => onTabChange('manual')}
        themeColors={themeColors} 
      />
    </View>
  );
}

interface TabProps {
  title: string;
  active: boolean;
  onPress: () => void;
  themeColors: any;
}

function Tab({ title, active, onPress, themeColors }: TabProps) {
  return (
    <TouchableOpacity
      style={[styles.tab, active && styles.activeTab]}
      onPress={onPress}
    >
      <Text 
        style={[
          styles.tabText, 
          { color: themeColors.textSecondary },
          active && { 
            color: themeColors.burgundy,
            fontFamily: 'Montserrat-SemiBold',
          }
        ]}
      >
        {title}
      </Text>
      {active && (
        <View 
          style={[
            styles.activeIndicator, 
            { backgroundColor: themeColors.burgundy }
          ]} 
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  tab: {
    paddingHorizontal: 5,
    paddingVertical: 10,
    marginRight: 20,
    position: 'relative',
  },
  activeTab: {
    // Estilos para el tab activo
  },
  tabText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderRadius: 3,
  },
}); 