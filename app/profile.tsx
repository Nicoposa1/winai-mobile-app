import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { WINE_COLORS } from '@/components/wine/WineColors';
import { StatsCard } from '@/components/profile/StatsCard';
import { ProfileOption } from '@/components/profile/ProfileOption';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { pickImage, uploadAvatar, updateProfileAvatar } from '@/services/imageService';

export default function ProfileScreen() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = WINE_COLORS[colorScheme];
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert("Logout Failed", "An error occurred while trying to log out.");
    }
  };

  const handleAvatarPress = async () => {
    if (!user) return;

    setIsUploadingAvatar(true);
    try {
      const imageResult = await pickImage();
      
      if (imageResult.success && imageResult.imageUri) {
        const uploadResult = await uploadAvatar(imageResult.imageUri, user.id);
        
        if (uploadResult.success && uploadResult.url) {
          const updateSuccess = await updateProfileAvatar(user.id, uploadResult.url);
          
          if (updateSuccess) {
            await refreshProfile(); // Refresh the profile to get the new avatar
            Alert.alert('Success', 'Profile photo updated successfully!');
          } else {
            Alert.alert('Error', 'Failed to update profile photo');
          }
        } else {
          Alert.alert('Error', uploadResult.error || 'Failed to upload image');
        }
      }
    } catch (error) {
      console.error('Avatar update error:', error);
      Alert.alert('Error', 'Failed to update profile photo');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const getDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile?.first_name) {
      return profile.first_name;
    }
    return user?.email?.split('@')[0] || 'Wine Lover';
  };

  const getAvatarUri = () => {
    if (profile?.avatar_url) {
      return profile.avatar_url;
    }
    return 'https://www.gravatar.com/avatar/?d=mp';
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
        <TouchableOpacity 
          style={styles.avatarContainer} 
          onPress={handleAvatarPress}
          disabled={isUploadingAvatar}
        >
          <Image
            source={{ uri: getAvatarUri() }}
            style={styles.avatar}
          />
          {isUploadingAvatar ? (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="small" color="white" />
            </View>
          ) : (
            <View style={styles.cameraOverlay}>
              <Ionicons name="camera" size={20} color="white" />
            </View>
          )}
        </TouchableOpacity>
        <Text style={[styles.name, { color: theme.text }]}>
          {getDisplayName()}
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
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: WINE_COLORS.light.burgundy,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: WINE_COLORS.light.burgundy,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
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