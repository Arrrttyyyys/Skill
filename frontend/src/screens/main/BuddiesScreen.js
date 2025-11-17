import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import { colors } from '../../theme/colors';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const BuddiesScreen = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    loadMatches();
    const unsubscribe = navigation.addListener('focus', () => {
      loadMatches();
    });
    return unsubscribe;
  }, [navigation]);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const response = await api.get('/matches');
      setMatches(response.data);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getSessionStatus = (session) => {
    if (!session) return { text: 'No session planned yet', color: colors.textLight };
    switch (session.status) {
      case 'PROPOSED':
        return { text: 'Session proposed', color: colors.warning };
      case 'ACCEPTED':
        return { text: 'Session scheduled', color: colors.success };
      case 'COMPLETED':
        return { text: 'Session completed', color: colors.primary };
      case 'CANCELLED':
        return { text: 'Session cancelled', color: colors.error };
      default:
        return { text: 'No session planned yet', color: colors.textLight };
    }
  };

  const renderMatch = ({ item }) => {
    const { buddy, compatibility, latestSession } = item;
    const sessionStatus = getSessionStatus(latestSession);

    return (
      <TouchableOpacity
        style={styles.matchCard}
        onPress={() => navigation.navigate('BuddyDetail', { match: item, buddy: item.buddy })}
      >
        <View style={styles.matchHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <View style={styles.matchInfo}>
            <Text style={styles.buddyName}>{buddy.name}</Text>
            <Text style={styles.buddyLocation}>
              {buddy.location || 'Location not set'}
            </Text>
            <Text style={[styles.sessionStatus, { color: sessionStatus.color }]}>
              {sessionStatus.text}
            </Text>
          </View>
          <Icon name="chevron-right" size={24} color={colors.textLight} />
        </View>

        {compatibility && (
          <View style={styles.compatibilitySection}>
            {compatibility.iCanTeachThem && compatibility.iCanTeachThem.length > 0 && (
              <View style={styles.compatibilityRow}>
                <Icon name="teach" size={16} color={colors.primary} />
                <Text style={styles.compatibilityText}>
                  You teach:{' '}
                  {compatibility.iCanTeachThem.map((s) => s).join(', ')}
                </Text>
              </View>
            )}
            {compatibility.theyCanTeachMe && compatibility.theyCanTeachMe.length > 0 && (
              <View style={styles.compatibilityRow}>
                <Icon name="school" size={16} color={colors.accent} />
                <Text style={styles.compatibilityText}>
                  They teach:{' '}
                  {compatibility.theyCanTeachMe.map((s) => s).join(', ')}
                </Text>
              </View>
            )}
          </View>
        )}

        {latestSession && (
          <View style={styles.sessionPreview}>
            <Text style={styles.sessionPreviewText}>
              Latest:{' '}
              {latestSession.focusSkill?.name || 'Skill Exchange'}{' '}
              {latestSession.dateTime && `on ${formatDate(latestSession.dateTime)}`}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading buddies...</Text>
      </View>
    );
  }

  if (matches.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="account-group-outline" size={80} color={colors.textLight} />
        <Text style={styles.emptyTitle}>No buddies yet</Text>
        <Text style={styles.emptyText}>
          Start swiping to find your skill exchange partners!
        </Text>
        <TouchableOpacity
          style={styles.swipeButton}
          onPress={() => navigation.getParent()?.navigate('Home')}
        >
          <Text style={styles.swipeButtonText}>Start Swiping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={matches}
        renderItem={renderMatch}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={loadMatches}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textLight,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 30,
  },
  swipeButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  swipeButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  listContent: {
    padding: 16,
  },
  matchCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 24,
  },
  matchInfo: {
    flex: 1,
  },
  buddyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  buddyLocation: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  sessionStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  compatibilitySection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    gap: 8,
  },
  compatibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compatibilityText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  sessionPreview: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sessionPreviewText: {
    fontSize: 12,
    color: colors.textLight,
  },
});

export default BuddiesScreen;

