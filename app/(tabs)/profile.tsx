import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { WINE_COLORS } from '@/components/wine/WineColors';
import { StatsCard } from '@/components/profile/StatsCard';
import { ProfileOption } from '@/components/profile/ProfileOption';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = WINE_COLORS[colorScheme];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      Alert.alert("Logout Failed", "An error occurred while trying to log out.");
    }
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Animated.View style={styles.header} entering={FadeIn.duration(500)}>
        <Image
          source={{ uri: user.photoURL || 'https://www.gravatar.com/avatar/?d=mp' }}
          style={styles.avatar}
        />
        <Text style={[styles.name, { color: theme.text }]}>
          {user.displayName || 'Wine Lover'}
        </Text>
        <Text style={[styles.email, { color: theme.textSecondary }]}>
          {user.email}
        </Text>
      </Animated.View>

      <View style={styles.statsContainer}>
        <StatsCard icon="wine-bar" label="Wines Rated" value={128} colorScheme={colorScheme} delay={100} />
        <StatsCard icon="favorite" label="Favorites" value={34} colorScheme={colorScheme} delay={200} />
        <StatsCard icon="star" label="Avg. Rating" value={4.2} colorScheme={colorScheme} delay={300} iconType="MaterialIcons" />
      </View>

      <Animated.View style={styles.optionsContainer} entering={FadeInDown.delay(400).duration(400)}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Account</Text>
        <ProfileOption icon="person-outline" label="Edit Profile" onPress={() => {}} colorScheme={colorScheme} delay={500} />
        <ProfileOption icon="notifications-none" label="Notifications" onPress={() => {}} colorScheme={colorScheme} delay={600} />
        <ProfileOption icon="security" label="Security" onPress={() => {}} colorScheme={colorScheme} delay={700} />
        
        <Text style={[styles.sectionTitle, { color: theme.text }]}>General</Text>
        <ProfileOption icon="language" label="Language" onPress={() => {}} colorScheme={colorScheme} delay={800} />
        <ProfileOption icon="help-outline" label="Help & Support" onPress={() => {}} colorScheme={colorScheme} delay={900} />
        
        <ProfileOption 
          icon="logout" 
          label="Log Out" 
          onPress={handleLogout} 
          colorScheme={colorScheme}
          isDestructive 
          delay={1000}
        />
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 120,
    paddingTop: 90,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: WINE_COLORS.light.burgundy,
  },
  name: {
    fontSize: 24,
    fontFamily: 'Montserrat-Bold',
  },
  email: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  optionsContainer: {
    // Styles for the options list
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 10,
    marginTop: 20,
  }
}); 