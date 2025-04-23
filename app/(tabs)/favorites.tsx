import React, { useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppSelector, useAppDispatch } from '@/store';
import { Wine, toggleFavorite } from '@/store/slices/wineSlice';

export default function FavoritesScreen() {
  const dispatch = useAppDispatch();
  const { wines } = useAppSelector(state => state.wine);
  
  // Filtrar solo los vinos favoritos
  const favoriteWines = wines.filter(wine => wine.isFavorite);
  
  const handleToggleFavorite = (wineId: string) => {
    dispatch(toggleFavorite(wineId));
  };
  
  if (favoriteWines.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Favorites</Text>
          <Text style={styles.description}>You don't have any favorite wines yet. Add some wines to your favorites!</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Favorites</Text>
        <FlatList
          data={favoriteWines}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <WineCard wine={item} onToggleFavorite={handleToggleFavorite} />
          )}
          ListEmptyComponent={
            <Text style={styles.description}>No favorite wines found.</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
}

interface WineCardProps {
  wine: Wine;
  onToggleFavorite: (id: string) => void;
}

function WineCard({ wine, onToggleFavorite }: WineCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.wineName}>{wine.name}</Text>
        <Text style={styles.wineInfo}>{wine.winery} • {wine.year}</Text>
        <Text style={styles.wineType}>{wine.type}</Text>
      </View>
      <TouchableOpacity 
        style={styles.favoriteButton}
        onPress={() => onToggleFavorite(wine.id)}
      >
        <Text>❤️</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flex: 1,
  },
  wineName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  wineInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  wineType: {
    fontSize: 14,
    color: '#800020',
    textTransform: 'capitalize',
  },
  favoriteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
}); 