import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { ColorSchemeName } from 'react-native';

// Constantes para el tamaño
const { width } = Dimensions.get('window');
const GRID_CARD_WIDTH = (width - 60) / 2; // 2 columnas con margen
const LIST_CARD_WIDTH = width - 40; // Lista con margen

export interface Wine {
  id: string;
  name: string;
  winery: string;
  year: number;
  type: 'red' | 'white' | 'rose' | 'sparkling' | 'other';
  region?: string;
  country?: string;
  imageUrl?: string; 
  isFavorite: boolean;
  hasTasted: boolean;
  daysToOptimal?: number; // Días para punto óptimo
  notes?: string;
}

interface WineCardProps {
  wine: Wine;
  colorScheme: ColorSchemeName;
  isGridView: boolean;
  index: number;
  accentColor: string;
  onPress: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onToggleTasted: (id: string) => void;
}

export function WineCard({
  wine,
  colorScheme,
  isGridView,
  index,
  accentColor,
  onPress,
  onToggleFavorite,
  onToggleTasted
}: WineCardProps) {
  const theme = colorScheme ?? 'light';
  const cardBackground = theme === 'dark' ? '#2D2730' : '#FFFFFF';
  
  // Determinar si el vino está listo para tomar
  const isReady = !wine.daysToOptimal || wine.daysToOptimal <= 0;
  
  // Imagen por defecto basada en el tipo de vino
  const defaultImage = {
    red: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=500',
    white: 'https://images.unsplash.com/photo-1598397271429-889fc069426e?q=80&w=500',
    rose: 'https://images.unsplash.com/photo-1558682769-d87b335645d2?q=80&w=500',
    sparkling: 'https://images.unsplash.com/photo-1594980696118-4694ecb56392?q=80&w=500',
    other: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?q=80&w=500',
  };
  
  // Renderizar tarjeta en modo rejilla
  if (isGridView) {
    return (
      <Animated.View
        entering={FadeInUp.duration(400).delay(index * 100)}
        style={[
          styles.gridCardContainer,
          { backgroundColor: cardBackground }
        ]}
      >
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={() => onPress(wine.id)}
          style={styles.cardTouchable}
        >
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: wine.imageUrl || defaultImage[wine.type] }} 
              style={styles.gridImage} 
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.imageGradient}
            />
            
            {/* Status indicators */}
            <View style={styles.statusContainer}>
              <TouchableOpacity 
                style={[styles.statusButton, { backgroundColor: wine.isFavorite ? accentColor : 'rgba(0,0,0,0.5)' }]}
                onPress={() => onToggleFavorite(wine.id)}
              >
                <Ionicons name={wine.isFavorite ? "heart" : "heart-outline"} size={16} color="#FFF" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.statusButton, { backgroundColor: wine.hasTasted ? accentColor : 'rgba(0,0,0,0.5)' }]}
                onPress={() => onToggleTasted(wine.id)}
              >
                <Ionicons name={wine.hasTasted ? "checkmark-circle" : "checkmark-circle-outline"} size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
            
            {/* Optimal drinking indicator */}
            {wine.daysToOptimal !== undefined && (
              <View style={[
                styles.optimalBadge,
                { backgroundColor: isReady ? '#4CAF50' : accentColor }
              ]}>
                <Text style={styles.optimalText}>
                  {isReady 
                    ? 'Listo' 
                    : `${wine.daysToOptimal} días`}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.gridCardContent}>
            <Text style={styles.wineName} numberOfLines={1}>
              {wine.name}
            </Text>
            <Text style={styles.wineDetails} numberOfLines={1}>
              {wine.winery}, {wine.year}
            </Text>
            <View style={styles.typeContainer}>
              <View style={[styles.typeIndicator, { backgroundColor: getTypeColor(wine.type) }]} />
              <Text style={styles.typeText}>
                {getTypeLabel(wine.type)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }
  
  // Renderizar tarjeta en modo lista
  return (
    <Animated.View
      entering={FadeInUp.duration(400).delay(index * 80)}
      style={[
        styles.listCardContainer,
        { backgroundColor: cardBackground }
      ]}
    >
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => onPress(wine.id)}
        style={styles.listCardTouchable}
      >
        <View style={styles.listImageContainer}>
          <Image 
            source={{ uri: wine.imageUrl || defaultImage[wine.type] }} 
            style={styles.listImage} 
            resizeMode="cover"
          />
          
          {/* Optimal drinking indicator for list */}
          {wine.daysToOptimal !== undefined && (
            <View style={[
              styles.listOptimalBadge,
              { backgroundColor: isReady ? '#4CAF50' : accentColor }
            ]}>
              <Text style={styles.optimalText}>
                {isReady 
                  ? 'Listo' 
                  : `${wine.daysToOptimal} días`}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.listCardContent}>
          <View style={styles.listCardHeader}>
            <View style={styles.typeContainerList}>
              <View style={[styles.typeIndicator, { backgroundColor: getTypeColor(wine.type) }]} />
              <Text style={styles.typeText}>
                {getTypeLabel(wine.type)}
              </Text>
            </View>
            
            <Text style={styles.yearText}>
              {wine.year}
            </Text>
          </View>
          
          <Text style={styles.wineName} numberOfLines={1}>
            {wine.name}
          </Text>
          <Text style={styles.wineDetails} numberOfLines={1}>
            {wine.winery}
          </Text>
          
          {wine.country && (
            <Text style={styles.wineLocation} numberOfLines={1}>
              {wine.region ? `${wine.region}, ` : ''}{wine.country}
            </Text>
          )}
          
          <View style={styles.listCardActions}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: wine.isFavorite ? accentColor : 'rgba(0,0,0,0.05)' }]}
              onPress={() => onToggleFavorite(wine.id)}
            >
              <Ionicons 
                name={wine.isFavorite ? "heart" : "heart-outline"} 
                size={18} 
                color={wine.isFavorite ? "#FFF" : theme === 'dark' ? '#FFF' : '#000'} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: wine.hasTasted ? accentColor : 'rgba(0,0,0,0.05)' }]}
              onPress={() => onToggleTasted(wine.id)}
            >
              <Ionicons 
                name={wine.hasTasted ? "checkmark-circle" : "checkmark-circle-outline"} 
                size={18} 
                color={wine.hasTasted ? "#FFF" : theme === 'dark' ? '#FFF' : '#000'} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Funciones auxiliares para determinar colores y etiquetas según el tipo de vino
