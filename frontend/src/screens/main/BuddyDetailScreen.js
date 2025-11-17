import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { colors } from '../../theme/colors';
import api from '../../config/api';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const BuddyDetailScreen = ({ route }) => {
  const { match } = route.params;
  const [matchDetail, setMatchDetail] = useState(match);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handlePlanSession = () => {
    navigation.navigate('CreateSession', { matchId: match.id, buddy: match.buddy });
  };

  const handleOpenChat = () => {
    navigation.navigate('Chat', { matchId: match.id, buddy: match.buddy });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarEmoji}>👤</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{match.buddy.name}</Text>
          <Text style={styles.location}>{match.buddy.location || 'Location not set'}</Text>
          {match.buddy.bio && <Text style={styles.bio}>{match.buddy.bio}</Text>}
        </View>
      </View>

      {match.compatibility && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skill Exchange</Text>
          {match.compatibility.iCanTeachThem && match.compatibility.iCanTeachThem.length > 0 && (
            <View style={styles.compatibilityBox}>
              <Icon name="teach" size={20} color={colors.primary} />
              <View style={styles.compatibilityContent}>
                <Text style={styles.compatibilityLabel}>You can teach:</Text>
                <Text style={styles.compatibilitySkills}>
                  {match.compatibility.iCanTeachThem.map((s) => s).join(', ')}
                </Text>
              </View>
            </View>
          )}
          {match.compatibility.theyCanTeachMe && match.compatibility.theyCanTeachMe.length > 0 && (
            <View style={[styles.compatibilityBox, styles.compatibilityBoxAlt]}>
              <Icon name="school" size={20} color={colors.accent} />
              <View style={styles.compatibilityContent}>
                <Text style={styles.compatibilityLabel}>They can teach:</Text>
                <Text style={styles.compatibilitySkills}>
                  {match.compatibility.theyCanTeachMe.map((s) => s).join(', ')}
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionButton, styles.chatButton]} onPress={handleOpenChat}>
          <Icon name="message-text" size={24} color={colors.white} />
          <Text style={styles.actionButtonText}>Open Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.sessionButton]}
          onPress={handlePlanSession}
        >
          <Icon name="calendar-plus" size={24} color={colors.white} />
          <Text style={styles.actionButtonText}>Plan Session</Text>
        </TouchableOpacity>
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.backgroundSecondary,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  avatarEmoji: {
    fontSize: 40,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  location: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 12,
  },
  bio: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  section: {
    backgroundColor: colors.backgroundSecondary,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  compatibilityBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  compatibilityBoxAlt: {
    backgroundColor: colors.accent + '10',
  },
  compatibilityContent: {
    flex: 1,
    marginLeft: 12,
  },
  compatibilityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textLight,
    marginBottom: 4,
  },
  compatibilitySkills: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  chatButton: {
    backgroundColor: colors.primary,
  },
  sessionButton: {
    backgroundColor: colors.accent,
  },
  actionButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BuddyDetailScreen;

