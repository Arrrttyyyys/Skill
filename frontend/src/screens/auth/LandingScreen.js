import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useNavigation } from '@react-navigation/native';

const LandingScreen = () => {
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Skillera</Text>
        <Text style={styles.tagline}>Match through skills, not small talk.</Text>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => navigation.navigate('Signup')}
        >
          <Text style={styles.primaryButtonText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.secondaryButtonText}>Log In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.demoButton]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.demoButtonText}>Explore Demo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.howItWorks}>
        <Text style={styles.sectionTitle}>How it works</Text>
        <View style={styles.steps}>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>1</Text>
            <Text style={styles.stepText}>
              Identify skills you can teach and skills you want to learn.
            </Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>2</Text>
            <Text style={styles.stepText}>
              Swipe through matching partners.
            </Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>3</Text>
            <Text style={styles.stepText}>
              Save potential buddies.
            </Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>4</Text>
            <Text style={styles.stepText}>
              Plan and conduct a skill exchange session.
            </Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>5</Text>
            <Text style={styles.stepText}>
              Reflect, rate, and give feedback.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingTop: Platform.OS === 'web' ? 60 : 40,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 64,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: 16,
    letterSpacing: -2,
    textShadowColor: colors.shadow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  tagline: {
    fontSize: 20,
    color: colors.textLight,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  buttons: {
    marginBottom: 40,
  },
  button: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  primaryButton: {
    backgroundColor: colors.primary,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  secondaryButtonText: {
    color: colors.secondary,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  demoButton: {
    backgroundColor: 'transparent',
  },
  demoButtonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
  howItWorks: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 24,
    letterSpacing: -1,
  },
  steps: {
    gap: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.backgroundSecondary,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  stepNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.primary,
    marginRight: 16,
    width: 40,
    textAlign: 'center',
    textShadowColor: colors.shadow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    fontWeight: '500',
  },
});

export default LandingScreen;

