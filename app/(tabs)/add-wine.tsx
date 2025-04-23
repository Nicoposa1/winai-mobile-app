import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  useColorScheme as RNUseColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { useAppDispatch } from '@/store';
import { addWine } from '@/store/slices/wineSlice';
import { useColorScheme } from '@/hooks/useColorScheme';

// Componentes
import { WINE_COLORS } from '@/components/wine/WineColors';
import { AIWineAnalyzer, AIWineAnalysisResult } from '@/components/wine/AIWineAnalyzer';
import { WineForm, WineFormData } from '@/components/wine/WineForm';
import { TabSelector, TabOption } from '@/components/wine/TabSelector';
import { SuccessAnimation } from '@/components/wine/SuccessAnimation';

// Función para generar un ID único
const generateId = () => Math.random().toString(36).substring(2, 15);

export default function AddWineScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Colores basados en el tema
  const themeColors = WINE_COLORS[colorScheme ?? 'light'];
  
  // Estados para los tabs
  const [activeTab, setActiveTab] = useState<TabOption>('photo');
  
  // Estados para la animación de éxito
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState({ wineName: '', winery: '' });
  
  // Estados para los campos del formulario
  const [formData, setFormData] = useState<WineFormData>({
    name: '',
    winery: '',
    year: '',
    type: 'red',
    region: '',
    country: '',
    notes: '',
    imageUri: null,
    hasTasted: false,
    storageDate: new Date()
  });
  
  // Actualizar un campo del formulario
  const handleUpdateField = (field: keyof WineFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Manejar el resultado del análisis de IA
  const handleAnalysisComplete = (results: AIWineAnalysisResult) => {
    setFormData({
      ...formData,
      name: results.name,
      winery: results.winery,
      year: results.year,
      type: results.type,
      country: results.country,
      region: results.region,
      imageUri: results.imageUri
    });
    setActiveTab('manual');
  };
  
  // Limpiar el formulario
  const resetForm = () => {
    // Reiniciar todo el estado del formulario
    setFormData({
      name: '',
      winery: '',
      year: '',
      type: 'red',
      region: '',
      country: '',
      notes: '',
      imageUri: null,
      hasTasted: false,
      storageDate: new Date()
    });
    
    // Reiniciar otros estados si es necesario
    setSuccessData({ wineName: '', winery: '' });
  };
  
  // Manejar cierre de animación de éxito
  const handleSuccessClose = () => {
    // Al cerrar la animación de éxito, solo reseteamos el formulario
    // y ocultamos la animación, pero no navegamos de vuelta
    setShowSuccess(false);
    resetForm();
    // No usamos router.back() para quedarnos en la pantalla
  };
  
  // Función para manejar la adición de un vino
  const handleSubmit = (data: WineFormData) => {
    // Validación básica
    if (!data.name || !data.winery || !data.year) {
      Alert.alert('Campos faltantes', 'Por favor completa los campos obligatorios: Nombre, Bodega y Año.');
      return;
    }
    
    // Parsear el año como número
    const yearNumber = parseInt(data.year, 10);
    if (isNaN(yearNumber)) {
      Alert.alert('Año inválido', 'Por favor ingresa un año válido.');
      return;
    }
    
    // Crear el objeto del vino
    const newWine = {
      id: generateId(),
      name: data.name,
      winery: data.winery,
      year: yearNumber,
      type: data.type,
      region: data.region || undefined,
      country: data.country || undefined,
      notes: data.notes || undefined,
      imageUrl: data.imageUri || undefined,
      hasTasted: data.hasTasted,
      storageDate: data.storageDate.toISOString(),
      isFavorite: false,
      dateAdded: Date.now() // Agregar la fecha de adición
    };
    
    // Dispatch de la acción para agregar el vino
    dispatch(addWine(newWine));
    
    // Preparar datos para la animación de éxito
    setSuccessData({
      wineName: data.name,
      winery: data.winery
    });
    
    // Mostrar la animación de éxito
    setShowSuccess(true);
  };
  
  // Renderizar el contenido según el tab activo
  const renderContent = () => {
    if (activeTab === 'photo') {
      return (
        <AIWineAnalyzer 
          onAnalysisComplete={handleAnalysisComplete}
          onCancel={() => setActiveTab('manual')}
          colorScheme={colorScheme}
        />
      );
    }
    
    return (
      <WineForm 
        initialData={formData} 
        onUpdateField={handleUpdateField}
        onSubmit={handleSubmit}
      />
    );
  };
  return (
    <SafeAreaView 
      style={[
        styles.container, 
        { backgroundColor: themeColors.background }
      ]}
    >
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
          <Text style={[styles.headerTitle, { color: themeColors.text }]}>
            Agregar vino
          </Text>
          <TabSelector activeTab={activeTab} onTabChange={setActiveTab} colorScheme={colorScheme} />
        </View>
      
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderContent()}
        </ScrollView>
        
        {/* Animación de éxito */}
        <SuccessAnimation
          visible={showSuccess}
          message="¡Vino añadido!"
          subMessage={`${successData.wineName} de ${successData.winery} ha sido añadido a tu colección.`}
          colorScheme={colorScheme as 'light' | 'dark'}
          onClose={handleSuccessClose}
          autoClose={false}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
}); 