import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ColorSchemeName,
  ScrollView,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome, MaterialIcons, Ionicons } from '@expo/vector-icons';
import Animated, { 
  FadeIn, 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  Easing,
  withSequence,
  withRepeat,
  interpolateColor
} from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import { useTheme } from '@react-navigation/native';

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
  const theme = WINE_COLORS[colorScheme as keyof typeof WINE_COLORS] as WineTheme;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Enhanced animated values for progress bar
  const progressWidth = useSharedValue(0);
  const progressOpacity = useSharedValue(0.7);
  const progressScale = useSharedValue(1);
  
  const { colors } = useTheme();
  
  useEffect(() => {
    // Animate the progress width when progress changes
    progressWidth.value = withTiming(progress / 100, {
      duration: 600,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    
    // Add pulse effect when progress changes
    progressOpacity.value = withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(0.7, { duration: 400 })
    );
    
    progressScale.value = withSequence(
      withTiming(1.03, { duration: 200 }),
      withTiming(1, { duration: 400 })
    );
  }, [progress]);
  
  // Enhanced animated style for progress bar
  const progressAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progressWidth.value * 100}%`,
      backgroundColor: interpolateColor(
        progressWidth.value,
        [0, 0.5, 1],
        [theme.burgundyLight, theme.burgundy, theme.burgundyDark]
      ),
      height: '100%',
      borderRadius: 8,
      opacity: progressOpacity.value,
      transform: [{ scaleX: progressScale.value }],
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

  const getProgressText = () => {
    if (progress < 20) {
      return "Identifying bottle...";
    } else if (progress < 40) {
      return "Analyzing label...";
    } else if (progress < 60) {
      return "Recognizing vintage...";
    } else if (progress < 80) {
      return "Determining wine characteristics...";
    } else {
      return "Finalizing analysis...";
    }
  };

  const getProgressIcon = () => {
    if (progress < 20) {
      return "wine";
    } else if (progress < 40) {
      return "text";
    } else if (progress < 60) {
      return "calendar";
    } else if (progress < 80) {
      return "color-palette";
    } else {
      return "checkmark-circle";
    }
  };

  if (isAnalyzing && image) {
    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        style={[styles.aiAnalyzingContainer, { backgroundColor: theme.background }]}
      >
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: image }} style={styles.imagePreview} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.imageGradient}
          />
          <View style={styles.analyzeOverlay}>
            <ActivityIndicator size="large" color={theme.burgundy} />
            <Text style={styles.analyzeText}>
              AI analyzing your wine...
            </Text>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressInfoContainer}>
                <View style={styles.progressHeaderContainer}>
                  <Text style={[styles.progressPercentage, { color: theme.text }]}>
                    {Math.round(progress)}%
                  </Text>
                  <Animated.View style={styles.progressIconContainer}>
                    <Ionicons name={getProgressIcon() as any} size={18} color={theme.burgundy} />
                  </Animated.View>
                </View>
                
                <Text style={[styles.progressText, { color: theme.textSecondary }]}>
                  {getProgressText()}
                </Text>
              </View>
              
              <View style={styles.progressBarContainer}>
                <Animated.View style={progressAnimatedStyle} />
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: theme.burgundyLight }]}
          onPress={() => {
            setIsAnalyzing(false);
            onCancel();
          }}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Si hay un error, mostrar mensaje
  if (error && !isAnalyzing) {
    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        style={[styles.aiContainer, { backgroundColor: theme.background }]}
      >
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color={WINE_COLORS.error} />
          <Text style={[styles.errorTitle, { color: theme.text }]}>
            No se pudo analizar la imagen
          </Text>
          <Text style={[styles.errorMessage, { color: theme.textSecondary }]}>
            {error}
          </Text>

          <TouchableOpacity
            style={[styles.tryAgainButton, { backgroundColor: theme.burgundy }]}
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
      style={[styles.aiContainer, { backgroundColor: theme.background }]}
    >
      <Text style={[styles.aiTitle, { color: theme.text }]}>
        Identifica tu vino con IA
      </Text>
      <Text style={[styles.aiDescription, { color: theme.textSecondary }]}>
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
            colors={[theme.burgundy, colorScheme === 'dark' ? '#85263D' : WINE_COLORS.burgundyLight]}
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
        <View style={[styles.aiDividerLine, { backgroundColor: theme.border }]} />
        <Text style={[styles.aiDividerText, { color: theme.textSecondary }]}>o</Text>
        <View style={[styles.aiDividerLine, { backgroundColor: theme.border }]} />
      </View>

      <TouchableOpacity
        style={styles.manualEntryButton}
        onPress={onCancel}
      >
        <Text style={[styles.manualEntryText, { color: theme.burgundy }]}>
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
    marginHorizontal: 10,
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
  },
  manualEntryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  manualEntryText: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
  // Estilos para el analizador de IA
  aiAnalyzingContainer: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 0,
  },
  imagePreviewContainer: {
    flex: 1,
    position: 'relative',
  },
  imagePreview: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  analyzeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    alignItems: 'center',
  },
  analyzeText: {
    fontSize: 22,
    fontFamily: 'Montserrat-Bold',
    color: 'white',
    marginVertical: 16,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    marginTop: 20,
    marginBottom: 10,
  },
  progressInfoContainer: {
    marginBottom: 10,
  },
  progressHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  progressIconContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: 6,
  },
  progressPercentage: {
    fontSize: 28,
    fontFamily: 'Montserrat-Bold',
    color: 'white',
  },
  progressText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
    color: 'rgba(255,255,255,0.8)',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    overflow: 'hidden',
    width: '100%',
  },
  cancelButton: {
    marginVertical: 20,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
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