import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { WINE_COLORS } from '@/components/wine/WineColors';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

interface CameraModalProps {
  visible: boolean;
  onClose: () => void;
  onPhotoTaken: (uri: string) => void;
}

export function CameraModal({ visible, onClose, onPhotoTaken }: CameraModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = WINE_COLORS[colorScheme];
  const [facing, setFacing] = useState<CameraType>('front');
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  
  // Calcular el tamaño del recuadro de captura
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const cropSize = Math.min(screenWidth - 60, 280); // Tamaño óptimo para foto de perfil
  const cropTop = (screenHeight - cropSize) / 2 - 40; // Centrado verticalmente, ajustado por header

  const handleClose = () => {
    setIsCapturing(false);
    onClose();
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const takePicture = async () => {
    if (!cameraRef.current || isCapturing) return;

    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (photo?.uri) {
        onPhotoTaken(photo.uri);
        handleClose();
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    } finally {
      setIsCapturing(false);
    }
  };

  if (!permission) {
    // Camera permissions are still loading
    return null;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.permissionContainer}>
          <Animated.View 
            entering={FadeIn.duration(200)}
            style={[styles.permissionModal, { backgroundColor: theme.card }]}
          >
            <Ionicons name="camera-outline" size={64} color={theme.burgundy} />
            <Text style={[styles.permissionTitle, { color: theme.text }]}>
              Permisos de Cámara
            </Text>
            <Text style={[styles.permissionMessage, { color: theme.textSecondary }]}>
              Necesitamos acceso a tu cámara para tomar fotos de perfil
            </Text>
            <View style={styles.permissionButtons}>
              <TouchableOpacity
                style={[styles.permissionButton, { backgroundColor: theme.burgundy }]}
                onPress={requestPermission}
              >
                <Text style={styles.permissionButtonText}>Conceder Permiso</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: theme.background }]}
                onPress={handleClose}
              >
                <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={styles.container}>
        <CameraView 
          ref={cameraRef}
          style={styles.camera} 
          facing={facing}
          animateShutter={true}
        >
          {/* Header */}
          <Animated.View 
            entering={SlideInDown.duration(300)}
            style={styles.header}
          >
            <TouchableOpacity style={styles.headerButton} onPress={handleClose}>
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Tomar Foto</Text>
            <TouchableOpacity style={styles.headerButton} onPress={toggleCameraFacing}>
              <Ionicons name="camera-reverse" size={28} color="white" />
            </TouchableOpacity>
          </Animated.View>

          {/* Recuadro de captura */}
          <View style={styles.cropOverlayContainer}>
            {/* Marco del recuadro */}
            <View 
              style={[
                styles.cropFrame,
                {
                  width: cropSize,
                  height: cropSize,
                  top: cropTop,
                  left: (screenWidth - cropSize) / 2,
                }
              ]}
            />
            
            {/* Texto instructivo */}
            <View style={[styles.instructionContainer, { top: cropTop + cropSize + 20 }]}>
              <Text style={styles.instructionText}>
                Posiciona tu rostro dentro del recuadro
              </Text>
            </View>
          </View>

          {/* Camera Controls */}
          <View style={styles.controls}>
            <View style={styles.captureContainer}>
              <TouchableOpacity
                style={[
                  styles.captureButton,
                  isCapturing && styles.captureButtonDisabled
                ]}
                onPress={takePicture}
                disabled={isCapturing}
              >
                {isCapturing ? (
                  <ActivityIndicator size="large" color="white" />
                ) : (
                  <View style={styles.captureButtonInner} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureContainer: {
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  // Permission styles
  permissionContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionModal: {
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    maxWidth: 350,
    width: '100%',
  },
  permissionTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat-SemiBold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  permissionMessage: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  permissionButtons: {
    width: '100%',
    gap: 12,
  },
  permissionButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
  cancelButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
  },
  // Crop overlay styles
  cropOverlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  cropFrame: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
  },

  instructionContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },

}); 