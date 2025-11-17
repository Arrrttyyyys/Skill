import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../theme/colors';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CreateSessionScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { matchId, buddy } = route.params;
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [matchDetail, setMatchDetail] = useState(null);
  const [formData, setFormData] = useState({
    focusSkillId: '',
    focusRole: '',
    dateTime: '',
    mode: 'ONLINE',
    locationOrLink: '',
    goals: '',
  });

  useEffect(() => {
    loadMatch();
  }, []);

  const loadMatch = async () => {
    try {
      const response = await api.get(`/matches/${matchId}`);
      setMatchDetail(response.data);
      
      // Set default focus role based on compatibility
      if (response.data.compatibility?.theyCanTeachMe?.length > 0) {
        setFormData((prev) => ({
          ...prev,
          focusRole: 'USER_B_TEACHES',
          focusSkillId: '', // User will select
        }));
      }
    } catch (error) {
      console.error('Error loading match:', error);
    }
  };

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    if (!formData.focusSkillId || !formData.focusRole) {
      Alert.alert('Required', 'Please select a skill to focus on');
      return;
    }

    if (!formData.dateTime) {
      Alert.alert('Required', 'Please select a date and time');
      return;
    }

    if (!formData.locationOrLink) {
      Alert.alert(
        'Required',
        `Please provide ${formData.mode === 'ONLINE' ? 'a meeting link' : 'a location'}`
      );
      return;
    }

    setLoading(true);
    try {
      await api.post('/sessions', {
        matchId,
        ...formData,
      });
      Alert.alert('Success', 'Session created!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('SessionsList'),
        },
      ]);
    } catch (error) {
      console.error('Error creating session:', error);
      Alert.alert('Error', 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  if (!matchDetail) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const compatibility = matchDetail.compatibility || {};
  const availableSkills = [
    ...(compatibility.theyCanTeachMe || []).map((s) => ({
      skill: s,
      role: 'USER_B_TEACHES',
      label: `They teach me: ${typeof s === 'string' ? s : s.skill?.name || s}`,
    })),
    ...(compatibility.iCanTeachThem || []).map((s) => ({
      skill: s,
      role: 'USER_A_TEACHES',
      label: `I teach them: ${typeof s === 'string' ? s : s.skill?.name || s}`,
    })),
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Plan Skill Exchange Session</Text>
        <Text style={styles.subtitle}>Schedule a session with {buddy.name}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Skill Focus *</Text>
        {availableSkills.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.skillOption,
              formData.focusSkillId === (item.skill?.skill?.id || item.skill) &&
                formData.focusRole === item.role &&
                styles.skillOptionSelected,
            ]}
            onPress={() => {
              updateField('focusSkillId', item.skill?.skill?.id || item.skill);
              updateField('focusRole', item.role);
            }}
          >
            <Text
              style={[
                styles.skillOptionText,
                formData.focusSkillId === (item.skill?.skill?.id || item.skill) &&
                  formData.focusRole === item.role &&
                  styles.skillOptionTextSelected,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Date & Time *</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD HH:MM (e.g., 2024-03-15 14:00)"
          placeholderTextColor={colors.textLight}
          value={formData.dateTime}
          onChangeText={(value) => updateField('dateTime', value)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Mode *</Text>
        <View style={styles.modeOptions}>
          {['ONLINE', 'IN_PERSON'].map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.modeButton,
                formData.mode === mode && styles.modeButtonActive,
              ]}
              onPress={() => {
                updateField('mode', mode);
                updateField('locationOrLink', ''); // Clear location/link when mode changes
              }}
            >
              <Icon
                name={mode === 'ONLINE' ? 'video' : 'map-marker'}
                size={20}
                color={formData.mode === mode ? colors.white : colors.text}
              />
              <Text
                style={[
                  styles.modeButtonText,
                  formData.mode === mode && styles.modeButtonTextActive,
                ]}
              >
                {mode === 'ONLINE' ? 'Online' : 'In-person'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>
          {formData.mode === 'ONLINE' ? 'Meeting Link *' : 'Location *'}
        </Text>
        <TextInput
          style={styles.input}
          placeholder={
            formData.mode === 'ONLINE'
              ? 'https://meet.skillera.com/...'
              : 'e.g., Local café downtown'
          }
          placeholderTextColor={colors.textLight}
          value={formData.locationOrLink}
          onChangeText={(value) => updateField('locationOrLink', value)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Goals</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="What do you want to accomplish in this session?"
          placeholderTextColor={colors.textLight}
          value={formData.goals}
          onChangeText={(value) => updateField('goals', value)}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>
          {loading ? 'Creating...' : 'Create Session'}
        </Text>
      </TouchableOpacity>
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
    paddingBottom: 40,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  skillOption: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: 12,
  },
  skillOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  skillOptionText: {
    fontSize: 16,
    color: colors.text,
  },
  skillOptionTextSelected: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: colors.backgroundSecondary,
    padding: 16,
    borderRadius: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 16,
  },
  modeOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: colors.border,
    gap: 8,
  },
  modeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  modeButtonTextActive: {
    color: colors.background,
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CreateSessionScreen;

