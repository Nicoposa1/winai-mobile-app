import React from 'react';
import { StyleSheet, ScrollView, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/AuthContext';
import { useAppSelector } from '@/store';
import { useColorScheme } from '@/hooks/useColorScheme';

// Componentes
import { Header } from '@/components/home/Header';
import { RecommendationsSection } from '@/components/home/RecommendationsSection';
import { WineCollectionSection } from '@/components/home/WineCollectionSection';
import { AIExploreSection } from '@/components/home/AIExploreSection';

// Nuevos colores para el fondo y elementos
const BACKGROUND_COLORS = {
  light: {
    primary: '#F8F5F2', // Beige claro elegante
    secondary: '#F9F1E8', // Beige más cálido para tarjetas
    card: '#FFFFFF', // Blanco para tarjetas
    accent: '#800020', // Vino tinto (se mantiene)
  },
  dark: {
    primary: '#1E1B1E', // Gris muy oscuro con toque púrpura
    secondary: '#262329', // Gris oscuro para tarjetas
    card: '#2D2730', // Gris oscuro ligeramente púrpura para tarjetas
    accent: '#9A2846', // Vino tinto ligeramente más claro para modo oscuro
  }
};

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { user } = useAuth();
  const { wines } = useAppSelector(state => state.wine);
  
  // Colores según el tema
  const theme = BACKGROUND_COLORS[colorScheme ?? 'light'];
  
  // Nombre del usuario (podría venir del contexto de autenticación)
  const userName = user?.displayName || 'Nico';
  
  // Datos simulados para recomendaciones
  const recommendations = [
    {
      id: '1',
      name: 'Malbec Reserva',
      winery: 'Bodega Catena Zapata',
      year: 2018,
      image: 'https://images.unsplash.com/photo-1586370434639-0fe43b2d32e6?q=80&w=500',
      match: 98,
    },
    {
      id: '2',
      name: 'Pinot Noir',
      winery: 'Bodega Chacra',
      year: 2019,
      image: 'https://images.unsplash.com/photo-1569919659476-f0852f6834b7?q=80&w=500',
      match: 95,
    },
    {
      id: '3',
      name: 'Cabernet Sauvignon',
      winery: 'Viña Cobos',
      year: 2017,
      image: 'https://images.unsplash.com/photo-1569919659476-f0852f6834b7?q=80&w=500',
      match: 93,
    },
  ];
  
  // Datos simulados para un vino guardado con contador
  const savedWine = {
    id: 'saved1',
    name: 'Merlot Gran Reserva',
    winery: 'Bodega Norton',
    year: 2016,
    image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=500',
    daysToOptimal: 14, // días para alcanzar el punto óptimo de consumo
  };
  
  // Handlers
  const handleProfilePress = () => {
    // Implementar navegación al perfil
  };
  
  const handleRecommendationPress = (id: string) => {
    // Implementar navegación al detalle del vino recomendado
    console.log(`Pressed recommendation: ${id}`);
  };
  
  const handleWineCollectionPress = () => {
    router.navigate("/(tabs)/cellar");
  };
  
  const handleCameraPress = () => {
    // Implementar exploración con cámara
  };
  
  const handleAIDiscoverPress = () => {
    // Implementar descubrimiento con IA
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.primary }}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabecera con saludo */}
        <Header
          userName={userName}
          colorScheme={colorScheme}
          onProfilePress={handleProfilePress}
        />
        
        {/* Sección de recomendaciones */}
        <RecommendationsSection
          title="Recomendaciones para ti"
          subtitle="Basadas en tus gustos anteriores"
          recommendations={recommendations}
          colorScheme={colorScheme}
          themeColors={{
            card: theme.card,
            accent: theme.accent
          }}
          onRecommendationPress={handleRecommendationPress}
        />
        
        {/* Sección de vino guardado con contador */}
        <WineCollectionSection
          title="Tu colección"
          subtitle=""
          wine={savedWine}
          wineCount={wines.length}
          colorScheme={colorScheme}
          themeColors={{
            card: theme.card,
            accent: theme.accent
          }}
          onPress={handleWineCollectionPress}
        />
        
        {/* Sección de exploración con IA */}
        <AIExploreSection
          title="Explorar con IA"
          subtitle="Descubre nuevos vinos usando inteligencia artificial"
          colorScheme={colorScheme}
          themeColors={{
            accent: theme.accent
          }}
          onCameraPress={handleCameraPress}
          onAIDiscoverPress={handleAIDiscoverPress}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
});
