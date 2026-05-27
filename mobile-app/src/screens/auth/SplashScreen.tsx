import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }: any) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      if (!isLoading) {
        if (isAuthenticated) {
          navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
        } else {
          navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
        }
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{ scale: logoScale }],
            opacity: logoOpacity,
          },
        ]}
      >
        <View style={styles.logo}>
          <Text style={styles.logoText}>KF</Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.taglineContainer, { opacity: taglineOpacity }]}>
        <Text style={styles.title}>KiranaFlow</Text>
        <Text style={styles.subtitle}>Your Store, Delivered Smart</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  logoText: {
    fontSize: 40,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -2,
  },
  taglineContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 8,
    letterSpacing: 0.3,
  },
});
