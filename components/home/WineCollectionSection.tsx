import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { ColorSchemeName } from 'react-native';
import { SavedWineCard } from './SavedWineCard';

interface SavedWine {
  id: string;
  name: string;
  winery: string;
  year: number;
  image: string;
  daysToOptimal: number;
}

interface WineCollectionSectionProps {
  title: string;
  subtitle: string;
  wine: SavedWine | null;
  wineCount: number;
  colorScheme: ColorSchemeName;
  themeColors: {
    card: string;
    accent: string;
  };
  onPress: () => void;
}

export function WineCollectionSection({
  title,
  subtitle,
  wine,
  wineCount,
  colorScheme,
  themeColors,
  onPress
}: WineCollectionSectionProps) {
  const theme = colorScheme ?? 'light';
  
  // Subtítulo personalizado basado en el número de vinos
  const displaySubtitle = wineCount > 0 
    ? `${wineCount} vinos en tu bodega`
    : 'Comienza a añadir vinos a tu bodega';

  return (
    <Animated.View 
      entering={FadeInDown.duration(600).delay(400)}
      style={styles.section}
    >
      <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
        {title}
      </Text>
      <Text style={[styles.sectionSubtitle, { color: Colors[theme].tabIconDefault }]}>
        {subtitle || displaySubtitle}
      </Text>
      
      <SavedWineCard
        wine={wine}
        colorScheme={colorScheme}
        cardBackground={themeColors.card}
        accentColor={themeColors.accent}
        onPress={onPress}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
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
}); 