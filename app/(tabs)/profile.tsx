import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert, TouchableOpacity } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { WINE_COLORS } from '@/components/wine/WineColors';
import { StatsCard } from '@/components/profile/StatsCard';
import { ProfileOption } from '@/components/profile/ProfileOption';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = WINE_COLORS[colorScheme];

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert("Logout Failed", "An error occurred while trying to log out.");
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to permanently delete your account? This action cannot be undone. All your data, including wines, favorites, and profile information will be lost.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Show loading state
              Alert.alert("Deleting Account", "Please wait while we delete your account...");

              // Delete user account via backend API
              if (!user) {
                Alert.alert("Error", "User not found. Please try logging in again.");
                return;
              }

              // Call backend to delete user (requires service_role key)
              const session = await supabase.auth.getSession();
              console.log('Session data:', session.data);
              
              if (!session.data.session?.access_token) {
                Alert.alert("Error", "No valid session found. Please log in again.");
                return;
              }
              
              const response = await fetch('http://192.168.0.3:3000/api/users/delete', {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${session.data.session.access_token}`,
                },
                body: JSON.stringify({ userId: user.id }),
              });

              if (!response.ok) {
                const errorData = await response.json();
                console.error('Error deleting user:', errorData);
                Alert.alert(
                  "Error",
                  errorData.message || "Failed to delete account. Please try again or contact support."
                );
                return;
              }

              // Sign out the user (this will redirect to login automatically)
              await signOut();

              // Show success message
              Alert.alert(
                "Account Deleted",
                "Your account has been successfully deleted."
              );

            } catch (error) {
              console.error('Error during account deletion:', error);
              Alert.alert(
                "Error",
                "An unexpected error occurred. Please try again or contact support."
              );
            }
          }
        }
      ]
    );
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
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={styles.header} entering={FadeIn.duration(500)}>
        <Image
          source={{ uri: 'https://www.gravatar.com/avatar/?d=mp' }}
          style={styles.avatar}
        />
        <Text style={[styles.name, { color: theme.text }]}>
          Wine Lover
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
        <ProfileOption icon="person-outline" label="Edit Profile" onPress={() => { }} colorScheme={colorScheme} delay={500} />
        <ProfileOption icon="notifications-none" label="Notifications" onPress={() => { }} colorScheme={colorScheme} delay={600} />
        <ProfileOption icon="security" label="Security" onPress={() => { }} colorScheme={colorScheme} delay={700} />

        <Text style={[styles.sectionTitle, { color: theme.text }]}>General</Text>
        <ProfileOption icon="language" label="Language" onPress={() => { }} colorScheme={colorScheme} delay={800} />
        <ProfileOption icon="help-outline" label="Help & Support" onPress={() => { }} colorScheme={colorScheme} delay={900} />

        <ProfileOption
          icon="logout"
          label="Log Out"
          onPress={handleLogout}
          colorScheme={colorScheme}
          isDestructive
          delay={1000}
        />

        {/* Botón discreto para eliminar cuenta */}
        <TouchableOpacity
          style={styles.deleteAccountButton}
          onPress={handleDeleteAccount}
        >
          <Text style={[styles.deleteAccountText, { color: theme.textSecondary }]}>
            Delete Account
          </Text>
        </TouchableOpacity>
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
  },
  deleteAccountButton: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  deleteAccountText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    opacity: 0.6,
  }
}); 