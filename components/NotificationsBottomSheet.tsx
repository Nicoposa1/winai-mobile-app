import React, { useState, useMemo, forwardRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { WINE_COLORS } from '@/components/wine/WineColors';
import { Button } from '@/components/Button';
import Animated, { 
  FadeIn, 
  SlideInDown, 
  useSharedValue, 
  useAnimatedStyle, 
  useAnimatedGestureHandler, 
  runOnJS,
  withSpring
} from 'react-native-reanimated';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';

interface NotificationSetting {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  enabled: boolean;
}

interface NotificationsBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSave: (settings: NotificationSetting[]) => void;
}

export const NotificationsBottomSheet = ({ visible, onClose, onSave }: NotificationsBottomSheetProps) => {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = WINE_COLORS[colorScheme];

    const translateY = useSharedValue(0);
    const opacity = useSharedValue(1);

    const [notifications, setNotifications] = useState<NotificationSetting[]>([
      {
        id: 'push',
        title: 'Push Notifications',
        subtitle: 'Receive push notifications on your device',
        icon: 'notifications',
        enabled: true,
      },
    ]);

    const toggleNotification = (id: string) => {
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, enabled: !notif.enabled } : notif
        )
      );
    };

    const handleSave = () => {
      onSave(notifications);
      onClose();
    };

    const closeModal = () => {
      translateY.value = 0;
      opacity.value = 1;
      onClose();
    };

    const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
      onStart: () => {
        // No hacer nada en el inicio
      },
      onActive: (event) => {
        if (event.translationY > 0) {
          translateY.value = event.translationY;
          opacity.value = Math.max(0.5, 1 - event.translationY / 300);
        }
      },
      onEnd: (event) => {
        if (event.translationY > 100 || event.velocityY > 500) {
          // Cerrar modal si se arrastra lo suficiente o con velocidad
          translateY.value = withSpring(300, { damping: 20 });
          opacity.value = withSpring(0, { damping: 20 });
          runOnJS(closeModal)();
        } else {
          // Volver a la posición original
          translateY.value = withSpring(0);
          opacity.value = withSpring(1);
        }
      },
    });

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
      };
    });

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <Animated.View 
          entering={FadeIn.duration(200)}
          style={styles.overlay}
        >
          <TouchableOpacity 
            style={styles.backdrop} 
            activeOpacity={1} 
            onPress={onClose}
          />
          
          <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View 
              entering={SlideInDown.duration(300).delay(100)}
              style={[styles.modal, { backgroundColor: theme.card }, animatedStyle]}
            >
              {/* Handle Bar */}
              <View style={[styles.handleBar, { backgroundColor: theme.burgundy }]} />
            
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.text }]}>
                Notification Settings
              </Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Choose what notifications you want to receive
              </Text>
            </View>

            {/* Notifications List */}
            <View style={styles.scrollContainer}>
              <View style={styles.options}>
                {notifications.map((notification) => (
                  <View 
                    key={notification.id}
                    style={[
                      styles.option, 
                      { 
                        backgroundColor: theme.background,
                        borderColor: theme.border,
                      }
                    ]}
                  >
                    <View style={[styles.iconContainer, { backgroundColor: theme.burgundy }]}>
                      <Ionicons name={notification.icon} size={20} color="white" />
                    </View>
                    <View style={styles.optionText}>
                      <Text style={[styles.optionTitle, { color: theme.text }]}>
                        {notification.title}
                      </Text>
                      <Text style={[styles.optionSubtitle, { color: theme.textSecondary }]}>
                        {notification.subtitle}
                      </Text>
                    </View>
                    <Switch
                      value={notification.enabled}
                      onValueChange={() => toggleNotification(notification.id)}
                      trackColor={{ 
                        false: theme.border, 
                        true: theme.burgundy 
                      }}
                      thumbColor={notification.enabled ? '#fff' : '#f4f3f4'}
                      ios_backgroundColor={theme.border}
                    />
                  </View>
                ))}
              </View>
            </View>

            {/* Save Button */}
            <View style={styles.buttonContainer}>
              <Button
                title="Save Settings"
                onPress={handleSave}
                color={theme.burgundy}
              />
                          </View>
            </Animated.View>
          </PanGestureHandler>
        </Animated.View>
      </Modal>
    );
  };

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  modal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingBottom: 40,
    paddingHorizontal: 20,
    maxHeight: '50%',
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
    opacity: 0.3,
  },
  header: {
    alignItems: 'center',
    marginBottom: 25,
    paddingTop: 10,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  scrollContainer: {
    marginBottom: 25,
  },
  options: {
    gap: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  optionText: {
    flex: 1,
    marginRight: 12,
  },
  optionTitle: {
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    lineHeight: 16,
  },
  buttonContainer: {
    paddingTop: 15,
    paddingBottom: 20,
  },
}); 