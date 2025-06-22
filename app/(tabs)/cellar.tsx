import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { CellarHeader } from '../../components/cellar/CellarHeader';
import { SearchBar } from '../../components/cellar/SearchBar';
import { FilterBar } from '../../components/cellar/FilterBar';
import { WineCard } from '../../components/cellar/WineCard';
import { fetchWines } from '../../services/wineService';
import { Wine } from '../../types/wine';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

export default function CellarScreen() {
  const [wines, setWines] = useState<Wine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();

  // Dummy states and functions for child components
  const [isGridView, setIsGridView] = useState(true);
  
  const loadWines = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedWines = await fetchWines();
      setWines(fetchedWines);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching your cellar.');
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadWines();
    }, [])
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.dark.wineRed} />
        <Text style={styles.loadingText}>Loading your cellar...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <CellarHeader 
        colorScheme={colorScheme}
        isGridView={isGridView}
        onViewToggle={() => setIsGridView(!isGridView)}
        onSortPress={() => {}}
      />
      <SearchBar 
        colorScheme={colorScheme}
        onSearch={() => {}} 
        onFilterPress={() => {}}
      />
      <FilterBar 
        colorScheme={colorScheme}
        filters={{}}
        selectedFilters={[]}
        onFilterSelect={() => {}}
      />
      <FlatList
        data={wines}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <WineCard wine={item} colorScheme={colorScheme} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.center}>
            <Text style={styles.emptyText}>Your cellar is empty.</Text>
            <Text style={styles.emptySubText}>Try adding a new wine!</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F4F0',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: Colors.dark.wineRed,
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Montserrat-Medium',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: '#666',
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333',
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#666',
  }
}); 