import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Switch,
  Image,
  Platform,
  ColorSchemeName
} from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Animated, { SlideInRight } from 'react-native-reanimated';

import { WINE_COLORS } from './WineColors';

export interface WineFormData {
  name: string;
  winery: string;
  year: string;
  type: 'red' | 'white' | 'rose' | 'sparkling' | 'other';
  region: string;
  country: string;
  notes: string;
  imageUri: string | null;
  hasTasted: boolean;
  storageDate: Date;
}

interface WineFormProps {
  initialData: WineFormData;
  onSubmit: (formData: WineFormData) => void;
  onUpdateField: (field: keyof WineFormData, value: any) => void;
  colorScheme?: ColorSchemeName;
}

const wineTypeLabels = {
  red: 'Tinto',
  white: 'Blanco',
  rose: 'Rosado',
  sparkling: 'Espumante',
  other: 'Otro'
};

export function WineForm({ 
  initialData, 
  onSubmit, 
  onUpdateField, 
  colorScheme = 'light' 
}: WineFormProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Tema basado en el color scheme
  const themeColors = WINE_COLORS[colorScheme ?? 'light'];
  
  // Opciones de tipo de vino
  const wineTypes: Array<'red' | 'white' | 'rose' | 'sparkling' | 'other'> = [
    'red', 'white', 'rose', 'sparkling', 'other'
  ];
  
  // Manejar cambio de fecha
  const handleDateChange = (
    event: DateTimePickerEvent, 
    selectedDate?: Date
  ) => {
    setShowDatePicker(false);
    if (selectedDate) {
      onUpdateField('storageDate', selectedDate);
    }
  };
  
  return (
    <Animated.View
      entering={SlideInRight.duration(300)}
      style={styles.formContainer}
    >
      {initialData.imageUri && (
        <View style={styles.previewImageContainer}>
          <Image source={{ uri: initialData.imageUri }} style={styles.previewImage} />
          <TouchableOpacity 
            style={styles.removeImageButton}
            onPress={() => onUpdateField('imageUri', null)}
          >
            <Ionicons name="close-circle" size={24} color={WINE_COLORS.white} />
          </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: themeColors.textSecondary }]}>Nombre*</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: themeColors.input,
            color: themeColors.text 
          }]}
          value={initialData.name}
          onChangeText={(value) => onUpdateField('name', value)}
          placeholder="Nombre del vino"
          placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: themeColors.textSecondary }]}>Bodega*</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: themeColors.input,
            color: themeColors.text 
          }]}
          value={initialData.winery}
          onChangeText={(value) => onUpdateField('winery', value)}
          placeholder="Nombre de la bodega"
          placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
        />
      </View>
      
      <View style={styles.formRow}>
        <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>Año*</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: themeColors.input,
              color: themeColors.text 
            }]}
            value={initialData.year}
            onChangeText={(value) => onUpdateField('year', value)}
            placeholder="Año"
            placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
            keyboardType="numeric"
          />
        </View>
        
        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>País</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: themeColors.input,
              color: themeColors.text 
            }]}
            value={initialData.country}
            onChangeText={(value) => onUpdateField('country', value)}
            placeholder="País de origen"
            placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
          />
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: themeColors.textSecondary }]}>Tipo de vino</Text>
        <View style={styles.typeContainer}>
          {wineTypes.map((wineType) => (
            <TouchableOpacity
              key={wineType}
              style={[
                styles.typeButton,
                { backgroundColor: themeColors.input },
                initialData.type === wineType && { backgroundColor: themeColors.burgundy }
              ]}
              onPress={() => onUpdateField('type', wineType)}
            >
              <Text 
                style={[
                  styles.typeText,
                  { color: themeColors.textSecondary },
                  initialData.type === wineType && { color: WINE_COLORS.white }
                ]}
              >
                {wineTypeLabels[wineType]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: themeColors.textSecondary }]}>Región</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: themeColors.input,
            color: themeColors.text 
          }]}
          value={initialData.region}
          onChangeText={(value) => onUpdateField('region', value)}
          placeholder="Región del vino"
          placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: themeColors.textSecondary }]}>Fecha de almacenamiento</Text>
        <TouchableOpacity
          style={[styles.datePickerButton, { 
            backgroundColor: themeColors.input
          }]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={[styles.dateText, { color: themeColors.text }]}>
            {initialData.storageDate.toLocaleDateString()}
          </Text>
          <FontAwesome name="calendar" size={18} color={themeColors.textSecondary} />
        </TouchableOpacity>
        
        {showDatePicker && (
          <DateTimePicker
            value={initialData.storageDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            themeVariant={colorScheme === 'dark' ? 'dark' : 'light'}
          />
        )}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: themeColors.textSecondary }]}>Notas personales</Text>
        <TextInput
          style={[styles.input, styles.textArea, { 
            backgroundColor: themeColors.input,
            color: themeColors.text 
          }]}
          value={initialData.notes}
          onChangeText={(value) => onUpdateField('notes', value)}
          placeholder="Notas de cata, aromas, sabores..."
          placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
          multiline
          numberOfLines={4}
        />
      </View>
      
      <View style={styles.switchContainer}>
        <Text style={[styles.switchLabel, { color: themeColors.textSecondary }]}>¿Ya has probado este vino?</Text>
        <Switch
          value={initialData.hasTasted}
          onValueChange={(value) => onUpdateField('hasTasted', value)}
          trackColor={{ 
            false: colorScheme === 'dark' ? '#444' : WINE_COLORS.lightGray, 
            true: colorScheme === 'dark' ? '#85263D' : WINE_COLORS.burgundyLight 
          }}
          thumbColor={initialData.hasTasted ? themeColors.burgundy : WINE_COLORS.white}
        />
      </View>
      
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => onSubmit(initialData)}
      >
        <LinearGradient
          colors={[themeColors.burgundy, colorScheme === 'dark' ? '#85263D' : WINE_COLORS.burgundyLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.addButtonGradient}
        >
          <Text style={styles.addButtonText}>Guardar en mi bodega</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: 8,
  },
  input: {
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
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
    marginRight: 8,
    marginBottom: 8,
  },
  typeText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 14,
  },
  dateText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
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
    color: WINE_COLORS.white,
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