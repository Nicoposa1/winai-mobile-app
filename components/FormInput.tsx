import { View, Text, TextInput, TextInputProps, StyleSheet } from 'react-native'
import React from 'react'

interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry: boolean;
  error: string | null;
  textContentType: TextInputProps['textContentType'];
  autoComplete: TextInputProps['autoComplete'];
  autoCapitalize: TextInputProps['autoCapitalize'];
  darkMode?: boolean;
}

export const FormInput = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  secureTextEntry, 
  error, 
  textContentType, 
  autoComplete, 
  autoCapitalize,
  darkMode = false
}: FormInputProps) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.label, darkMode ? styles.labelDark : styles.labelLight]}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        textContentType={textContentType}
        autoComplete={autoComplete}
        autoCapitalize={autoCapitalize}
        style={[
          styles.input,
          darkMode ? styles.inputDark : styles.inputLight,
          error && styles.inputError
        ]}
        placeholderTextColor={darkMode ? "#9E9E9E" : "#757575"}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 8,
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
  },
  labelLight: {
    color: '#333333',
  },
  labelDark: {
    color: '#FFFFFF',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
  },
  inputLight: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
    color: '#212121',
  },
  inputDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    color: '#FFFFFF',
  },
  inputError: {
    borderColor: '#FF5252',
  },
  errorText: {
    color: '#FF5252',
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
    marginTop: 4,
  }
});
