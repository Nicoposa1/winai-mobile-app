import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  FlatList, 
  ActivityIndicator,
  Text,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Store y hooks
import { useAppSelector, useAppDispatch } from '@/store';
import { useColorScheme } from '@/hooks/useColorScheme';
import { toggleFavorite, toggleTasted } from '@/store/slices/wineSlice';

// Componentes
import { CellarHeader } from '@/components/cellar/CellarHeader';
import { SearchBar } from '@/components/cellar/SearchBar';
import { FilterBar, FilterCategory, FilterOption } from '@/components/cellar/FilterBar';
import { WineCard, Wine } from '@/components/cellar/WineCard';
import { SortModal, SortOption } from '@/components/cellar/SortModal';

// Colores
const THEME_COLORS = {
  light: {
    background: '#F8F5F2',
    card: '#FFFFFF',
    accent: '#800020',
    empty: '#f5f5f5',
    emptyText: '#666',
  },
  dark: {
    background: '#1E1B1E',
    card: '#2D2730',
    accent: '#9A2846',
    empty: '#2A2A2A',
    emptyText: '#999',
  }
};

// Opciones de filtro
const filterOptions = {
  type: [
    { id: 'type-red', label: 'Tinto', category: 'type' as FilterCategory },
    { id: 'type-white', label: 'Blanco', category: 'type' as FilterCategory },
    { id: 'type-rose', label: 'Rosado', category: 'type' as FilterCategory },
    { id: 'type-sparkling', label: 'Espumante', category: 'type' as FilterCategory },
    { id: 'type-other', label: 'Otros', category: 'type' as FilterCategory },
  ],
  year: [
    { id: 'year-2023', label: '2023', category: 'year' as FilterCategory },
    { id: 'year-2022', label: '2022', category: 'year' as FilterCategory },
    { id: 'year-2021', label: '2021', category: 'year' as FilterCategory },
    { id: 'year-2020', label: '2020', category: 'year' as FilterCategory },
    { id: 'year-2019', label: '2019', category: 'year' as FilterCategory },
    { id: 'year-older', label: 'Más antiguos', category: 'year' as FilterCategory },
  ],
  country: [
    { id: 'country-argentina', label: 'Argentina', category: 'country' as FilterCategory },
    { id: 'country-chile', label: 'Chile', category: 'country' as FilterCategory },
    { id: 'country-spain', label: 'España', category: 'country' as FilterCategory },
    { id: 'country-france', label: 'Francia', category: 'country' as FilterCategory },
    { id: 'country-italy', label: 'Italia', category: 'country' as FilterCategory },
    { id: 'country-other', label: 'Otros', category: 'country' as FilterCategory },
  ],
  tasted: [
    { id: 'tasted-yes', label: 'Probados', category: 'tasted' as FilterCategory },
    { id: 'tasted-no', label: 'Sin probar', category: 'tasted' as FilterCategory },
    { id: 'tasted-ready', label: 'Listos para tomar', category: 'tasted' as FilterCategory },
    { id: 'tasted-waiting', label: 'En guarda', category: 'tasted' as FilterCategory },
  ]
};

// Opciones de ordenación
const sortOptions: SortOption[] = [
  { id: 'name-asc', label: 'Nombre (A-Z)', icon: 'text' },
  { id: 'name-desc', label: 'Nombre (Z-A)', icon: 'text' },
  { id: 'year-desc', label: 'Año (más recientes)', icon: 'calendar' },
  { id: 'year-asc', label: 'Año (más antiguos)', icon: 'calendar' },
  { id: 'date-desc', label: 'Fecha de guardado (más recientes)', icon: 'time' },
  { id: 'date-asc', label: 'Fecha de guardado (más antiguos)', icon: 'time' },
  { id: 'type', label: 'Tipo de vino', icon: 'wine' },
];

