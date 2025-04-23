import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Dimensions, 
  Modal,
  BackHandler,
  Pressable,
  Platform
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence, 
  withDelay,
  Easing,
  FadeIn,
  ZoomIn,
  withSpring
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { WINE_COLORS } from './WineColors';

// Theme interface
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

interface SuccessAnimationProps {
  visible: boolean;
  message: string;
  subMessage?: string;
  colorScheme?: 'light' | 'dark';
  onClose: () => void;
  autoClose?: boolean;
  autoCloseTime?: number;
}

export function SuccessAnimation({
  visible,
  message,
  subMessage,
  colorScheme = 'light',
  onClose,
  autoClose = true,
  autoCloseTime = 5000  // Aumentado a 5 segundos
}: SuccessAnimationProps) {
  // Estado local para manejo más directo de la visibilidad
  const [isVisible, setIsVisible] = useState(false);
  const [canClose, setCanClose] = useState(false);
  const theme = WINE_COLORS[colorScheme as keyof typeof WINE_COLORS] as WineTheme;
  
  // Sincronizar el estado local con la prop
  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      
      // Permitir cerrar después de un retraso para evitar cierres accidentales
      setTimeout(() => {
        setCanClose(true);
      }, 800);
    } else {
      // Si la prop visible cambia a false, también actualizar el estado local
      setIsVisible(false);
      setCanClose(false);
    }
  }, [visible]);
  
  // Prevenir la navegación con el botón de retroceso
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isVisible) {
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [isVisible]);
  
  // Gestionar el cierre automático
  useEffect(() => {
    if (!isVisible || !autoClose) return;
    
    const timer = setTimeout(() => {
      if (isVisible) {
        handleClose();
      }
    }, autoCloseTime);
    
    return () => clearTimeout(timer);
  }, [isVisible, autoClose, autoCloseTime]);
  
  // Función para manejar el cierre
  const handleClose = () => {
    if (!canClose) return;
    
    setIsVisible(false);
    setCanClose(false);
    
    // Dar tiempo adicional para que termine la animación de salida
    // antes de la navegación
    setTimeout(() => {
      onClose();
    }, 500);
  };
  
  // Si no debe ser visible, no renderizar nada
  if (!isVisible) return null;

  return (
    <Modal
      transparent
      visible={true}
      statusBarTranslucent
      hardwareAccelerated
      onRequestClose={() => canClose && handleClose()}
      animationType="fade"
    >
      <Pressable 
        style={styles.modalOverlay}
        onPress={() => canClose && handleClose()}
      >
        <Pressable>
          <Animated.View 
            style={[
              styles.container, 
              { backgroundColor: theme.background }
            ]}
            entering={ZoomIn.duration(400).springify()}
          >
            <Animated.View 
              style={styles.iconContainer}
              entering={FadeIn.delay(200).duration(400)}
            >
              <LinearGradient
                colors={[theme.burgundyLight, theme.burgundy]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconGradient}
              >
                <FontAwesome name="check" size={36} color="white" />
              </LinearGradient>
            </Animated.View>
            
            <Animated.Text 
              style={[styles.title, { color: theme.text }]}
              entering={FadeIn.delay(300).duration(400)}
            >
              {message}
            </Animated.Text>
            
            {subMessage && (
              <Animated.Text 
                style={[styles.subtitle, { color: theme.textSecondary }]}
                entering={FadeIn.delay(400).duration(400)}
              >
                {subMessage}
              </Animated.Text>
            )}
            
            <Animated.View
              entering={FadeIn.delay(500).duration(400)}
            >
              <TouchableOpacity 
                style={[styles.button, { backgroundColor: theme.burgundy }]}
                onPress={handleClose}
                activeOpacity={0.7}
                disabled={!canClose}
              >
                <Text style={styles.buttonText}>Continuar</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Platform.OS === 'ios' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.8)',
  },
  container: {
    width: Dimensions.get('window').width * 0.85,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: 'white',
  }
}); 