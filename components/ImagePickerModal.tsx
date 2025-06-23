import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { WINE_COLORS } from '@/components/wine/WineColors';
import Animated, { FadeIn, FadeInDown, SlideInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onCamera: () => void;
  onGallery: () => void;
}

export function ImagePickerModal({ visible, onClose, onCamera, onGallery }: ImagePickerModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = WINE_COLORS[colorScheme];

  const handleCamera = () => {
    onClose();
    onCamera();
  };

  const handleGallery = () => {
    onClose();
    onGallery();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Animated.View 
        entering={FadeIn.duration(200)}
        style={styles.overlay}
      >
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        <Animated.View 
          entering={SlideInDown.duration(300).delay(100)}
          style={[styles.modal, { backgroundColor: theme.card }]}
        >
          {/* Handle Bar */}
          <View style={styles.handleBar} />
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>
              Seleccionar Foto
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Elige cómo quieres seleccionar tu foto de perfil
            </Text>
          </View>

          {/* Options */}
          <View style={styles.options}>
            <TouchableOpacity 
              style={[styles.option, { backgroundColor: theme.background }]}
              onPress={handleCamera}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: theme.burgundy }]}>
                <Ionicons name="camera" size={24} color="white" />
              </View>
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, { color: theme.text }]}>
                  Cámara
                </Text>
                <Text style={[styles.optionSubtitle, { color: theme.textSecondary }]}>
                  Tomar una nueva foto
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.option, { backgroundColor: theme.background }]}
              onPress={handleGallery}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: theme.burgundy }]}>
                <Ionicons name="images" size={24} color="white" />
              </View>
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, { color: theme.text }]}>
                  Galería
                </Text>
                <Text style={[styles.optionSubtitle, { color: theme.textSecondary }]}>
                  Elegir de la galería
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Cancel Button */}
          <TouchableOpacity 
            style={[styles.cancelButton, { backgroundColor: theme.background }]}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={[styles.cancelText, { color: theme.textSecondary }]}>
              Cancelar
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  modal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingBottom: 40,
    paddingHorizontal: 20,
    maxHeight: '50%',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(128, 0, 32, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  options: {
    gap: 12,
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 32, 0.1)',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
  },
  cancelButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
  },
}); 