export default function CellarScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const themeColors = THEME_COLORS[theme];
  
  const dispatch = useAppDispatch();
  const { wines } = useAppSelector(state => state.wine);
  
  // Estados
  const [isGridView, setIsGridView] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [filteredWines, setFilteredWines] = useState<Wine[]>([]);
  const [showSortModal, setShowSortModal] = useState(false);
  const [selectedSort, setSelectedSort] = useState('name-asc');
  const [isLoading, setIsLoading] = useState(true);
  
  // Actualizar lista de vinos filtrados
  useEffect(() => {
    setIsLoading(true);
    
    // Filtrar por texto de búsqueda
    let filtered = wines;
    
    if (searchText.trim() !== '') {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(wine => 
        wine.name.toLowerCase().includes(searchLower) ||
        wine.winery.toLowerCase().includes(searchLower) ||
        wine.year.toString().includes(searchLower) ||
        (wine.country && wine.country.toLowerCase().includes(searchLower)) ||
        (wine.region && wine.region.toLowerCase().includes(searchLower))
      );
    }
    
    // Aplicar filtros seleccionados
    if (selectedFilters.length > 0) {
      filtered = filtered.filter(wine => {
        // Filtros por tipo
        const typeFilters = selectedFilters.filter(f => f.startsWith('type-'));
        if (typeFilters.length > 0) {
          const matchesType = typeFilters.some(f => {
            const type = f.replace('type-', '');
            return wine.type === type;
          });
          if (!matchesType) return false;
        }
        
        // Filtros por año
        const yearFilters = selectedFilters.filter(f => f.startsWith('year-'));
        if (yearFilters.length > 0) {
          const matchesYear = yearFilters.some(f => {
            const year = f.replace('year-', '');
            if (year === 'older') {
              return wine.year < 2019;
            }
            return wine.year.toString() === year;
          });
          if (!matchesYear) return false;
        }
        
        // Filtros por país
        const countryFilters = selectedFilters.filter(f => f.startsWith('country-'));
        if (countryFilters.length > 0) {
          const matchesCountry = countryFilters.some(f => {
            const country = f.replace('country-', '');
            if (country === 'other') {
              return !['argentina', 'chile', 'spain', 'france', 'italy'].includes(
                wine.country?.toLowerCase() || ''
              );
            }
            return wine.country?.toLowerCase() === country;
          });
          if (!matchesCountry) return false;
        }
        
        // Filtros por estado de cata
        const tastedFilters = selectedFilters.filter(f => f.startsWith('tasted-'));
        if (tastedFilters.length > 0) {
          return tastedFilters.some(f => {
            const status = f.replace('tasted-', '');
            if (status === 'yes') return wine.hasTasted;
            if (status === 'no') return !wine.hasTasted;
            if (status === 'ready') return !wine.daysToOptimal || wine.daysToOptimal <= 0;
            if (status === 'waiting') return wine.daysToOptimal && wine.daysToOptimal > 0;
            return true;
          });
        }
        
        return true;
      });
    }
    // Aplicar ordenación
    const sortedWines = sortWines(filtered, selectedSort);
    
    setFilteredWines(sortedWines);
    setIsLoading(false);
  }, [wines, searchText, selectedFilters, selectedSort]);
  
  // Ordenar vinos
  const sortWines = (wineList: Wine[], sortId: string): Wine[] => {
    const sorted = [...wineList];
    
    switch (sortId) {
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'year-desc':
        return sorted.sort((a, b) => b.year - a.year);
      case 'year-asc':
        return sorted.sort((a, b) => a.year - b.year);
      case 'date-desc':
        // Suponiendo que el ID tiene algún tipo de timestamp o que hay un campo de fecha
        return sorted.sort((a, b) => b.id.localeCompare(a.id));
      case 'date-asc':
        return sorted.sort((a, b) => a.id.localeCompare(b.id));
      case 'type':
        return sorted.sort((a, b) => a.type.localeCompare(b.type));
      default:
        return sorted;
    }
  };
  
  // Manejar selección de filtro
  const handleFilterSelect = (filterId: string, category: FilterCategory) => {
    setSelectedFilters(prev => {
      // Si ya está seleccionado, lo quitamos
      if (prev.includes(filterId)) {
        return prev.filter(id => id !== filterId);
      }
      
      // Si no está seleccionado, lo agregamos 
      return [...prev, filterId];
    });
  };
  
  // Manejar cambio de favorito
  const handleToggleFavorite = (id: string) => {
    dispatch(toggleFavorite(id));
  };
  
  // Manejar cambio de estado de cata
  const handleToggleTasted = (id: string) => {
    dispatch(toggleTasted(id));
  };
  
  // Manejar selección de vino
  const handleWinePress = (id: string) => {
    // Navegar al detalle del vino
    console.log(`Pressed wine: ${id}`);
  };
  
  // Renderizar cada vino
  const renderWineItem = ({ item, index }: { item: Wine, index: number }) => (
    <WineCard
      wine={item}
      colorScheme={colorScheme}
      isGridView={isGridView}
      index={index}
      accentColor={themeColors.accent}
      onPress={handleWinePress}
      onToggleFavorite={handleToggleFavorite}
      onToggleTasted={handleToggleTasted}
    />
  );
  
  // Renderizar componente vacío
  const renderEmptyComponent = () => (
    <View style={[styles.emptyContainer, { backgroundColor: themeColors.empty }]}>
      <Ionicons name="wine-outline" size={60} color={themeColors.emptyText} />
      <Text style={[styles.emptyText, { color: themeColors.emptyText }]}>
        {searchText || selectedFilters.length > 0 
          ? 'No se encontraron vinos con estos criterios'
          : 'Aún no has añadido vinos a tu bodega'}
      </Text>
      {searchText || selectedFilters.length > 0 ? (
        <TouchableOpacity 
          style={[styles.emptyButton, { borderColor: themeColors.accent }]}
          onPress={() => {
            setSearchText('');
            setSelectedFilters([]);
          }}
        >
          <Text style={[styles.emptyButtonText, { color: themeColors.accent }]}>
            Limpiar filtros
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity 
          style={[styles.emptyButton, { backgroundColor: themeColors.accent }]}
          onPress={() => {
            // Navegar a la pantalla de agregar vino
            console.log('Navigate to add wine');
          }}
        >
          <Text style={styles.emptyButtonText}>
            Añadir un vino
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      {/* Encabezado */}
      <CellarHeader
        colorScheme={colorScheme}
        onViewToggle={() => setIsGridView(!isGridView)}
        isGridView={isGridView}
        onSortPress={() => setShowSortModal(true)}
      />
      
      {/* Barra de búsqueda */}
      <SearchBar
        colorScheme={colorScheme}
        onSearch={setSearchText}
        onFilterPress={() => setShowFilters(!showFilters)}
        showFilterButton={true}
        isFilterActive={selectedFilters.length > 0}
      />
      
      {/* Barra de filtros (condicional) */}
      {showFilters && (
        <FilterBar
          colorScheme={colorScheme}
          filters={filterOptions}
          selectedFilters={selectedFilters}
          onFilterSelect={handleFilterSelect}
        />
      )}
      
      {/* Lista de vinos */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.accent} />
        </View>
      ) : (
        <FlatList
          data={filteredWines}
          renderItem={renderWineItem}
          keyExtractor={item => item.id}
          numColumns={isGridView ? 2 : 1}
          contentContainerStyle={isGridView ? styles.gridList : styles.listView}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyComponent}
          ListFooterComponent={<View style={{ height: 20 }} />}
          key={isGridView ? 'grid' : 'list'} // Forzar re-render al cambiar de vista
        />
      )}
      
      {/* Modal de ordenación */}
      <SortModal
        visible={showSortModal}
        onClose={() => setShowSortModal(false)}
        colorScheme={colorScheme}
        sortOptions={sortOptions}
        selectedSort={selectedSort}
        onSelectSort={setSelectedSort}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gridList: {
    paddingHorizontal: 10,
  },
  listView: {
    paddingTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    margin: 20,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  emptyButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  emptyButtonText: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    color: '#FFF',
  },
}); 