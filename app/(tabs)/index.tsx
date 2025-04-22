import React from 'react';
import { Image, StyleSheet, ScrollView, View, Text, TouchableOpacity, Dimensions, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

import { useAuth } from '@/contexts/AuthContext';
import { useAppSelector } from '@/store';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const SCREEN_WIDTH = Dimensions.get('window').width;

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
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { user, logout } = useAuth();
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.primary }}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabecera con saludo */}
        <Animated.View 
          entering={FadeInDown.duration(600).delay(100)} 
          style={styles.header}
        >
          <View>
            <Text style={[styles.greetingSecondary, { color: Colors[colorScheme ?? 'light'].text }]}>
              Bienvenido
            </Text>
            <Text style={[styles.greetingPrimary, { color: Colors[colorScheme ?? 'light'].text }]}>
              Hola {userName}
            </Text>
          </View>
          
          <TouchableOpacity onPress={() => {}} style={styles.profileButton}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100' }} 
              style={styles.profileImage} 
            />
          </TouchableOpacity>
        </Animated.View>
        
        {/* Sección de recomendaciones */}
        <Animated.View 
          entering={FadeInDown.duration(600).delay(200)}
          style={styles.section}
        >
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Recomendaciones para ti
          </Text>
          <Text style={[styles.sectionSubtitle, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
            Basadas en tus gustos anteriores
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
                <TouchableOpacity 
                  style={[styles.recommendationCard, { backgroundColor: theme.card }]}
                  activeOpacity={0.9}
                  onPress={() => {}}
                >
                  <Image source={{ uri: wine.image }} style={styles.recommendationImage} />
                  
                  <BlurView 
                    intensity={90} 
                    tint={colorScheme === 'dark' ? 'dark' : 'light'}
                    style={styles.recommendationInfo}
                  >
                    <View>
                      <Text style={[styles.recommendationName, { color: Colors[colorScheme ?? 'light'].text }]}>
                        {wine.name}
                      </Text>
                      <Text style={[styles.recommendationDetails, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                        {wine.winery} • {wine.year}
                      </Text>
                    </View>
                    <View style={styles.matchContainer}>
                      <Text style={[styles.matchText, { color: theme.accent }]}>
                        {wine.match}%
                      </Text>
                      <Text style={[styles.matchLabel, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                        match
                      </Text>
                    </View>
                  </BlurView>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>
        
        {/* Sección de vino guardado con contador */}
        <Animated.View 
          entering={FadeInDown.duration(600).delay(400)}
          style={styles.section}
        >
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Tu colección
          </Text>
          <Text style={[styles.sectionSubtitle, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
            {wines.length > 0 ? `${wines.length} vinos en tu bodega` : 'Comienza a añadir vinos a tu bodega'}
          </Text>
          
          <TouchableOpacity 
            style={[styles.savedWineCard, { backgroundColor: theme.card }]}
            activeOpacity={0.9}
            onPress={() => router.navigate("/(tabs)/cellar")}
          >
            {savedWine ? (
              <>
                <View style={styles.savedWineImageContainer}>
                  <Image source={{ uri: savedWine.image }} style={styles.savedWineImage} />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.savedWineGradient}
                  />
                </View>
                
                <View style={styles.savedWineContent}>
                  <View>
                    <Text style={styles.savedWineName}>{savedWine.name}</Text>
                    <Text style={styles.savedWineDetails}>
                      {savedWine.winery} • {savedWine.year}
                    </Text>
                  </View>
                  
                  <View style={[styles.countdownContainer, { backgroundColor: theme.accent }]}>
                    <Text style={styles.countdownTitle}>Listo para tomar en</Text>
                    <Text style={styles.countdownValue}>
                      {savedWine.daysToOptimal} días
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.emptyWineCollection}>
                <MaterialIcons name="wine-bar" size={40} color={Colors[colorScheme ?? 'light'].tabIconDefault} />
                <Text style={[styles.emptyWineText, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Añade tu primer vino
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
        
        {/* Sección de exploración con IA */}
        <Animated.View 
          entering={FadeInDown.duration(600).delay(600)}
          style={[styles.section, styles.aiExploreSection]}
        >
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Explorar con IA
          </Text>
          <Text style={[styles.sectionSubtitle, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
            Descubre nuevos vinos usando inteligencia artificial
          </Text>
          
          <View style={styles.aiButtonsContainer}>
            <TouchableOpacity 
              style={[styles.aiButton, { backgroundColor: theme.accent }]}
              activeOpacity={0.8}
              onPress={() => {}}
            >
              <FontAwesome name="camera" size={24} color="#FFF" />
              <Text style={styles.aiButtonText}>Explorar con foto</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.aiButton, { backgroundColor: colorScheme === 'dark' ? '#3D3647' : '#333' }]}
              activeOpacity={0.8}
              onPress={() => {}}
            >
              <FontAwesome name="magic" size={24} color="#FFF" />
              <Text style={styles.aiButtonText}>Descubrir con IA</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  greetingPrimary: {
    fontSize: 28,
    fontFamily: 'Montserrat-Bold',
  },
  greetingSecondary: {
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
    opacity: 0.7,
  },
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
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
  recommendationCard: {
    width: SCREEN_WIDTH * 0.65,
    height: 180,
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  recommendationImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  recommendationInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  recommendationName: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
  recommendationDetails: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
  },
  matchContainer: {
    alignItems: 'center',
  },
  matchText: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
  },
  matchLabel: {
    fontSize: 10,
    fontFamily: 'Montserrat-Regular',
  },
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
  aiExploreSection: {
    marginBottom: 40,
  },
  aiButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  aiButton: {
    flex: 1,
    margin: 8,
    height: 100,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  aiButtonText: {
    marginTop: 8,
    color: '#fff',
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
  },
});
