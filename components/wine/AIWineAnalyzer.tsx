import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ColorSchemeName,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';

import { WINE_COLORS } from './WineColors';
import { analyzeWineImage, WineAnalysisResponse } from '../../services/imageService';

// Interfaz para los resultados del análisis de IA
export interface AIWineAnalysisResult {
  name: string;
  winery: string;
  year: string;
  type: 'red' | 'white' | 'rose' | 'sparkling' | 'other';
  country: string;
  region: string;
  imageUri: string;
}

interface AIWineAnalyzerProps {
  onAnalysisComplete: (results: AIWineAnalysisResult) => void;
  onCancel: () => void;
  colorScheme?: ColorSchemeName;
}

export function AIWineAnalyzer({
  onAnalysisComplete,
  onCancel,
  colorScheme = 'light'
}: AIWineAnalyzerProps) {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<WineAnalysisResponse | null>(null);

  const themeColors = WINE_COLORS[colorScheme ?? 'light'];
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    // Animate the progress bar when progress changes
    progressWidth.value = withTiming(progress, { duration: 150 });
  }, [progress]);

  const progressAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progressWidth.value}%`,
      backgroundColor: themeColors.gold,
      height: '100%',
      borderRadius: 4,
    };
  });

  // Analizar imagen con IA real
  const analyzeImage = useCallback(async (imageUri: string) => {
    setIsAnalyzing(true);
    setError(null);
    setProgress(0);
    
    // Mostrar progreso artificial para mejorar UX
    const updateProgress = () => {
      setProgress(prev => {
        // Simular hasta 95% para la espera de API
        if (prev < 95) {
          return prev + Math.min(5, (95 - prev) * 0.1);
        }
        return prev;
      });
    };
    
    const progressInterval = setInterval(updateProgress, 300);
    
    try {
      const result = await analyzeWineImage(imageUri);
      
      clearInterval(progressInterval);
      
      if (!result) {
        setError('No se pudo identificar un vino en la imagen. Por favor intenta con otra foto donde se vea claramente la etiqueta de la botella.');
        setIsAnalyzing(false);
        setProgress(0);
        return;
      }
      
      // Análisis completado con éxito
      setProgress(100);
      setAnalysisResult(result);
      
      // Después de mostrar 100%, procesar el resultado
      setTimeout(() => {
        if (imageUri) {
          onAnalysisComplete({
            name: result.name,
            winery: result.winery,
            year: result.year,
            type: result.type,
            country: result.country,
            region: result.region,
            imageUri: imageUri,
          });
        }
      }, 500);
    } catch (error) {
      clearInterval(progressInterval);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error al analizar la imagen:', errorMessage);
      
      // Determinar un mensaje de error más amigable según el tipo de error
      let userFriendlyError = 'Hubo un problema al analizar la imagen.';
      
      if (errorMessage.includes('403')) {
        userFriendlyError = 'Error de permisos al conectar con el servicio de IA. Verifica la clave API.';
      } else if (errorMessage.includes('429')) {
        userFriendlyError = 'Se ha excedido el límite de peticiones a la API. Intenta más tarde.';
      } else if (errorMessage.includes('413')) {
        userFriendlyError = 'La imagen es demasiado grande. Intenta con una imagen más pequeña.';
      } else if (errorMessage.includes('400')) {
        userFriendlyError = 'Formato de imagen no válido o petición incorrecta. Intenta con otra imagen.';
      } else if (errorMessage.includes('404')) {
        userFriendlyError = 'No se pudo conectar con el servicio de IA. Verifica tu conexión a internet.';
      } else if (errorMessage.includes('500') || errorMessage.includes('502') || errorMessage.includes('503')) {
        userFriendlyError = 'El servicio de análisis de IA no está disponible en este momento. Intenta más tarde.';
      }
      
      setError(`${userFriendlyError}\n\nDetalle técnico: ${errorMessage}`);
      setIsAnalyzing(false);
      setProgress(0);
    }
  }, [onAnalysisComplete]);

  // Seleccionar imagen de la galería
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos permiso para acceder a tu galería.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
      analyzeImage(result.assets[0].uri);
    }
  };

  // Tomar foto con la cámara
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos permiso para usar la cámara.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
      analyzeImage(result.assets[0].uri);
    }
  };

  if (isAnalyzing && image) {
    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        style={[styles.aiAnalyzingContainer, { backgroundColor: themeColors.background }]}
      >
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: image }} style={styles.imagePreview} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageGradient}
          />
          <View style={styles.analyzeOverlay}>
            <ActivityIndicator size="large" color={themeColors.gold} />
            <Text style={styles.analyzeText}>
              Analizando imagen...
            </Text>
            <View style={styles.progressBarContainer}>
              <Animated.View style={progressAnimatedStyle} />
            </View>
            <View style={styles.progressInfoContainer}>
              <Text style={styles.progressText}>
                {Math.round(progress)}%
              </Text>
              <Text style={styles.progressSubtext}>
                {progress < 30 ? 'Identificando botella...' :
                  progress < 60 ? 'Analizando etiqueta...' :
                    progress < 90 ? 'Verificando detalles...' :
                      'Finalizando análisis...'}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
            setIsAnalyzing(false);
            setProgress(0);
            onCancel();
          }}
        >
          <Text style={[styles.cancelButtonText, { color: themeColors.burgundy }]}>
            Cancelar
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Si hay un error, mostrar mensaje
  if (error && !isAnalyzing) {
    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        style={[styles.aiContainer, { backgroundColor: themeColors.background }]}
      >
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color={WINE_COLORS.error} />
          <Text style={[styles.errorTitle, { color: themeColors.text }]}>
            No se pudo analizar la imagen
          </Text>
          <Text style={[styles.errorMessage, { color: themeColors.textSecondary }]}>
            {error}
          </Text>

          <TouchableOpacity
            style={[styles.tryAgainButton, { backgroundColor: themeColors.burgundy }]}
            onPress={() => {
              setError(null);
              setImage(null);
            }}
          >
            <Text style={styles.tryAgainText}>Intentar de nuevo</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={[styles.aiContainer, { backgroundColor: themeColors.background }]}
    >
      <Text style={[styles.aiTitle, { color: themeColors.text }]}>
        Identifica tu vino con IA
      </Text>
      <Text style={[styles.aiDescription, { color: themeColors.textSecondary }]}>
        Toma una foto de la etiqueta o botella y nuestra IA identificará los detalles
      </Text>

      <View style={styles.aiButtonsContainer}>
        <TouchableOpacity
          style={[styles.aiButton, {
            shadowColor: colorScheme === 'dark' ? '#000' : '#222'
          }]}
          onPress={takePhoto}
        >
          <LinearGradient
            colors={[themeColors.burgundy, colorScheme === 'dark' ? '#85263D' : WINE_COLORS.burgundyLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.aiButtonGradient}
          >
            <FontAwesome name="camera" size={24} color={WINE_COLORS.white} />
            <Text style={styles.aiButtonText}>Tomar foto</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.aiButton, {
            shadowColor: colorScheme === 'dark' ? '#000' : '#222'
          }]}
          onPress={pickImage}
        >
          <LinearGradient
            colors={[colorScheme === 'dark' ? '#444444' : WINE_COLORS.darkGray, colorScheme === 'dark' ? '#333333' : WINE_COLORS.black]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.aiButtonGradient}
          >
            <FontAwesome name="image" size={24} color={WINE_COLORS.white} />
            <Text style={styles.aiButtonText}>Elegir imagen</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.aiDivider}>
        <View style={[styles.aiDividerLine, { backgroundColor: themeColors.border }]} />
        <Text style={[styles.aiDividerText, { color: themeColors.textSecondary }]}>o</Text>
        <View style={[styles.aiDividerLine, { backgroundColor: themeColors.border }]} />
      </View>

      <TouchableOpacity
        style={styles.manualEntryButton}
        onPress={onCancel}
      >
        <Text style={[styles.manualEntryText, { color: themeColors.burgundy }]}>
          Ingresar datos manualmente
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Estilos para el componente de IA
  aiContainer: {
    padding: 20,
    alignItems: 'center',
  },
  aiTitle: {
    fontSize: 22,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  aiDescription: {
    fontSize: 15,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    marginBottom: 30,
  },
  aiButtonsContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 30,
  },
  aiButton: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  aiButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  aiButtonText: {
    color: WINE_COLORS.white,
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    marginLeft: 10,
  },
  aiDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  aiDividerLine: {
    flex: 1,
    height: 1,
  },
  aiDividerText: {
    paddingHorizontal: 10,
    fontFamily: 'Montserrat-Regular',
  },
  manualEntryButton: {
    padding: 10,
  },
  manualEntryText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
  },
  // Estilos para el analizador de IA
  aiAnalyzingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  imagePreviewContainer: {
    width: '100%',
    height: 350,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  analyzeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  analyzeText: {
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
    color: WINE_COLORS.white,
    marginTop: 15,
    marginBottom: 20,
  },
  progressBarContainer: {
    width: '80%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressInfoContainer: {
    alignItems: 'center',
    marginTop: 5,
  },
  progressText: {
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
    color: WINE_COLORS.white,
    marginBottom: 5,
  },
  progressSubtext: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: WINE_COLORS.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  cancelButton: {
    padding: 15,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
  },
  // Estilos para pantalla de error
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  errorTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    marginTop: 15,
    marginBottom: 10,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    marginBottom: 25,
  },
  tryAgainButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
  },
  tryAgainText: {
    color: WINE_COLORS.white,
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
  },
}); 