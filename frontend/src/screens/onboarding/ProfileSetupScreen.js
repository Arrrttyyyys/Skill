import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { colors } from '../../theme/colors';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';

const AVATARS = [
  'https://i.pravatar.cc/150?img=47',
  'https://i.pravatar.cc/150?img=33',
  'https://i.pravatar.cc/150?img=45',
  'https://i.pravatar.cc/150?img=12',
  'https://i.pravatar.cc/150?img=68',
  'https://i.pravatar.cc/150?img=50',
];

const ProfileSetupScreen = () => {
  const [bio, setBio] = useState('');
  const [preferredMode, setPreferredMode] = useState('EITHER');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [loading, setLoading] = useState(false);
  const { user, updateUser } = useAuth();

  const handleComplete = async () => {
    setLoading(true);
    try {
      await api.put(`/users/${user.id}`, {
        bio,
        preferredMode,
        avatarUrl: selectedAvatar,
        availability: JSON.stringify({
          weekdays: ['evenings'],
          weekends: ['mornings', 'afternoons'],
        }),
      });

      const response = await api.get('/auth/me');
      updateUser(response.data);

      // Navigation will automatically handle going to main app
      Alert.alert('Success', 'Profile setup complete!', [{ text: 'OK' }]);
    } catch (error) {
      console.error('Error completing profile:', error);
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>Tell others about yourself</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Profile Picture</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.avatarScroll}>
            {AVATARS.map((avatar, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.avatarOption,
                  selectedAvatar === avatar && styles.avatarOptionSelected,
                ]}
                onPress={() => setSelectedAvatar(avatar)}
              >
                {/* In a real app, use Image component */}
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarEmoji}>👤</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Tell others about your learning / teaching style..."
            placeholderTextColor={colors.textLight}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Preferred Learning Mode</Text>
          <View style={styles.modeOptions}>
            {['ONLINE', 'IN_PERSON', 'EITHER'].map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.modeButton,
                  preferredMode === mode && styles.modeButtonActive,
                ]}
                onPress={() => setPreferredMode(mode)}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    preferredMode === mode && styles.modeButtonTextActive,
                  ]}
                >
                  {mode === 'EITHER' ? 'Either' : mode === 'ONLINE' ? 'Online' : 'In-person'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.completeButton, loading && styles.buttonDisabled]}
          onPress={handleComplete}
          disabled={loading}
        >
          <Text style={styles.completeButtonText}>
            {loading ? 'Saving...' : 'Complete Setup'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: Platform.OS === 'web' ? 60 : 40,
    paddingBottom: 40,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    marginBottom: 30,
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
  },
  section: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  avatarScroll: {
    marginBottom: 10,
  },
  avatarOption: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 12,
    borderWidth: 3,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  avatarOptionSelected: {
    borderColor: colors.primary,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 40,
  },
  textArea: {
    backgroundColor: colors.backgroundSecondary,
    padding: 16,
    borderRadius: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 100,
  },
  modeOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  modeButton: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  modeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  modeButtonTextActive: {
    color: colors.background,
  },
  completeButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  completeButtonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProfileSetupScreen;

