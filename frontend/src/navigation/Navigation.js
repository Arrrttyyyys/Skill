import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import SkillSetupScreen from '../screens/onboarding/SkillSetupScreen';
import ProfileSetupScreen from '../screens/onboarding/ProfileSetupScreen';

const Stack = createNativeStackNavigator();

const Navigation = () => {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading screen while checking auth
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading Skillera...</Text>
      </View>
    );
  }

  // Check if user needs to complete onboarding
  const needsOnboarding = user && (!user.skills || user.skills.length === 0);

  // Debug logging
  console.log('Navigation render - isAuthenticated:', isAuthenticated, 'user:', user?.email || 'null');

  return (
    <NavigationContainer key={`nav-${isAuthenticated ? 'auth' : 'unauth'}-${user?.id || 'none'}`}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : needsOnboarding ? (
          <>
            <Stack.Screen name="SkillSetup" component={SkillSetupScreen} />
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
          </>
        ) : (
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textLight,
  },
});

export default Navigation;

