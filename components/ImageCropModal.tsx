import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { WINE_COLORS } from '@/components/wine/WineColors';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import * as ImageManipulator from 'expo-image-manipulator';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ImageCropModalProps {
  visible: boolean;
  imageUri: string | null;
  onClose: () => void;
  onCropComplete: (croppedUri: string) => void;
  onRetakePhoto: () => void;
}

export function ImageCropModal({ visible, imageUri, onClose, onCropComplete, onRetakePhoto }: ImageCropModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = WINE_COLORS[colorScheme];
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [translateY, setTranslateY] = useState(0);
  const cropFrameSize = screenWidth - 80;

  useEffect(() => {
    if (imageUri) {
      Image.getSize(imageUri, (width, height) => {
        setImageSize({ width, height });
        // Reset position when new image loads
        setTranslateY(0);
      });
    }
  }, [imageUri]);

  // Calculate the scale and bounds for the image
  const getImageDisplayInfo = () => {
    if (!imageSize.width || !imageSize.height) return { scale: 1, maxTranslate: 0 };
    
    const scale = cropFrameSize / Math.min(imageSize.width, imageSize.height);
    const scaledHeight = imageSize.height * scale;
    const maxTranslate = Math.max(0, (scaledHeight - cropFrameSize) / 2);
    
    return { scale, maxTranslate };
  };

  const { scale, maxTranslate } = getImageDisplayInfo();

  // PanResponder for dragging
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      const newY = translateY + gestureState.dy;
      const clampedY = Math.max(-maxTranslate, Math.min(maxTranslate, newY));
      setTranslateY(clampedY);
    },
    onPanResponderRelease: () => {
      // Keep the current position
    },
  });

  const cropImage = async () => {
    if (!imageUri) return;

    setIsProcessing(true);
    try {
      const { scale } = getImageDisplayInfo();
      const currentTranslateY = translateY;
      
      // Convert screen coordinates to image coordinates
      const imageScale = 1 / scale;
      const cropSize = cropFrameSize * imageScale;
      const cropX = (imageSize.width - cropSize) / 2;
      const cropY = (imageSize.height - cropSize) / 2 - (currentTranslateY * imageScale);

      // Crop and resize the image
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          {
            crop: {
              originX: Math.max(0, cropX),
              originY: Math.max(0, Math.min(imageSize.height - cropSize, cropY)),
              width: cropSize,
              height: cropSize,
            },
          },
          {
            resize: {
              width: 400,
              height: 400,
            },
          },
        ],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      onCropComplete(manipulatedImage.uri);
      onClose();
    } catch (error) {
      console.error('Error cropping image:', error);
      Alert.alert('Error', 'No se pudo recortar la imagen');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetakePhoto = () => {
    onRetakePhoto();
    onClose();
  };

  if (!imageUri) return null;

  return (
    <Modal visible={visible} animationType="fade" presentationStyle="fullScreen">
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Animated.View 
          entering={FadeIn.duration(200)}
          style={styles.content}
        >
          {/* Header */}
          <Animated.View 
            entering={SlideInDown.duration(300)}
            style={[styles.header, { backgroundColor: theme.card }]}
          >
            <TouchableOpacity style={styles.headerButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              Ajustar Foto
            </Text>
            <View style={styles.headerButton} />
          </Animated.View>

          {/* Image Preview */}
          <View style={styles.imageContainer}>
            <View style={[styles.cropFrame, { borderColor: theme.burgundy }]}>
              <View 
                style={[
                  styles.imageWrapper, 
                  { transform: [{ translateY }] }
                ]}
                {...panResponder.panHandlers}
              >
                <Image 
                  source={{ uri: imageUri }} 
                  style={[
                    styles.image, 
                    { 
                      width: imageSize.width * scale,
                      height: imageSize.height * scale,
                    }
                  ]} 
                />
              </View>
              <View style={[styles.cropOverlay, { borderColor: theme.burgundy }]} />
            </View>

          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton, { backgroundColor: theme.background, borderColor: theme.burgundy }]}
              onPress={handleRetakePhoto}
              disabled={isProcessing}
            >
              <Ionicons name="camera" size={18} color={theme.burgundy} style={{ marginRight: 8 }} />
              <Text style={[styles.secondaryButtonText, { color: theme.burgundy }]}>
                Tomar Otra
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton, { backgroundColor: theme.burgundy }]}
              onPress={cropImage}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  Guardar
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cropFrame: {
    position: 'relative',
    width: screenWidth - 80,
    height: screenWidth - 80,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    marginBottom: 20,
  },
  imageWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    resizeMode: 'cover',
  },
  cropOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderRadius: 18,
    borderStyle: 'dashed',
  },

  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  primaryButton: {
    // backgroundColor set dynamically
  },
  secondaryButton: {
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
  },
}); 