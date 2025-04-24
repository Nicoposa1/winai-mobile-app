import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

type ColorSchemeType = 'light' | 'dark';

// Componente para animación del tab Home
function AnimatedHomeIcon({ focused, colorScheme }: { focused: boolean; colorScheme: ColorSchemeType | null | undefined }) {
  const colorMode = colorScheme ?? 'light';
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withTiming(focused ? 1.2 : 1, { duration: 200 }) }],
      opacity: withTiming(focused ? 1 : 0.8, { duration: 200 })
    };
  }, [focused]);

  return (
    <Animated.View style={animatedStyle}>
      <FontAwesome
        name="home"
        size={24}
        color={focused ? Colors[colorMode].wineRed : Colors[colorMode].tabIconDefault}
      />
    </Animated.View>
  );
}

// Componente para animación del tab Add Wine
function AnimatedAddWineIcon({ focused, colorScheme }: { focused: boolean; colorScheme: ColorSchemeType | null | undefined }) {
  const colorMode = colorScheme ?? 'light';
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withTiming(focused ? 1.2 : 1, { duration: 200 }) }],
      opacity: withTiming(focused ? 1 : 0.8, { duration: 200 })
    };
  }, [focused]);

  return (
    <Animated.View style={animatedStyle}>
      <FontAwesome
        name="plus-circle"
        size={24}
        color={focused ? Colors[colorMode].wineRed : Colors[colorMode].tabIconDefault}
      />
    </Animated.View>
  );
}

// Componente para animación del tab Cellar
function AnimatedCellarIcon({ focused, colorScheme }: { focused: boolean; colorScheme: ColorSchemeType | null | undefined }) {
  const colorMode = colorScheme ?? 'light';
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withTiming(focused ? 1.2 : 1, { duration: 200 }) }],
      opacity: withTiming(focused ? 1 : 0.8, { duration: 200 })
    };
  }, [focused]);

  return (
    <Animated.View style={animatedStyle}>
      <MaterialIcons
        name="wine-bar"
        size={24}
        color={focused ? Colors[colorMode].wineRed : Colors[colorMode].tabIconDefault}
      />
    </Animated.View>
  );
}

// Componente para animación del tab Favorites
function AnimatedFavoritesIcon({ focused, colorScheme }: { focused: boolean; colorScheme: ColorSchemeType | null | undefined }) {
  const colorMode = colorScheme ?? 'light';
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withTiming(focused ? 1.2 : 1, { duration: 200 }) }],
      opacity: withTiming(focused ? 1 : 0.8, { duration: 200 })
    };
  }, [focused]);

  return (
    <Animated.View style={animatedStyle}>
      <FontAwesome
        name="heart"
        size={24}
        color={focused ? Colors[colorMode].wineRed : Colors[colorMode].tabIconDefault}
      />
    </Animated.View>
  );
}

// Componente para animación del tab Profile
function AnimatedProfileIcon({ focused, colorScheme }: { focused: boolean; colorScheme: ColorSchemeType | null | undefined }) {
  const colorMode = colorScheme ?? 'light';
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withTiming(focused ? 1.2 : 1, { duration: 200 }) }],
      opacity: withTiming(focused ? 1 : 0.8, { duration: 200 })
    };
  }, [focused]);

  return (
    <Animated.View style={animatedStyle}>
      <FontAwesome
        name="user"
        size={24}
        color={focused ? Colors[colorMode].wineRed : Colors[colorMode].tabIconDefault}
      />
    </Animated.View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].wineRed,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <AnimatedHomeIcon focused={focused} colorScheme={colorScheme} />
          ),
        }}
      />
      <Tabs.Screen
        name="add-wine"
        options={{
          title: 'Add Wine',
          tabBarIcon: ({ focused }) => (
            <AnimatedAddWineIcon focused={focused} colorScheme={colorScheme} />
          ),
        }}
      />
      <Tabs.Screen
        name="cellar"
        options={{
          title: 'Cellar',
          tabBarIcon: ({ focused }) => (
            <AnimatedCellarIcon focused={focused} colorScheme={colorScheme} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ focused }) => (
            <AnimatedFavoritesIcon focused={focused} colorScheme={colorScheme} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <AnimatedProfileIcon focused={focused} colorScheme={colorScheme} />
          ),
        }}
      />
    </Tabs>
  );
}
