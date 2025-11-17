import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { colors } from '../../theme/colors';
import api from '../../config/api';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SessionsScreen = () => {
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [pastSessions, setPastSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'past'
  const navigation = useNavigation();

  useEffect(() => {
    loadSessions();
    const unsubscribe = navigation.addListener('focus', () => {
      loadSessions();
    });
    return unsubscribe;
  }, [navigation]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const [upcomingRes, pastRes] = await Promise.all([
        api.get('/sessions?status=PROPOSED,ACCEPTED'),
        api.get('/sessions?status=COMPLETED'),
      ]);
      setUpcomingSessions(upcomingRes.data);
      setPastSessions(pastRes.data);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Date TBD';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PROPOSED':
        return colors.warning;
      case 'ACCEPTED':
        return colors.success;
      case 'COMPLETED':
        return colors.primary;
      case 'CANCELLED':
        return colors.error;
      default:
        return colors.textLight;
    }
  };

  const renderSession = ({ item }) => {
    const { buddy, focusSkill, dateTime, mode, status, goals } = item;

    return (
      <TouchableOpacity
        style={styles.sessionCard}
        onPress={() => {
          if (status === 'COMPLETED') {
            navigation.navigate('Feedback', { session: item });
          } else {
            // Navigate to buddy detail
            navigation.getParent()?.getParent()?.navigate('Buddies', { 
              screen: 'BuddyDetail', 
              params: { match: { buddy, id: item.match?.id || item.matchId }, buddy } 
            });
          }
        }}
      >
        <View style={styles.sessionHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <View style={styles.sessionInfo}>
            <Text style={styles.buddyName}>{buddy.name}</Text>
            <Text style={styles.skillName}>
              {focusSkill?.name || 'Skill Exchange'}
            </Text>
            <Text style={styles.dateTime}>{formatDateTime(dateTime)}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(status) + '20' },
            ]}
          >
            <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
              {status}
            </Text>
          </View>
        </View>

        {goals && (
          <Text style={styles.goals} numberOfLines={2}>
            {goals}
          </Text>
        )}

        <View style={styles.sessionFooter}>
          <View style={styles.modeBadge}>
            <Icon
              name={mode === 'ONLINE' ? 'video' : 'map-marker'}
              size={16}
              color={colors.textLight}
            />
            <Text style={styles.modeText}>{mode === 'ONLINE' ? 'Online' : 'In-person'}</Text>
          </View>
          {status === 'COMPLETED' && (
            <TouchableOpacity
              style={styles.feedbackButton}
              onPress={() => navigation.navigate('Feedback', { session: item })}
            >
              <Text style={styles.feedbackButtonText}>Give Feedback</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading sessions...</Text>
      </View>
    );
  }

  const sessions = activeTab === 'upcoming' ? upcomingSessions : pastSessions;

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'upcoming' && styles.tabTextActive,
            ]}
          >
            Upcoming ({upcomingSessions.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.tabActive]}
          onPress={() => setActiveTab('past')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'past' && styles.tabTextActive,
            ]}
          >
            Past ({pastSessions.length})
          </Text>
        </TouchableOpacity>
      </View>

      {sessions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="calendar-blank-outline" size={80} color={colors.textLight} />
          <Text style={styles.emptyTitle}>
            {activeTab === 'upcoming' ? 'No upcoming sessions' : 'No past sessions'}
          </Text>
          <Text style={styles.emptyText}>
            {activeTab === 'upcoming'
              ? 'Plan a session with one of your buddies!'
              : 'Your completed sessions will appear here'}
          </Text>
          {activeTab === 'upcoming' && (
            <TouchableOpacity
              style={styles.planButton}
              onPress={() => navigation.getParent()?.navigate('Buddies')}
            >
              <Text style={styles.planButtonText}>View Buddies</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={sessions}
          renderItem={renderSession}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={loadSessions}
        />
      )}
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    padding: 4,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 16,
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
    fontSize: 14,
    fontWeight: '500',
    color: colors.textLight,
  },
  tabTextActive: {
    color: colors.background,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  sessionCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  sessionInfo: {
    flex: 1,
  },
  buddyName: {
    fontSize: 18,
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  goals: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
    lineHeight: 20,
  },
  sessionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modeText: {
    fontSize: 12,
    color: colors.textLight,
  },
  feedbackButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  feedbackButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.background,
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
  planButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  planButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SessionsScreen;

