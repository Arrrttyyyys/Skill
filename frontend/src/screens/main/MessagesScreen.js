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

const MessagesScreen = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    loadConversations();
    const unsubscribe = navigation.addListener('focus', () => {
      loadConversations();
    });
    return unsubscribe;
  }, [navigation]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/messages/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderConversation = ({ item }) => {
    const { buddy, lastMessage, upcomingSession } = item;

    return (
      <TouchableOpacity
        style={styles.conversationCard}
        onPress={() => navigation.navigate('Chat', { matchId: item.matchId, buddy })}
      >
        <View style={styles.conversationHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <View style={styles.conversationInfo}>
            <View style={styles.conversationTop}>
              <Text style={styles.buddyName}>{buddy.name}</Text>
              {lastMessage && (
                <Text style={styles.timestamp}>{formatTime(lastMessage.createdAt)}</Text>
              )}
            </View>
            {upcomingSession && (
              <View style={styles.sessionBadge}>
                <Icon name="calendar-clock" size={12} color={colors.primary} />
                <Text style={styles.sessionBadgeText}>
                  {upcomingSession.focusSkill?.name || 'Session'} on{' '}
                  {upcomingSession.dateTime
                    ? new Date(upcomingSession.dateTime).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'TBD'}
                </Text>
              </View>
            )}
            {lastMessage && (
              <Text style={styles.lastMessage} numberOfLines={2}>
                {lastMessage.content}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading conversations...</Text>
      </View>
    );
  }

  if (conversations.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="message-text-outline" size={80} color={colors.textLight} />
        <Text style={styles.emptyTitle}>No conversations yet</Text>
        <Text style={styles.emptyText}>
          Start chatting with your buddies!
        </Text>
        <TouchableOpacity
          style={styles.buddiesButton}
          onPress={() => navigation.getParent()?.navigate('Buddies')}
        >
          <Text style={styles.buddiesButtonText}>View Buddies</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.matchId}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={loadConversations}
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
  buddiesButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  buddiesButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  conversationCard: {
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
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  conversationInfo: {
    flex: 1,
  },
  conversationTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  buddyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  timestamp: {
    fontSize: 12,
    color: colors.textLight,
  },
  sessionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary + '10',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  sessionBadgeText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  lastMessage: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  },
});

export default MessagesScreen;

