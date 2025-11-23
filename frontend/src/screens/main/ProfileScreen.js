import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { colors } from '../../theme/colors';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';

const ProfileScreen = () => {
  const { user, logout, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    loadProfile();
    const unsubscribe = navigation.addListener('focus', () => {
      loadProfile();
    });
    return unsubscribe;
  }, [navigation, user]);

  const loadProfile = async () => {
    try {
      setLoading(true);

      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );

      const fetchPromise = api.get(`/users/${user.id}`);

      const response = await Promise.race([fetchPromise, timeoutPromise]);
      setProfile(response.data);
    } catch (error) {
      console.error('Error loading profile:', error);
      // If error or timeout, use basic user info
      setProfile({
        ...user,
        skills: user.skills || [],
        stats: {
          completedSessions: 0,
          avgRatingAsTeacher: 0,
          avgRatingAsLearner: 0
        },
      });
      // Show error message after a delay
      if (error.message === 'Request timeout') {
        Alert.alert('Timeout', 'Profile is taking too long to load. Showing basic info.');
      }
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      handleImageUpload(result.assets[0]);
    }
  };

  const handleImageUpload = async (asset) => {
    try {
      setUploading(true);

      // Create form data
      const formData = new FormData();

      // Get filename and type
      const filename = asset.uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      // Append file
      if (Platform.OS === 'web') {
        // On web, we need to convert the URI to a Blob
        const res = await fetch(asset.uri);
        const blob = await res.blob();
        formData.append('avatar', blob, filename);
      } else {
        // React Native requires uri, name, and type for file uploads
        formData.append('avatar', {
          uri: asset.uri,
          name: filename,
          type: type,
        });
      }

      const response = await api.post(`/users/${user.id}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update local state
      setProfile(prev => ({ ...prev, avatarUrl: response.data.avatarUrl }));

      // Update auth context if needed
      if (updateUser) {
        updateUser({ avatarUrl: response.data.avatarUrl });
      }

      Alert.alert('Success', 'Profile picture updated!');
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    console.log('handleLogout called');

    // For web, use window.confirm; for mobile, use Alert
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const confirmed = window.confirm('Are you sure you want to log out?');
      if (confirmed) {
        performLogout();
      }
    } else {
      Alert.alert('Log Out', 'Are you sure you want to log out?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: performLogout,
        },
      ]);
    }
  };

  const performLogout = async () => {
    console.log('Logout confirmed');
    try {
      await logout();
      console.log('Logout completed');
      // Force a small delay to ensure state updates
      setTimeout(() => {
        // The Navigation component will automatically redirect to Auth screen
        // when isAuthenticated becomes false
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
      if (Platform.OS === 'web') {
        window.alert('Failed to log out. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to log out. Please try again.');
      }
    }
  };

  if (loading || !profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
        {loading && (
          <Text style={styles.loadingHint}>
            If this takes too long, check your connection
          </Text>
        )}
      </View>
    );
  }

  const stats = profile.stats || {
    completedSessions: 0,
    avgRatingAsTeacher: 0,
    avgRatingAsLearner: 0,
  };

  const teachesSkills = profile.skills?.filter((s) => s.type === 'TEACH') || [];
  const learnsSkills = profile.skills?.filter((s) => s.type === 'LEARN') || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.avatarContainer} onPress={pickImage} disabled={uploading}>
          {uploading ? (
            <ActivityIndicator color={colors.primary} />
          ) : profile.avatarUrl ? (
            <Image
              source={{ uri: `${api.defaults.baseURL.replace('/api', '')}${profile.avatarUrl}` }}
              style={styles.avatarImage}
            />
          ) : (
            <Text style={styles.avatarEmoji}>👤</Text>
          )}
          <View style={styles.editBadge}>
            <Icon name="camera" size={14} color="#FFF" />
          </View>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.email}>{profile.email}</Text>
          {profile.location && (
            <Text style={styles.location}>{profile.location}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            Alert.alert('Coming Soon', 'Profile editing will be available soon!');
          }}
        >
          <Icon name="pencil" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {profile.bio && (
        <View style={styles.section}>
          <Text style={styles.bio}>{profile.bio}</Text>
        </View>
      )}

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Icon name="calendar-check" size={24} color={colors.primary} />
          <Text style={styles.statValue}>{stats.completedSessions}</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="star" size={24} color={colors.accent} />
          <Text style={styles.statValue}>
            {stats.avgRatingAsTeacher > 0
              ? stats.avgRatingAsTeacher.toFixed(1)
              : '—'}
          </Text>
          <Text style={styles.statLabel}>As Teacher</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="school" size={24} color={colors.success} />
          <Text style={styles.statValue}>
            {stats.avgRatingAsLearner > 0
              ? stats.avgRatingAsLearner.toFixed(1)
              : '—'}
          </Text>
          <Text style={styles.statLabel}>As Learner</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills I Can Offer</Text>
        <View style={styles.skillsContainer}>
          {teachesSkills.length > 0 ? (
            teachesSkills.map((skill, idx) => (
              <View key={idx} style={styles.skillChip}>
                <Text style={styles.skillChipText}>
                  {skill.skill?.name || 'Unknown'} ({skill.level})
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No skills added yet</Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills I Want to Learn</Text>
        <View style={styles.skillsContainer}>
          {learnsSkills.length > 0 ? (
            learnsSkills.map((skill, idx) => (
              <View key={idx} style={[styles.skillChip, styles.skillChipLearn]}>
                <Text style={styles.skillChipText}>
                  {skill.skill?.name || 'Unknown'} ({skill.level})
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No skills added yet</Text>
          )}
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="logout" size={20} color={colors.error} />
        <Text style={styles.logoutButtonText}>Log Out</Text>
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
  loadingHint: {
    marginTop: 8,
    fontSize: 12,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.backgroundSecondary,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
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
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.backgroundSecondary,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: colors.textLight,
  },
  editButton: {
    padding: 8,
  },
  section: {
    backgroundColor: colors.backgroundSecondary,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bio: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  skillChipLearn: {
    backgroundColor: colors.accent + '20',
    borderColor: colors.accent,
  },
  skillChipText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 16,
    marginTop: 20,
    borderWidth: 2,
    borderColor: colors.error,
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.error,
  },
});

export default ProfileScreen;
