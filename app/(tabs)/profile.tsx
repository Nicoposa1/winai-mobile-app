import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  useColorScheme as RNUseColorScheme
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { useAppSelector } from '@/store';
import { useColorScheme } from '@/hooks/useColorScheme';
import { WINE_COLORS } from '@/components/wine/WineColors';
import { StatsCard } from '@/components/profile/StatsCard';
import { ProfileOption } from '@/components/profile/ProfileOption';
import { useAuth } from '@/contexts/AuthContext';

// Datos de ejemplo del usuario (en una app real, vendrían de un contexto o estado global)
const mockUser = {
  name: "Nicolás Posa",
  email: "nicolas.posa@example.com",
  photoUrl: "https://randomuser.me/api/portraits/men/32.jpg",
};

// Interfaz para el tema
interface WineTheme {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  textLight: string;
  input: string;
  burgundy: string;
  burgundyLight: string;
  burgundyDark: string;
  gold: string;
  surface: string;
  border: string;
}

// Gráfico de distribución de tipos de vino (simplificado)
interface WineDistribution {
  type: string;
  percentage: number;
  color: string;
}

const wineDistribution: WineDistribution[] = [
  { type: 'red', percentage: 60, color: '#800020' },
  { type: 'white', percentage: 25, color: '#F5EFD5' },
  { type: 'rose', percentage: 10, color: '#FFB6C1' },
  { type: 'sparkling', percentage: 5, color: '#E6BE8A' },
];

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const systemColorScheme = colorScheme as 'light' | 'dark';
  const router = useRouter();
  const { wines } = useAppSelector((state) => state.wine);
  const {logout} = useAuth();
  
  // Seleccionar los colores del tema
  const theme = WINE_COLORS[systemColorScheme] as WineTheme;
  
  // Datos de estadísticas
  const totalWines = wines.length;
  const tastedWines = wines.filter(wine => wine.hasTasted).length;
  const favoriteWines = wines.filter(wine => wine.isFavorite).length;
  
  // Función para manejar la opción de editar perfil
  const handleEditProfile = () => {
    Alert.alert("Editar Perfil", "Esta función estará disponible próximamente.");
  };
  
  // Función para simular cierre de sesión
  const handleLogout = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro que deseas cerrar sesión?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Cerrar Sesión",
          style: "destructive",
          onPress: () => logout()
        }
      ]
    );
  };
  
  // Función para simular eliminación de cuenta
  const handleDeleteAccount = () => {
    Alert.alert(
      "Eliminar Cuenta",
      "¿Estás seguro que deseas eliminar tu cuenta? Esta acción no se puede deshacer.",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => console.log("Usuario eliminó su cuenta")
        }
      ]
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Sección superior: Foto y datos del usuario */}
        <Animated.View 
          style={styles.profileHeader}
          entering={FadeIn.duration(500)}
        >
          <View style={styles.profilePhotoContainer}>
            <LinearGradient
              colors={[WINE_COLORS.goldLight, theme.gold]}
              style={styles.photoBorder}
            >
              <Image 
                source={{ uri: mockUser.photoUrl }} 
                style={styles.profilePhoto} 
              />
            </LinearGradient>
          </View>
          
          <Text style={[styles.userName, { color: theme.text }]}>
            {mockUser.name}
          </Text>
          
          <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
            {mockUser.email}
          </Text>
          
          <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: theme.burgundy }]}
            onPress={handleEditProfile}
          >
            <Text style={styles.editButtonText}>Editar Perfil</Text>
          </TouchableOpacity>
        </Animated.View>
        
        {/* Sección de estadísticas */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Estadísticas
        </Text>
        
        <View style={styles.statsContainer}>
          <StatsCard 
            icon="glass" 
            value={totalWines} 
            label="Vinos" 
            colorScheme={systemColorScheme}
            delay={100}
          />
          <StatsCard 
            icon="check-circle" 
            value={tastedWines} 
            label="Probados" 
            colorScheme={systemColorScheme}
            iconType="MaterialIcons"
            delay={200}
          />
          <StatsCard 
            icon="heart" 
            value={favoriteWines} 
            label="Favoritos" 
            colorScheme={systemColorScheme}
            delay={300}
          />
        </View>
        
        {/* Gráfico de distribución de vinos */}
        <Animated.View 
          style={[styles.distributionContainer, { backgroundColor: theme.card }]}
          entering={FadeInDown.delay(400).duration(400)}
        >
          <Text style={[styles.distributionTitle, { color: theme.text }]}>
            Distribución de Vinos
          </Text>
          
          <View style={styles.distributionChart}>
            {wineDistribution.map((item, index) => (
              <View key={item.type} style={styles.distributionItem}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                  <Text style={[styles.legendText, { color: theme.textSecondary }]}>
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </Text>
                </View>
                <View style={styles.barContainer}>
                  <View 
                    style={[
                      styles.bar, 
                      { 
                        width: `${item.percentage}%`,
                        backgroundColor: item.color 
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.percentageText, { color: theme.text }]}>
                  {item.percentage}%
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>
        
        {/* Opciones del perfil */}
        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 30 }]}>
          Configuración
        </Text>
        
        <View style={styles.optionsContainer}>
          <ProfileOption 
            icon="person" 
            label="Editar información personal"
            onPress={() => Alert.alert("Editar información", "Esta función estará disponible próximamente.")}
            colorScheme={systemColorScheme}
            delay={100}
          />
          
          <ProfileOption 
            icon="notifications" 
            label="Preferencias de notificación"
            onPress={() => Alert.alert("Notificaciones", "Esta función estará disponible próximamente.")}
            colorScheme={systemColorScheme}
            delay={200}
          />
          
          <ProfileOption 
            icon="auto-awesome" 
            label="Configuración de AI"
            onPress={() => Alert.alert("Configuración de IA", "Esta función estará disponible próximamente.")}
            colorScheme={systemColorScheme}
            delay={300}
          />
          
          <ProfileOption 
            icon="language" 
            label="Idioma de la app"
            onPress={() => Alert.alert("Cambiar idioma", "Esta función estará disponible próximamente.")}
            colorScheme={systemColorScheme}
            delay={400}
          />
          
          <ProfileOption 
            icon="logout" 
            label="Cerrar sesión"
            onPress={handleLogout}
            colorScheme={systemColorScheme}
            delay={500}
          />
          
          <ProfileOption 
            icon="delete-forever" 
            label="Eliminar cuenta"
            onPress={handleDeleteAccount}
            colorScheme={systemColorScheme}
            isDestructive={true}
            delay={600}
          />
        </View>
        
        {/* Versión de la aplicación */}
        <Text style={[styles.versionText, { color: theme.textSecondary }]}>
          Versión 1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  profilePhotoContainer: {
    marginBottom: 16,
  },
  photoBorder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    marginBottom: 20,
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  distributionContainer: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  distributionTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 16,
  },
  distributionChart: {
    width: '100%',
  },
  distributionItem: {
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
  },
  barContainer: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 12,
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'right',
  },
  optionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    marginTop: 10,
  },
}); 