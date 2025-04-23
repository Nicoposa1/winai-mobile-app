import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { ColorSchemeName } from 'react-native';

interface SavedWine {
  id: string;
  name: string;
  winery: string;
  year: number;
  image: string;
  daysToOptimal: number;
}

interface SavedWineCardProps {
  wine: SavedWine | null;
  colorScheme: ColorSchemeName;
  cardBackground: string;
  accentColor: string;
  onPress: () => void;
}

export function SavedWineCard({
  wine,
  colorScheme,
  cardBackground,
  accentColor,
  onPress
}: SavedWineCardProps) {
  const theme = colorScheme ?? 'light';

  return (
    <TouchableOpacity 
      style={[styles.savedWineCard, { backgroundColor: cardBackground }]}
      activeOpacity={0.9}
      onPress={onPress}
    >
      {wine ? (
        <>
          <View style={styles.savedWineImageContainer}>
            <Image source={{ uri: wine.image }} style={styles.savedWineImage} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.savedWineGradient}
            />
          </View>
          
          <View style={styles.savedWineContent}>
            <View>
              <Text style={styles.savedWineName}>{wine.name}</Text>
              <Text style={styles.savedWineDetails}>
                {wine.winery} • {wine.year}
              </Text>
            </View>
            
            <View style={[styles.countdownContainer, { backgroundColor: accentColor }]}>
              <Text style={styles.countdownTitle}>Listo para tomar en</Text>
              <Text style={styles.countdownValue}>
                {wine.daysToOptimal} días
              </Text>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.emptyWineCollection}>
          <MaterialIcons name="wine-bar" size={40} color={Colors[theme].tabIconDefault} />
          <Text style={[styles.emptyWineText, { color: Colors[theme].text }]}>
            Añade tu primer vino
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  savedWineCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  savedWineImageContainer: {
    height: 180,
    width: '100%',
  },
  savedWineImage: {
    width: '100%',
    height: '100%',
  },
  savedWineGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
  },
  savedWineContent: {
    padding: 16,
  },
  savedWineName: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    color: '#fff',
    position: 'absolute',
    bottom: 40,
    left: 16,
  },
  savedWineDetails: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#fff',
    opacity: 0.8,
    position: 'absolute',
    bottom: 16,
    left: 16,
  },
  countdownContainer: {
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  countdownTitle: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    color: '#fff',
    opacity: 0.9,
  },
  countdownValue: {
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    color: '#fff',
  },
  emptyWineCollection: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWineText: {
    marginTop: 8,
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
  },
}); 