import { View, Text, ButtonProps, Pressable, ActivityIndicator, StyleSheet } from 'react-native'
import React from 'react'

interface CustomButtonProps extends ButtonProps {
  isLoading?: boolean;
  color?: string;
}

export const Button = ({ title, onPress, isLoading, color = '#007AFF' }: CustomButtonProps) => {
  return (
    <Pressable 
      onPress={onPress} 
      disabled={isLoading}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: color },
        pressed && styles.buttonPressed
      ]}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <Text style={styles.buttonText}>
          {title}
        </Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontFamily: 'Montserrat-Bold',
    color: 'white',
    fontSize: 16,
    letterSpacing: 1,
  },
});
