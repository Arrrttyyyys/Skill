import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../theme/colors';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const FeedbackScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { session } = route.params;
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [confidenceImproved, setConfidenceImproved] = useState(false);
  const [wouldRecommend, setWouldRecommend] = useState(false);

  const buddy = session.buddy;

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    setLoading(true);
    try {
      const toUserId = session.match.userAId === user.id
        ? session.match.userBId
        : session.match.userAId;

      await api.post('/feedback', {
        sessionId: session.id,
        toUserId,
        rating,
        comment,
        confidenceImproved,
        wouldRecommend,
      });

      Alert.alert('Success', 'Feedback submitted!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('SessionsList'),
        },
      ]);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Session Feedback</Text>
        <Text style={styles.subtitle}>
          How did your session with {buddy.name} go?
        </Text>
      </View>

      <View style={styles.sessionInfo}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarEmoji}>👤</Text>
        </View>
        <View style={styles.sessionInfoContent}>
          <Text style={styles.buddyName}>{buddy.name}</Text>
          <Text style={styles.skillName}>
            {session.focusSkill?.name || 'Skill Exchange'}
          </Text>
          {session.dateTime && (
            <Text style={styles.dateTime}>
              {new Date(session.dateTime).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Overall Rating *</Text>
        <Text style={styles.labelSubtext}>How did the session go?</Text>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              style={styles.starButton}
              onPress={() => setRating(star)}
            >
              <Icon
                name={star <= rating ? 'star' : 'star-outline'}
                size={40}
                color={star <= rating ? colors.accent : colors.border}
              />
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.ratingText}>
          {rating === 1 && 'Poor'}
          {rating === 2 && 'Fair'}
          {rating === 3 && 'Good'}
          {rating === 4 && 'Very Good'}
          {rating === 5 && 'Excellent'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>What did you learn or teach?</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Share your experience..."
          placeholderTextColor={colors.textLight}
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setConfidenceImproved(!confidenceImproved)}
        >
          <View
            style={[
              styles.checkbox,
              confidenceImproved && styles.checkboxChecked,
            ]}
          >
            {confidenceImproved && (
              <Icon name="check" size={16} color={colors.white} />
            )}
          </View>
          <Text style={styles.checkboxLabel}>
            I feel more confident in this skill now
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setWouldRecommend(!wouldRecommend)}
        >
          <View
            style={[
              styles.checkbox,
              wouldRecommend && styles.checkboxChecked,
            ]}
          >
            {wouldRecommend && (
              <Icon name="check" size={16} color={colors.white} />
            )}
          </View>
          <Text style={styles.checkboxLabel}>
            I'd recommend this buddy to others
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>
          {loading ? 'Submitting...' : 'Submit Feedback'}
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
  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarEmoji: {
    fontSize: 30,
  },
  sessionInfoContent: {
    flex: 1,
  },
  buddyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  skillName: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  dateTime: {
    fontSize: 14,
    color: colors.textLight,
  },
  section: {
    marginBottom: 30,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  labelSubtext: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
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
    minHeight: 120,
    paddingTop: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
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

export default FeedbackScreen;

