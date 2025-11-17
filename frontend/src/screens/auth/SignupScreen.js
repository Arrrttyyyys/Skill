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

const SignupScreen = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    location: '',
    timeZone: '',
  });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigation = useNavigation();

  const handleSignup = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    const result = await signup({
      ...formData,
      age: formData.age ? parseInt(formData.age) : undefined,
    });
    setLoading(false);

    if (!result.success) {
      Alert.alert('Error', result.error);
    }
  };

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Start your skill-sharing journey</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Name *"
            placeholderTextColor={colors.textLight}
            value={formData.name}
            onChangeText={(value) => updateField('name', value)}
            autoCapitalize="words"
          />

          <TextInput
            style={styles.input}
            placeholder="Email *"
            placeholderTextColor={colors.textLight}
            value={formData.email}
            onChangeText={(value) => updateField('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <TextInput
            style={styles.input}
            placeholder="Password *"
            placeholderTextColor={colors.textLight}
            value={formData.password}
            onChangeText={(value) => updateField('password', value)}
            secureTextEntry
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Age (optional)"
            placeholderTextColor={colors.textLight}
            value={formData.age}
            onChangeText={(value) => updateField('age', value)}
            keyboardType="numeric"
          />

          <TextInput
            style={styles.input}
            placeholder="Location (City, Country)"
            placeholderTextColor={colors.textLight}
            value={formData.location}
            onChangeText={(value) => updateField('location', value)}
            autoCapitalize="words"
          />

          <TextInput
            style={styles.input}
            placeholder="Time Zone (e.g., America/New_York)"
            placeholderTextColor={colors.textLight}
            value={formData.timeZone}
            onChangeText={(value) => updateField('timeZone', value)}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.linkText}>
            Already have an account? <Text style={styles.linkTextBold}>Log in</Text>
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
    paddingBottom: 40,
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
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: 'bold',
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

export default SignupScreen;

