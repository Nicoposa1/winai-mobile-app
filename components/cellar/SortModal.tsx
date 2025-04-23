import React from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  StyleSheet, 
  TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ColorSchemeName } from 'react-native';

export type SortOption = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

interface SortModalProps {
  visible: boolean;
  onClose: () => void;
  colorScheme: ColorSchemeName;
  sortOptions: SortOption[];
  selectedSort: string;
  onSelectSort: (sortId: string) => void;
}

export function SortModal({
  visible,
  onClose,
  colorScheme,
  sortOptions,
  selectedSort,
  onSelectSort
}: SortModalProps) {
  const theme = colorScheme ?? 'light';
  
  // Colores basados en el tema
  const backgroundColor = theme === 'dark' ? '#2D2730' : '#FFFFFF';
  const textColor = theme === 'dark' ? '#FFFFFF' : '#000000';
  const accentColor = theme === 'dark' ? '#9A2846' : '#800020';
  const overlayColor = 'rgba(0, 0, 0, 0.5)';
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.overlay, { backgroundColor: overlayColor }]}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalContainer, { backgroundColor }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: textColor }]}>
                  Ordenar por
                </Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={textColor} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.optionsContainer}>
                {sortOptions.map((option) => {
                  const isSelected = selectedSort === option.id;
                  
                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.sortOption,
                        isSelected && { backgroundColor: `${accentColor}20` }
                      ]}
                      onPress={() => {
                        onSelectSort(option.id);
                        onClose();
                      }}
                    >
                      <Ionicons 
                        name={option.icon} 
                        size={20} 
                        color={isSelected ? accentColor : textColor} 
                        style={styles.optionIcon}
                      />
                      <Text 
                        style={[
                          styles.optionText, 
                          { color: textColor },
                          isSelected && { color: accentColor, fontFamily: 'Montserrat-SemiBold' }
                        ]}
                      >
                        {option.label}
                      </Text>
                      
                      {isSelected && (
                        <Ionicons 
                          name="checkmark" 
                          size={20} 
                          color={accentColor} 
                          style={styles.checkmark}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
  },
  closeButton: {
    padding: 4,
  },
  optionsContainer: {
    paddingVertical: 8,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  optionIcon: {
    marginRight: 16,
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    flex: 1,
  },
  checkmark: {
    marginLeft: 8,
  },
}); 