function getTypeColor(type: string): string {
  switch (type) {
    case 'red': return '#800020';
    case 'white': return '#F9E076';
    case 'rose': return '#FFB7C5';
    case 'sparkling': return '#E8E8E8';
    default: return '#A67B5B';
  }
}

function getTypeLabel(type: string): string {
  switch (type) {
    case 'red': return 'Tinto';
    case 'white': return 'Blanco';
    case 'rose': return 'Rosado';
    case 'sparkling': return 'Espumante';
    default: return 'Otro';
  }
}

const styles = StyleSheet.create({
  // Estilos para el modo rejilla
  gridCardContainer: {
    width: GRID_CARD_WIDTH,
    height: 220,
    borderRadius: 12,
    margin: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTouchable: {
    flex: 1,
  },
  imageContainer: {
    height: 140,
    width: '100%',
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  statusContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'column',
  },
  statusButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  optimalBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  optimalText: {
    color: '#FFF',
    fontSize: 10,
    fontFamily: 'Montserrat-SemiBold',
  },
  gridCardContent: {
    padding: 12,
  },
  wineName: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
    color: '#000',
  },
  wineDetails: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    color: '#666',
    marginTop: 2,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  typeIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  typeText: {
    fontSize: 11,
    fontFamily: 'Montserrat-Medium',
    color: '#666',
  },
  
  // Estilos para el modo lista
  listCardContainer: {
    width: LIST_CARD_WIDTH,
    height: 110,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  listCardTouchable: {
    flex: 1,
    flexDirection: 'row',
  },
  listImageContainer: {
    width: 90,
    height: '100%',
    position: 'relative',
  },
  listImage: {
    width: '100%',
    height: '100%',
  },
  listOptimalBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  listCardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  listCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  typeContainerList: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  yearText: {
    fontSize: 12,
    fontFamily: 'Montserrat-SemiBold',
    color: '#666',
  },
  wineLocation: {
    fontSize: 11,
    fontFamily: 'Montserrat-Regular',
    color: '#888',
    marginTop: 1,
  },
  listCardActions: {
    flexDirection: 'row',
    marginTop: 6,
  },
  actionButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
}); 