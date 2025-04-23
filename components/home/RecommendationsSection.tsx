import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { ColorSchemeName } from 'react-native';
import { RecommendationCard } from './RecommendationCard';

interface Recommendation {
  id: string;
  name: string;
  winery: string;
  year: number;
  image: string;
  match: number;
}

interface RecommendationsSectionProps {
  title: string;
  subtitle: string;
  recommendations: Recommendation[];
  colorScheme: ColorSchemeName;
  themeColors: {
    card: string;
    accent: string;
  };
  onRecommendationPress: (id: string) => void;
}

export function RecommendationsSection({
  title,
  subtitle,
  recommendations,
  colorScheme,
  themeColors,
  onRecommendationPress,
}: RecommendationsSectionProps) {
  const theme = colorScheme ?? 'light';

  return (
    <Animated.View 
      entering={FadeInDown.duration(600).delay(200)}
      style={styles.section}
    >
      <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
        {title}
      </Text>
      <Text style={[styles.sectionSubtitle, { color: Colors[theme].tabIconDefault }]}>
        {subtitle}
      </Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.recommendationsContainer}
      >
        {recommendations.map((wine, index) => (
          <Animated.View 
            key={wine.id}
            entering={FadeInRight.duration(400).delay(300 + index * 100)}
          >
            <RecommendationCard
              {...wine}
              colorScheme={colorScheme}
              backgroundColor={themeColors.card}
              accentColor={themeColors.accent}
              onPress={() => onRecommendationPress(wine.id)}
            />
          </Animated.View>
        ))}
      </ScrollView>
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
  recommendationsContainer: {
    paddingVertical: 8,
    paddingRight: 20,
  },
}); 