import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Switch,
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';

import { useAppDispatch } from '@/store';
import { addWine } from '@/store/slices/wineSlice';
import { useColorScheme } from '@/hooks/useColorScheme';

// Paleta de colores premium
const COLORS = {
  burgundy: '#800020',
  burgundyLight: '#A52A2A',
  gold: '#D4AF37',
  goldLight: '#F5EFD5',
  black: '#000000',
  darkGray: '#333333',
  lightGray: '#F0F0F0',
  white: '#FFFFFF',
  error: '#FF3B30',
};

// Función para generar un ID único
const generateId = () => Math.random().toString(36).substring(2, 15);

// Componente Tab para alternar entre métodos
const Tab = ({
  title,
  active,
  onPress
}: {
  title: string;
  active: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.tab, active && styles.activeTab]}
    onPress={onPress}
  >
    <Text style={[styles.tabText, active && styles.activeTabText]}>{title}</Text>
    {active && <View style={styles.activeIndicator} />}
  </TouchableOpacity>
);

// Interfaz para los resultados del análisis de IA
interface AIAnalysisResult {
  name: string;
  winery: string;
  year: string;
  type: 'red' | 'white' | 'rose' | 'sparkling' | 'other';
  country: string;
  region: string;
  imageUri: string;
}

// Componente de análisis de imagen con IA
const AIAnalyzer = ({
  onAnalysisComplete,
  onCancel
}: {
  onAnalysisComplete: (results: AIAnalysisResult) => void;
  onCancel: () => void;
}) => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Simulación de análisis de IA
  const simulateAIAnalysis = () => {
    setIsAnalyzing(true);

    // Simulamos el progreso
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);

        // Resultado simulado del análisis
        setTimeout(() => {
          setIsAnalyzing(false);
          if (image) {
            onAnalysisComplete({
              name: 'Malbec Gran Reserva',
              winery: 'Bodega Catena Zapata',
              year: '2018',
              type: 'red',
              country: 'Argentina',
              region: 'Mendoza',
              imageUri: image,
            });
          }
        }, 500);
      }
    }, 150);
  };

  // Seleccionar imagen de la galería
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos permiso para acceder a tu galería.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
      simulateAIAnalysis();
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
      simulateAIAnalysis();
    }
  };

  if (isAnalyzing && image) {
    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        style={styles.aiAnalyzingContainer}
      >
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: image }} style={styles.imagePreview} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageGradient}
          />
          <View style={styles.analyzeOverlay}>
            <ActivityIndicator size="large" color={COLORS.gold} />
            <Text style={styles.analyzeText}>Analizando imagen...</Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{progress}%</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={styles.aiContainer}
    >
      <Text style={styles.aiTitle}>Identifica tu vino con IA</Text>
      <Text style={styles.aiDescription}>
        Toma una foto de la etiqueta o botella y nuestra IA identificará los detalles
      </Text>

      <View style={styles.aiButtonsContainer}>
        <TouchableOpacity
          style={styles.aiButton}
          onPress={takePhoto}
        >
          <LinearGradient
            colors={[COLORS.burgundy, COLORS.burgundyLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.aiButtonGradient}
          >
            <FontAwesome name="camera" size={24} color={COLORS.white} />
            <Text style={styles.aiButtonText}>Tomar foto</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.aiButton}
          onPress={pickImage}
        >
          <LinearGradient
            colors={[COLORS.darkGray, COLORS.black]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.aiButtonGradient}
          >
            <FontAwesome name="image" size={24} color={COLORS.white} />
            <Text style={styles.aiButtonText}>Elegir imagen</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.aiDivider}>
        <View style={styles.aiDividerLine} />
        <Text style={styles.aiDividerText}>o</Text>
        <View style={styles.aiDividerLine} />
      </View>

      <TouchableOpacity
        style={styles.manualEntryButton}
        onPress={() => onCancel()}
      >
        <Text style={styles.manualEntryText}>Ingresar datos manualmente</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function AddWineScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const scrollViewRef = useRef(null);

  // Estados para los tabs
  const [activeTab, setActiveTab] = useState('photo'); // 'photo' o 'manual'
  const [aiAnalysisResults, setAiAnalysisResults] = useState(null);

  // Estados para los campos del formulario
  const [name, setName] = useState('');
  const [winery, setWinery] = useState('');
  const [year, setYear] = useState('');
  const [type, setType] = useState<'red' | 'white' | 'rose' | 'sparkling' | 'other'>('red');
  const [region, setRegion] = useState('');
  const [country, setCountry] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [hasTasted, setHasTasted] = useState(false);

  // Estado para el date picker
  const [storageDate, setStorageDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Opciones de tipo de vino
  const wineTypes: Array<'red' | 'white' | 'rose' | 'sparkling' | 'other'> = [
    'red', 'white', 'rose', 'sparkling', 'other'
  ];

  // Manejar el resultado del análisis de IA
  const handleAnalysisComplete = (results: AIAnalysisResult) => {
    setName(results.name);
    setWinery(results.winery);
    setYear(results.year);
    setType(results.type);
    setCountry(results.country);
    setRegion(results.region);
    setImageUri(results.imageUri);
    setActiveTab('manual'); // Cambiar a la pestaña manual para editar
  };

  // Limpiar el formulario
  const resetForm = () => {
    setName('');
    setWinery('');
    setYear('');
    setType('red');
    setRegion('');
    setCountry('');
    setNotes('');
    setImageUri(null);
    setHasTasted(false);
    setStorageDate(new Date());
  };

  // Función para manejar la adición de un vino
  const handleAddWine = () => {
    // Validación básica
    if (!name || !winery || !year) {
      Alert.alert('Campos faltantes', 'Por favor completa los campos obligatorios: Nombre, Bodega y Año.');
      return;
    }

    // Parsear el año como número
    const yearNumber = parseInt(year, 10);
    if (isNaN(yearNumber)) {
      Alert.alert('Año inválido', 'Por favor ingresa un año válido.');
      return;
    }

    // Crear el objeto del vino
    const newWine = {
      id: generateId(),
      name,
      winery,
      year: yearNumber,
      type,
      region: region || undefined,
      country: country || undefined,
      notes: notes || undefined,
      imageUrl: imageUri || undefined,
      hasTasted,
      storageDate: storageDate.toISOString(),
      isFavorite: false,
    };

    // Dispatch de la acción para agregar el vino
    dispatch(addWine(newWine));

    // Mostrar confirmación
    Alert.alert(
      '¡Vino añadido!',
      `${name} de ${winery} ha sido añadido a tu colección.`,
      [
        {
          text: 'OK',
          onPress: () => {
            resetForm();
            router.back();
          }
        }
      ]
    );
  };

  // Manejar cambio de fecha
  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setStorageDate(selectedDate);
    }
  };

  // Renderizar el contenido según el tab activo
  const renderContent = () => {
    if (activeTab === 'photo' && !aiAnalysisResults) {
      return (
        <AIAnalyzer
          onAnalysisComplete={handleAnalysisComplete}
          onCancel={() => setActiveTab('manual')}
        />
      );
    }

    return (
      <Animated.View
        entering={SlideInRight.duration(300)}
        exiting={SlideOutLeft.duration(300)}
        style={styles.formContainer}
      >
        {imageUri && (
          <View style={styles.previewImageContainer}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => setImageUri(null)}
            >
              <Ionicons name="close-circle" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nombre*</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Nombre del vino"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Bodega*</Text>
          <TextInput
            style={styles.input}
            value={winery}
            onChangeText={setWinery}
            placeholder="Nombre de la bodega"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Año*</Text>
            <TextInput
              style={styles.input}
              value={year}
              onChangeText={setYear}
              placeholder="Año"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>País</Text>
            <TextInput
              style={styles.input}
              value={country}
              onChangeText={setCountry}
              placeholder="País de origen"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Tipo de vino</Text>
          <View style={styles.typeContainer}>
            {wineTypes.map((wineType) => (
              <TouchableOpacity
                key={wineType}
                style={[
                  styles.typeButton,
                  type === wineType && styles.selectedType
                ]}
                onPress={() => setType(wineType)}
              >
                <Text
                  style={[
                    styles.typeText,
                    type === wineType && styles.selectedTypeText
                  ]}
                >
                  {wineType === 'red' ? 'Tinto' :
                    wineType === 'white' ? 'Blanco' :
                      wineType === 'rose' ? 'Rosado' :
                        wineType === 'sparkling' ? 'Espumante' : 'Otro'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Región</Text>
          <TextInput
            style={styles.input}
            value={region}
            onChangeText={setRegion}
            placeholder="Región del vino"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Fecha de almacenamiento</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {storageDate.toLocaleDateString()}
            </Text>
            <FontAwesome name="calendar" size={18} color={COLORS.darkGray} />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={storageDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Notas personales</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Notas de cata, aromas, sabores..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>¿Ya has probado este vino?</Text>
          <Switch
            value={hasTasted}
            onValueChange={setHasTasted}
            trackColor={{ false: COLORS.lightGray, true: COLORS.burgundyLight }}
            thumbColor={hasTasted ? COLORS.burgundy : COLORS.white}
          />
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddWine}
        >
          <LinearGradient
            colors={[COLORS.burgundy, COLORS.burgundyLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.addButtonGradient}
          >
            <Text style={styles.addButtonText}>Guardar en mi bodega</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#121212' : COLORS.white }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Agregar vino</Text>

          {/* Solo mostrar tabs si no estamos analizando con IA */}
          {!aiAnalysisResults && (
            <View style={styles.tabsContainer}>
              <Tab
                title="Con foto"
                active={activeTab === 'photo'}
                onPress={() => setActiveTab('photo')}
              />
              <Tab
                title="Manual"
                active={activeTab === 'manual'}
                onPress={() => setActiveTab('manual')}
              />
            </View>
          )}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
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
    color: COLORS.black,
    marginBottom: 10,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  tab: {
    paddingHorizontal: 5,
    paddingVertical: 10,
    marginRight: 20,
    position: 'relative',
  },
  activeTab: {
    // Estilos para el tab activo
  },
  tabText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
    color: COLORS.darkGray,
  },
  activeTabText: {
    color: COLORS.burgundy,
    fontFamily: 'Montserrat-SemiBold',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLORS.burgundy,
    borderRadius: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  // Estilos para el componente de IA
  aiContainer: {
    padding: 20,
    alignItems: 'center',
  },
  aiTitle: {
    fontSize: 22,
    fontFamily: 'Montserrat-Bold',
    color: COLORS.black,
    marginBottom: 10,
    textAlign: 'center',
  },
  aiDescription: {
    fontSize: 15,
    fontFamily: 'Montserrat-Regular',
    color: COLORS.darkGray,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
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
    color: COLORS.white,
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
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  aiDividerText: {
    paddingHorizontal: 10,
    color: COLORS.darkGray,
    fontFamily: 'Montserrat-Regular',
  },
  manualEntryButton: {
    padding: 10,
  },
  manualEntryText: {
    color: COLORS.burgundy,
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
    color: COLORS.white,
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
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.gold,
  },
  progressText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
  },
  cancelButton: {
    padding: 15,
  },
  cancelButtonText: {
    color: COLORS.burgundy,
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
  },
  // Estilos para el formulario
  formContainer: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  label: {
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: COLORS.black,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  typeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedType: {
    backgroundColor: COLORS.burgundy,
  },
  typeText: {
    color: COLORS.darkGray,
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
  },
  selectedTypeText: {
    color: COLORS.white,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 14,
  },
  dateText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: COLORS.black,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  switchLabel: {
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
    color: COLORS.darkGray,
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  addButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
  },
  // Imagen previa
  previewImageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    padding: 5,
  },
}); 