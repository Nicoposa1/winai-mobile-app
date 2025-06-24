import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { WINE_COLORS } from '@/components/wine/WineColors';
import { StatsCard } from '@/components/profile/StatsCard';
import { ProfileOption } from '@/components/profile/ProfileOption';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { supabase } from '@/lib/supabase';
import { pickFromGallery, uploadAvatar, updateProfileAvatar } from '@/services/imageService';
import { FontAwesome } from '@expo/vector-icons';
import { ImagePickerModal } from '@/components/ImagePickerModal';
import { CameraModal } from '@/components/CameraModal';
import { ImageCropModal } from '@/components/ImageCropModal';
import { NotificationsBottomSheet } from '@/components/NotificationsBottomSheet';

export default function ProfileScreen() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = WINE_COLORS[colorScheme];
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showCustomCamera, setShowCustomCamera] = useState(false);
  const [showImageCrop, setShowImageCrop] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [avatarKey, setAvatarKey] = useState(Date.now()); // Para forzar actualización de imagen
  const [showNotifications, setShowNotifications] = useState(false);

  // Actualizar avatarKey cuando cambie el avatar_url del perfil
  useEffect(() => {
    if (profile?.avatar_url) {
      setAvatarKey(Date.now());
    }
  }, [profile?.avatar_url]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert("Logout Failed", "An error occurred while trying to log out.");
    }
  };

  const handleChangeAvatar = async () => {
    if (!user) {
      Alert.alert('Error', 'User not found');
      return;
    }

    setShowImagePicker(true);
  };

  const handleImageSelected = (imageUri: string) => {
    setSelectedImageUri(imageUri);
    setShowImageCrop(true);
  };

  const handleCropComplete = async (croppedUri: string) => {
    if (!user) return;

    setIsUploadingAvatar(true);
    try {
      console.log('🔄 Iniciando upload de avatar...');
      const uploadResult = await uploadAvatar(croppedUri, user.id);
      console.log('📤 Resultado del upload:', uploadResult);
      
      if (uploadResult.success && uploadResult.url) {
        console.log('✅ Upload exitoso, actualizando perfil...');
        const updateSuccess = await updateProfileAvatar(user.id, uploadResult.url);
        console.log('📝 Resultado actualización perfil:', updateSuccess);
        
        if (updateSuccess) {
          console.log('🔄 Refrescando perfil...');
          // Pequeño delay para asegurar que la DB se actualizó
          await new Promise(resolve => setTimeout(resolve, 500));
          await refreshProfile(); // Refresh the profile to get the new avatar
          setAvatarKey(Date.now()); // Forzar actualización de la imagen
          console.log('✨ Avatar actualizado exitosamente');
          // No mostrar alert para mantener al usuario en la pantalla de perfil
          // La nueva imagen aparecerá automáticamente
        } else {
          Alert.alert('Error', 'No se pudo actualizar la foto de perfil');
        }
      } else {
        Alert.alert('Error', uploadResult.error || 'No se pudo subir la imagen');
      }
    } catch (error) {
      console.error('Avatar update error:', error);
      Alert.alert('Error', 'No se pudo actualizar la foto de perfil');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCameraPress = () => {
    setShowCustomCamera(true);
  };

  const handleCustomCameraPhoto = (uri: string) => {
    handleImageSelected(uri);
  };

  const handleGalleryPress = async () => {
    const result = await pickFromGallery();
    if (result.success && result.imageUri) {
      handleImageSelected(result.imageUri);
    }
  };

  const handleNotificationsPress = () => {
    setShowNotifications(true);
  };

  const handleNotificationsSave = (settings: any) => {
    console.log('Notification settings saved:', settings);
    // Aquí puedes guardar las configuraciones en AsyncStorage o en tu backend
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
        <TouchableOpacity 
          style={styles.avatarContainer}
          onPress={handleChangeAvatar}
          disabled={isUploadingAvatar}
        >
          <Image
            source={{ 
              uri: profile?.avatar_url 
                ? `${profile.avatar_url}?t=${avatarKey}` 
                : 'https://www.gravatar.com/avatar/?d=mp' 
            }}
            style={styles.avatar}
            key={avatarKey}
          />
          {isUploadingAvatar ? (
            <View style={styles.avatarOverlay}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          ) : (
            <View style={styles.avatarOverlay}>
              <FontAwesome name="camera" size={20} color="#fff" />
            </View>
          )}
        </TouchableOpacity>
        <Text style={[styles.name, { color: theme.text }]}>
          {profile?.first_name && profile?.last_name 
            ? `${profile.first_name} ${profile.last_name}`
            : 'Wine Lover'
          }
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
        <ProfileOption icon="person-outline" label="Edit Profile" onPress={() => router.push('/edit-profile')} colorScheme={colorScheme} delay={500} />
        <ProfileOption icon="notifications-none" label="Notifications" onPress={handleNotificationsPress} colorScheme={colorScheme} delay={600} />
        <ProfileOption icon="security" label="Security" onPress={() => router.push('/security')} colorScheme={colorScheme} delay={700} />

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

      {/* Image Picker Modal */}
      <ImagePickerModal
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onCamera={handleCameraPress}
        onGallery={handleGalleryPress}
      />

      {/* Custom Camera Modal */}
      <CameraModal
        visible={showCustomCamera}
        onClose={() => setShowCustomCamera(false)}
        onPhotoTaken={handleCustomCameraPhoto}
      />

      {/* Image Crop Modal */}
      <ImageCropModal
        visible={showImageCrop}
        imageUri={selectedImageUri}
        onClose={() => {
          setShowImageCrop(false);
          setSelectedImageUri(null);
        }}
        onCropComplete={handleCropComplete}
        onRetakePhoto={() => {
          setShowImageCrop(false);
          setSelectedImageUri(null);
          setShowCustomCamera(true);
        }}
      />

      {/* Notifications Bottom Sheet */}
      <NotificationsBottomSheet
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        onSave={handleNotificationsSave}
      />
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
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
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