import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WINE_COLORS } from '@/components/wine/WineColors';
import { Button } from '@/components/Button';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInDown, 
  SlideOutDown,
  ZoomIn,
  ZoomOut
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface DataExportModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  colorScheme: 'light' | 'dark';
}

export function DataExportModal({ visible, onClose, onConfirm, colorScheme }: DataExportModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const theme = WINE_COLORS[colorScheme];

  const handleConfirm = async () => {
    setIsExporting(true);
    setExportError(null);
    
    try {
      await onConfirm();
      setExportComplete(true);
    } catch (error: any) {
      setExportError(error.message || 'Error al exportar los datos');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    setIsExporting(false);
    setExportComplete(false);
    setExportError(null);
    onClose();
  };

  const renderInitialContent = () => (
    <Animated.View 
      entering={SlideInDown.duration(300)}
      exiting={SlideOutDown.duration(200)}
      style={[styles.modalContent, { backgroundColor: theme.card }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: theme.burgundy }]}>
          <Ionicons name="download" size={32} color="white" />
        </View>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={handleClose}
        >
          <Ionicons name="close" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>
          Exportar Tus Datos
        </Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          Prepararemos un archivo con todos tus datos de vinos, calificaciones y preferencias. 
          Esto incluye:
        </Text>
        
        <View style={styles.dataList}>
          {[
            'Tu perfil y configuraciones',
            'Colección completa de vinos',
            'Calificaciones y notas',
            'Estadísticas personalizadas',
            'Preferencias de la app'
          ].map((item, index) => (
            <Animated.View 
              key={index}
              entering={FadeIn.delay(index * 100).duration(300)}
              style={styles.dataItem}
            >
              <Ionicons name="checkmark-circle" size={16} color={theme.burgundy} />
              <Text style={[styles.dataText, { color: theme.text }]}>{item}</Text>
            </Animated.View>
          ))}
        </View>

        <Text style={[styles.note, { color: theme.textSecondary }]}>
          El proceso puede tomar unos minutos. Podrás compartir el archivo una vez completado.
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.cancelButton, { borderColor: theme.border }]}
          onPress={handleClose}
        >
          <Text style={[styles.cancelText, { color: theme.textSecondary }]}>
            Cancelar
          </Text>
        </TouchableOpacity>
        
        <View style={styles.confirmButton}>
          <Button
            title="Iniciar Exportación"
            onPress={handleConfirm}
            color={theme.burgundy}
          />
        </View>
      </View>
    </Animated.View>
  );

  const renderLoadingContent = () => (
    <Animated.View 
      entering={ZoomIn.duration(300)}
      exiting={ZoomOut.duration(200)}
      style={[styles.modalContent, styles.loadingContent, { backgroundColor: theme.card }]}
    >
      <ActivityIndicator size="large" color={theme.burgundy} />
      <Text style={[styles.loadingTitle, { color: theme.text }]}>
        Exportando Datos...
      </Text>
      <Text style={[styles.loadingDescription, { color: theme.textSecondary }]}>
        Preparando tu archivo de datos
      </Text>
    </Animated.View>
  );

  const renderSuccessContent = () => (
    <Animated.View 
      entering={ZoomIn.duration(300)}
      exiting={ZoomOut.duration(200)}
      style={[styles.modalContent, { backgroundColor: theme.card }]}
    >
      <View style={[styles.successIcon, { backgroundColor: `${theme.burgundy}20` }]}>
        <Ionicons name="checkmark-circle" size={48} color={theme.burgundy} />
      </View>
      
      <Text style={[styles.successTitle, { color: theme.text }]}>
        ¡Exportación Completada!
      </Text>
      <Text style={[styles.successDescription, { color: theme.textSecondary }]}>
        Tus datos se han exportado exitosamente. El archivo se ha compartido y guardado en tu dispositivo.
      </Text>

      <View style={styles.successButton}>
        <Button
          title="Perfecto"
          onPress={handleClose}
          color={theme.burgundy}
        />
      </View>
    </Animated.View>
  );

  const renderErrorContent = () => (
    <Animated.View 
      entering={ZoomIn.duration(300)}
      exiting={ZoomOut.duration(200)}
      style={[styles.modalContent, { backgroundColor: theme.card }]}
    >
      <View style={[styles.errorIcon, { backgroundColor: '#FF634720' }]}>
        <Ionicons name="alert-circle" size={48} color="#FF6347" />
      </View>
      
      <Text style={[styles.errorTitle, { color: theme.text }]}>
        Error en la Exportación
      </Text>
      <Text style={[styles.errorDescription, { color: theme.textSecondary }]}>
        {exportError || 'No se pudieron exportar los datos. Inténtalo de nuevo.'}
      </Text>

      <View style={styles.errorActions}>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: theme.burgundy }]}
          onPress={handleConfirm}
        >
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.cancelButton, { borderColor: theme.border }]}
          onPress={handleClose}
        >
          <Text style={[styles.cancelText, { color: theme.textSecondary }]}>
            Cancelar
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderContent = () => {
    if (isExporting) return renderLoadingContent();
    if (exportComplete) return renderSuccessContent();
    if (exportError) return renderErrorContent();
    return renderInitialContent();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View 
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
      >
        <TouchableOpacity 
          style={styles.overlayTouch}
          activeOpacity={1}
          onPress={isExporting ? undefined : handleClose}
        >
          <View style={styles.modalContainer}>
            {renderContent()}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  overlayTouch: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    lineHeight: 22,
    marginBottom: 20,
  },
  dataList: {
    marginBottom: 20,
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dataText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    marginLeft: 8,
  },
  note: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
  },
  confirmButton: {
    flex: 2,
  },
  loadingContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat-SemiBold',
    marginTop: 20,
    marginBottom: 8,
  },
  loadingDescription: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'center',
    marginBottom: 12,
  },
  successDescription: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  successButton: {
    alignSelf: 'stretch',
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 22,
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'center',
    marginBottom: 12,
  },
  errorDescription: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  errorActions: {
    gap: 12,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
  },
}); 