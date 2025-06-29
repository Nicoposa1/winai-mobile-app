import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Share,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { WINE_COLORS } from '@/components/wine/WineColors';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Constants from 'expo-constants';

interface SupportOptionProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  onPress: () => void;
  colorScheme: 'light' | 'dark';
  delay?: number;
}

const SupportOption: React.FC<SupportOptionProps> = ({
  icon,
  title,
  description,
  onPress,
  colorScheme,
  delay = 0,
}) => {
  const theme = WINE_COLORS[colorScheme];
  
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(300)}
      style={[styles.optionContainer, { backgroundColor: theme.card }]}
    >
      <TouchableOpacity
        style={styles.optionTouchable}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.optionContent}>
          <View style={[styles.iconContainer, { backgroundColor: theme.burgundy }]}>
            <Ionicons name={icon} size={24} color="#fff" />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.optionTitle, { color: theme.text }]}>{title}</Text>
            <Text style={[styles.optionDescription, { color: theme.textSecondary }]}>
              {description}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function HelpSupportScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = WINE_COLORS[colorScheme];
  const [isLoading, setIsLoading] = useState(false);

  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const buildNumber = Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode || '1';

  const handleEmailSupport = async () => {
    const email = 'support@winai.app';
    const subject = 'Solicitud de Soporte - WinAI';
    const body = `Hola equipo de soporte de WinAI,

Necesito ayuda con la aplicación. Mi consulta es la siguiente:

[Por favor describe tu problema o pregunta aquí]

Información técnica:
- Versión de la app: ${appVersion} (${buildNumber})
- Plataforma: ${Platform.OS} ${Platform.Version}
- Dispositivo: ${Platform.OS === 'ios' ? 'iOS Device' : 'Android Device'}

Muchas gracias por su ayuda.

Saludos,
[Tu nombre]`;

    const emailUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    try {
      const canOpen = await Linking.canOpenURL(emailUrl);
      if (canOpen) {
        await Linking.openURL(emailUrl);
      } else {
        Alert.alert(
          'Soporte por Email',
          `Por favor envía un email a: ${email}`,
          [
            { text: 'Copiar Email', onPress: () => Linking.openURL(`mailto:${email}`) },
            { text: 'OK' }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir el cliente de email. Por favor envía un email a support@winai.app');
    }
  };

  const handlePrivacyPolicy = async () => {
    const url = 'https://winai.app/privacy-policy';
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'No se pudo abrir la Política de Privacidad. Por favor visita winai.app/privacy-policy');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir la Política de Privacidad. Por favor visita winai.app/privacy-policy');
    }
  };

  const handleTermsOfService = async () => {
    const url = 'https://winai.app/terms-of-service';
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'No se pudo abrir los Términos de Servicio. Por favor visita winai.app/terms-of-service');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir los Términos de Servicio. Por favor visita winai.app/terms-of-service');
    }
  };

  const handleAboutApp = () => {
    Alert.alert(
      'Acerca de WinAI',
      `Versión: ${appVersion} (${buildNumber})\n\nWinAI es tu compañero inteligente de vinos, te ayuda a descubrir, calificar y gestionar tu colección de vinos con el poder de la IA.\n\nDesarrollado con ❤️ para los amantes del vino en todas partes.`,
      [{ text: 'OK' }]
    );
  };

  const handleReportBug = async () => {
    const email = 'support@winai.app';
    const subject = 'Reporte de Error - WinAI';
    const body = `Hola equipo de WinAI,

He encontrado un error en la aplicación y me gustaría reportarlo:

DESCRIPCIÓN DEL ERROR:
[Describe brevemente qué error encontraste]

PASOS PARA REPRODUCIR EL ERROR:
1. [Primer paso que realizaste]
2. [Segundo paso]
3. [Tercer paso, etc.]

COMPORTAMIENTO ESPERADO:
[Qué esperabas que pasara]

COMPORTAMIENTO ACTUAL:
[Qué pasó realmente]

INFORMACIÓN ADICIONAL:
[Cualquier detalle adicional que pueda ser útil]

Información técnica:
- Versión de la app: ${appVersion} (${buildNumber})
- Plataforma: ${Platform.OS} ${Platform.Version}
- Dispositivo: ${Platform.OS === 'ios' ? 'iOS Device' : 'Android Device'}

Gracias por su tiempo y por mejorar la aplicación.

Saludos,
[Tu nombre]`;

    const emailUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    try {
      await Linking.openURL(emailUrl);
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir el cliente de email. Por favor envía un email a support@winai.app');
    }
  };

  const handleFeatureRequest = async () => {
    const email = 'support@winai.app';
    const subject = 'Solicitud de Nueva Funcionalidad - WinAI';
    const body = `Hola equipo de desarrollo de WinAI,

Me gustaría sugerir una nueva funcionalidad para la aplicación:

FUNCIONALIDAD SOLICITADA:
[Describe la funcionalidad que te gustaría ver en la app]

DESCRIPCIÓN DETALLADA:
[Explica cómo funcionaría esta funcionalidad]

¿POR QUÉ SERÍA ÚTIL?
[Explica por qué esta funcionalidad mejoraría la experiencia de usuario]

CASOS DE USO:
[Describe cuándo y cómo utilizarías esta funcionalidad]

EJEMPLOS O REFERENCIAS:
[Si conoces otras apps que tengan algo similar, menciónalas]

Información técnica:
- Versión de la app: ${appVersion} (${buildNumber})
- Plataforma: ${Platform.OS} ${Platform.Version}
- Dispositivo: ${Platform.OS === 'ios' ? 'iOS Device' : 'Android Device'}

Muchas gracias por considerar mi sugerencia.

Saludos,
[Tu nombre]`;

    const emailUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    try {
      await Linking.openURL(emailUrl);
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir el cliente de email. Por favor envía un email a support@winai.app');
    }
  };

  const handleRateApp = async () => {
    const appId = Platform.OS === 'ios' ? 'YOUR_IOS_APP_ID' : 'com.winai.app';
    const url = Platform.OS === 'ios' 
      ? `https://apps.apple.com/app/id${appId}?action=write-review`
      : `https://play.google.com/store/apps/details?id=${appId}&showAllReviews=true`;
    
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'No se pudo abrir la tienda de aplicaciones');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir la tienda de aplicaciones');
    }
  };

  const handleShareApp = async () => {
    try {
      const result = await Share.share({
        message: Platform.OS === 'ios' 
          ? '¡Mira WinAI - la aplicación inteligente para amantes del vino! https://apps.apple.com/app/winai'
          : '¡Mira WinAI - la aplicación inteligente para amantes del vino! https://play.google.com/store/apps/details?id=com.winai.app',
        title: 'WinAI - Aplicación Compañera de Vinos',
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir la aplicación');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Ayuda y Soporte</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Support Section */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Obtener Ayuda</Text>
        
        <SupportOption
          icon="mail-outline"
          title="Soporte por Email"
          description="Obtén ayuda personalizada vía email"
          onPress={handleEmailSupport}
          colorScheme={colorScheme}
          delay={100}
        />

        {/* Legal Section */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Legal y Privacidad</Text>

        <SupportOption
          icon="shield-outline"
          title="Política de Privacidad"
          description="Cómo protegemos tus datos"
          onPress={handlePrivacyPolicy}
          colorScheme={colorScheme}
          delay={200}
        />

        <SupportOption
          icon="document-text-outline"
          title="Términos de Servicio"
          description="Términos y condiciones de uso"
          onPress={handleTermsOfService}
          colorScheme={colorScheme}
          delay={300}
        />

        {/* Feedback Section */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Comentarios</Text>

        <SupportOption
          icon="bug-outline"
          title="Reportar un Error"
          description="Ayúdanos a mejorar la aplicación"
          onPress={handleReportBug}
          colorScheme={colorScheme}
          delay={400}
        />

        <SupportOption
          icon="bulb-outline"
          title="Solicitar Funcionalidad"
          description="Sugiere nuevas características"
          onPress={handleFeatureRequest}
          colorScheme={colorScheme}
          delay={500}
        />

        <SupportOption
          icon="star-outline"
          title="Calificar la App"
          description="Comparte tu experiencia"
          onPress={handleRateApp}
          colorScheme={colorScheme}
          delay={600}
        />

        <SupportOption
          icon="share-outline"
          title="Compartir WinAI"
          description="Cuéntales a tus amigos sobre la app"
          onPress={handleShareApp}
          colorScheme={colorScheme}
          delay={700}
        />

        {/* About Section */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Acerca de</Text>

        <SupportOption
          icon="information-circle-outline"
          title="Acerca de WinAI"
          description={`Versión ${appVersion} (${buildNumber})`}
          onPress={handleAboutApp}
          colorScheme={colorScheme}
          delay={800}
        />

        {/* Developer Info */}
        <View style={styles.developerInfo}>
          <Text style={[styles.developerText, { color: theme.textSecondary }]}>
            Desarrollado por el Equipo WinAI
          </Text>
          <Text style={[styles.developerText, { color: theme.textSecondary }]}>
            © 2024 WinAI. Todos los derechos reservados.
          </Text>
          <Text style={[styles.developerText, { color: theme.textSecondary }]}>
            Contacto: support@winai.app
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'center',
    marginLeft: -34, // Compensate for back button
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 15,
    marginTop: 25,
  },
  optionContainer: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  optionTouchable: {
    padding: 16,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    lineHeight: 20,
  },
  developerInfo: {
    alignItems: 'center',
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  developerText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    marginBottom: 4,
    textAlign: 'center',
  },
}); 