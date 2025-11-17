import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Error', result.error);
    }
  };

  const handleDemoLogin = async (demoEmail) => {
    setLoading(true);
    const result = await login(demoEmail, 'demo');
    setLoading(false);

    if (!result.success) {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Log in to continue your skill journey</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.textLight}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.textLight}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Log In'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.demoSection}>
          <Text style={styles.demoTitle}>Demo Accounts</Text>
          <TouchableOpacity
            style={styles.demoButton}
            onPress={() => handleDemoLogin('emma@skillera.com')}
            disabled={loading}
          >
            <Text style={styles.demoButtonText}>Log in as Emma (Demo)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.demoButton}
            onPress={() => handleDemoLogin('liam@skillera.com')}
            disabled={loading}
          >
            <Text style={styles.demoButtonText}>Log in as Liam (Demo)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.demoButton}
            onPress={() => handleDemoLogin('sarah@skillera.com')}
            disabled={loading}
          >
            <Text style={styles.demoButtonText}>Log in as Sarah (Demo)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.demoButton}
            onPress={() => handleDemoLogin('jake@skillera.com')}
            disabled={loading}
          >
            <Text style={styles.demoButtonText}>Log in as Jake (Demo)</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('Signup')}
        >
          <Text style={styles.linkText}>
            Don't have an account? <Text style={styles.linkTextBold}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
  },
  form: {
    marginBottom: 30,
  },
  input: {
    backgroundColor: colors.backgroundSecondary,
    padding: 16,
    borderRadius: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  demoSection: {
    marginTop: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  demoButton: {
    padding: 12,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  demoButtonText: {
    color: colors.primary,
    fontSize: 14,
    textAlign: 'center',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: colors.textLight,
    fontSize: 14,
  },
  linkTextBold: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});

export default LoginScreen;

