import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  Image,
  ImageBackground,
  Dimensions
} from 'react-native';
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

import { Button } from '@/components/Button';
import { Colors } from '@/constants/Colors';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const handleLoginPress = () => {
    router.navigate('/auth/login');
  };

  return (
    <ImageBackground 
      source={require('@/assets/images/wine.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
        style={styles.overlay}
      >
        <SafeAreaView style={styles.container}>
          <StatusBar style="light" />
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('@/assets/images/logo.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.appName}>WinAI</Text>
              <Text style={styles.tagline}>Your personal AI wine assistant</Text>
            </View>

            <View style={styles.actionContainer}>
              <Button 
                title="LOGIN" 
                onPress={handleLoginPress}
                color={Colors.dark.wineRed} // Wine red color
              />
              
              <View style={styles.signupContainer}>
                <Text style={styles.noAccountText}>Don't have an account? </Text>
                <Link href="/auth/register" asChild>
                  <TouchableOpacity>
                    <Text style={styles.signUpText}>Sign Up</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    paddingVertical: height * 0.08,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  appName: {
    fontSize: 42,
    fontFamily: 'Montserrat-Bold',
    color: '#ffffff',
    marginBottom: 10,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 18,
    fontFamily: 'Montserrat-Regular',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  actionContainer: {
    width: '100%',
    paddingHorizontal: 30,
    marginTop: height * 0.1,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    alignItems: 'center',
  },
  noAccountText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: '#ffffff',
  },
  signUpText: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#ffffff',
    textDecorationLine: 'underline',
  },
}); 