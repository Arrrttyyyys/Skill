import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { colors } from '../../theme/colors';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const POPULAR_SKILLS = [
  'Python', 'JavaScript', 'React', 'UI/UX Design', 'Guitar',
  'Public Speaking', 'Cooking', 'Video Editing', 'Yoga', 'Graphic Design',
  'Watercolor Painting', 'Music Production', 'Data Analysis',
  'Mindfulness Coaching', 'Photography', 'Spanish', 'French',
];

const SkillSetupScreen = () => {
  const [offers, setOffers] = useState([]); // [{ skillName, level }]
  const [learns, setLearns] = useState([]);
  const [selectedSection, setSelectedSection] = useState('offer'); // 'offer' or 'learn'
  const [availableSkills, setAvailableSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, updateUser } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      // In a real app, you'd fetch from API
      // For now, use predefined list
      setAvailableSkills(POPULAR_SKILLS);
    } catch (error) {
      console.error('Error loading skills:', error);
    }
  };

  const addSkill = (skillName, type) => {
    if (type === 'offer') {
      if (offers.find(s => s.skillName === skillName)) return;
      setOffers([...offers, { skillName, level: 'Intermediate' }]);
    } else {
      if (learns.find(s => s.skillName === skillName)) return;
      setLearns([...learns, { skillName, level: 'Beginner' }]);
    }
  };

  const removeSkill = (skillName, type) => {
    if (type === 'offer') {
      setOffers(offers.filter(s => s.skillName !== skillName));
    } else {
      setLearns(learns.filter(s => s.skillName !== skillName));
    }
  };

  const updateLevel = (skillName, level, type) => {
    if (type === 'offer') {
      setOffers(offers.map(s => s.skillName === skillName ? { ...s, level } : s));
    } else {
      setLearns(learns.map(s => s.skillName === skillName ? { ...s, level } : s));
    }
  };

  const handleContinue = async () => {
    if (offers.length === 0 || learns.length === 0) {
      Alert.alert('Required', 'Please add at least one skill you can offer and one you want to learn');
      return;
    }

    setLoading(true);
    try {
      const allSkills = [
        ...offers.map(s => ({ skillName: s.skillName, type: 'TEACH', level: s.level })),
        ...learns.map(s => ({ skillName: s.skillName, type: 'LEARN', level: s.level })),
      ];

      await api.post(`/users/${user.id}/skills`, { skills: allSkills });
      
      // Update user context
      const response = await api.get('/auth/me');
      updateUser(response.data);

      navigation.navigate('ProfileSetup');
    } catch (error) {
      console.error('Error saving skills:', error);
      Alert.alert('Error', 'Failed to save skills');
    } finally {
      setLoading(false);
    }
  };

  const renderSkillChip = (skill, type) => {
    const isOffer = type === 'offer';
    const skillList = isOffer ? offers : learns;

    return (
      <View key={skill.skillName} style={styles.skillChip}>
        <View style={styles.skillChipContent}>
          <Text style={styles.skillChipName}>{skill.skillName}</Text>
          <View style={styles.levelButtons}>
            {SKILL_LEVELS.map(level => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.levelButton,
                  skill.level === level && styles.levelButtonActive,
                ]}
                onPress={() => updateLevel(skill.skillName, level, type)}
              >
                <Text
                  style={[
                    styles.levelButtonText,
                    skill.level === level && styles.levelButtonTextActive,
                  ]}
                >
                  {level[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <TouchableOpacity
          onPress={() => removeSkill(skill.skillName, type)}
          style={styles.removeButton}
        >
          <Text style={styles.removeButtonText}>×</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Set Up Your Skills</Text>
          <Text style={styles.subtitle}>
            What can you teach? What do you want to learn?
          </Text>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, selectedSection === 'offer' && styles.tabActive]}
            onPress={() => setSelectedSection('offer')}
          >
            <Text
              style={[
                styles.tabText,
                selectedSection === 'offer' && styles.tabTextActive,
              ]}
            >
              I Can Offer ({offers.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedSection === 'learn' && styles.tabActive]}
            onPress={() => setSelectedSection('learn')}
          >
            <Text
              style={[
                styles.tabText,
                selectedSection === 'learn' && styles.tabTextActive,
              ]}
            >
              I Want to Learn ({learns.length})
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.selectedSkills}>
          {(selectedSection === 'offer' ? offers : learns).map(skill =>
            renderSkillChip(skill, selectedSection)
          )}
        </View>

        <View style={styles.availableSkills}>
          <Text style={styles.sectionTitle}>Popular Skills</Text>
          <View style={styles.skillGrid}>
            {availableSkills.map(skill => {
              const isSelected = selectedSection === 'offer'
                ? offers.find(s => s.skillName === skill)
                : learns.find(s => s.skillName === skill);

              return (
                <TouchableOpacity
                  key={skill}
                  style={[
                    styles.skillButton,
                    isSelected && styles.skillButtonSelected,
                  ]}
                  onPress={() => !isSelected && addSkill(skill, selectedSection)}
                  disabled={isSelected}
                >
                  <Text
                    style={[
                      styles.skillButtonText,
                      isSelected && styles.skillButtonTextSelected,
                    ]}
                  >
                    {skill}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.continueButton, loading && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={loading}
        >
          <Text style={styles.continueButtonText}>
            {loading ? 'Saving...' : 'Continue'}
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
  tabs: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    padding: 4,
  },
  tab: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: colors.textLight,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.background,
    fontWeight: 'bold',
  },
  selectedSkills: {
    marginBottom: 30,
    minHeight: 100,
  },
  skillChip: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skillChipContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skillChipName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginRight: 12,
  },
  levelButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  levelButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelButtonActive: {
    backgroundColor: colors.primary,
  },
  levelButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.textLight,
  },
  levelButtonTextActive: {
    color: colors.background,
  },
  removeButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  removeButtonText: {
    fontSize: 24,
    color: colors.error,
    fontWeight: 'bold',
  },
  availableSkills: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  skillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  skillButtonSelected: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    opacity: 0.5,
  },
  skillButtonText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  skillButtonTextSelected: {
    color: colors.textLight,
  },
  continueButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SkillSetupScreen;

