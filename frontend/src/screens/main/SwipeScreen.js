import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
  PanResponder,
  Animated,
} from 'react-native';
import { colors } from '../../theme/colors';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TokenAvatar, Dot, CompatGauge, Badge } from '../../components/CardComponents';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
// Card dimensions: Smaller, more manageable size - 85vw max 380px (mobile) or 420px (web), aspect ratio 0.75 (portrait)
const CARD_WIDTH = Math.min(width * 0.85, Platform.OS === 'web' ? 420 : 380);
const CARD_HEIGHT = CARD_WIDTH * 1.4; // Slightly taller for better Gen Z aesthetic
const SWIPE_THRESHOLD = 50; // Minimum swipe distance - lowered for easier swiping

// Generate a gradient based on user's name (simple hash)
const getGradientColors = (name) => {
  // Simple hash function to generate consistent colors
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 60) % 360;

  return [
    `hsl(${hue1}, 70%, 50%)`,
    `hsl(${hue2}, 70%, 45%)`,
  ];
};

const SwipeScreen = () => {
  const [deck, setDeck] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigation = useNavigation();

  // Animation values for swipe
  const position = useRef(new Animated.ValueXY()).current;
  const rotate = position.x.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: ['-10deg', '0deg', '10deg'],
  });

  // Opacity for like/pass overlays
  const likeOpacity = position.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const passOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    loadDeck();
  }, []);

  const loadDeck = async () => {
    try {
      setLoading(true);
      const response = await api.get('/matches/deck');
      setDeck(response.data);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error loading deck:', error);
      Alert.alert('Error', 'Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = (direction) => {
    const x = direction === 'right' ? width + 100 : -width - 100;

    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      position.setValue({ x: 0, y: 0 });
      // No need to reset offset here as we flattened it in release
      performSwipe(direction, deck[currentIndex]);
    });
  };

  const performSwipe = async (direction, currentCard) => {
    // Swipe right = like (heart) - create match
    if (direction === 'right') {
      try {
        await api.post('/matches', { otherUserId: currentCard.id });
        // Gen Z style notification - less intrusive
        if (Platform.OS === 'web') {
          // Use a toast-style notification instead of alert
        } else {
          Alert.alert('💚', `It's a Skill Match with ${currentCard.name}!`, [
            {
              text: 'View Buddies',
              onPress: () => navigation.getParent()?.navigate('Buddies'),
            },
            { text: 'Keep Swiping', style: 'cancel' },
          ]);
        }
      } catch (error) {
        console.error('Error creating match:', error);
      }
    }
    // Swipe left = pass (cross) - just move to next card, no action needed

    setCurrentIndex(prevIndex => prevIndex + 1);
  };

  // Pan responder for drag/swipe on web and mobile
  const panResponder = useMemo(() =>
    PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: () => false, // Let children handle clicks/scrolls initially
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
      },
      // Capture the gesture if it looks like a horizontal swipe, preventing child ScrollViews from scrolling
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        const isHorizontalSwipe = Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 10;
        return isHorizontalSwipe;
      },
      onPanResponderGrant: () => {
        position.setOffset({ x: position.x._value, y: position.y._value });
        position.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (evt, gestureState) => {
        position.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (_, gestureState) => {
        position.flattenOffset(); // Merge offset into value

        const { dx, vx } = gestureState;

        // Check swipe threshold - lowered to 80
        // Also check velocity for flick gestures
        const isSwipeRight = dx > 80 || (dx > 20 && vx > 0.5);
        const isSwipeLeft = dx < -80 || (dx < -20 && vx < -0.5);

        if (isSwipeRight) {
          handleSwipe('right');
        } else if (isSwipeLeft) {
          handleSwipe('left');
        } else {
          // Reset if not swiped enough
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            useNativeDriver: false,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        // Snap back if gesture is terminated
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          friction: 8,
          tension: 40,
          useNativeDriver: false,
        }).start();
      },
    }),
    [currentIndex, deck]
  );

  const calculateCompatibility = (compatibility) => {
    const totalMatches = (compatibility.iCanTeachThem?.length || 0) +
      (compatibility.theyCanTeachMe?.length || 0);
    const maxPossible = 10; // Assuming max 10 skills
    return Math.min(100, Math.round((totalMatches / maxPossible) * 100));
  };

  const renderCard = (profile, index) => {
    if (index < currentIndex) return null;
    if (index > currentIndex) return null;

    const compatibility = profile.compatibility || { iCanTeachThem: [], theyCanTeachMe: [] };
    const compatScore = calculateCompatibility(compatibility);
    const gradientColors = getGradientColors(profile.name);
    const teachesSkills = profile.skills?.filter((s) => s.type === 'TEACH') || [];
    const learnsSkills = profile.skills?.filter((s) => s.type === 'LEARN') || [];

    // Gen Z gradient - more vibrant and modern
    const genZGradient = [
      `hsl(${(compatScore * 3.6) % 360}, 85%, 55%)`,
      `hsl(${(compatScore * 3.6 + 60) % 360}, 75%, 50%)`,
    ];

    // Convert gradient colors to hex for LinearGradient
    const hexColors = gradientColors.map(color => {
      // Convert HSL to hex
      try {
        const hsl = color.match(/\d+/g);
        if (!hsl || hsl.length < 3) return '#4FD1C5'; // fallback

        const h = parseInt(hsl[0]) / 360;
        const s = parseInt(hsl[1]) / 100;
        const l = parseInt(hsl[2]) / 100;

        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h * 6) % 2 - 1));
        const m = l - c / 2;

        let r, g, b;
        if (h < 1 / 6) { r = c; g = x; b = 0; }
        else if (h < 2 / 6) { r = x; g = c; b = 0; }
        else if (h < 3 / 6) { r = 0; g = c; b = x; }
        else if (h < 4 / 6) { r = 0; g = x; b = c; }
        else if (h < 5 / 6) { r = x; g = 0; b = c; }
        else { r = c; g = 0; b = x; }

        const toHex = (n) => {
          const hex = Math.round((n + m) * 255).toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        };

        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
      } catch (error) {
        console.error('Error converting color:', color, error);
        return '#4FD1C5'; // fallback to primary color
      }
    });

    const cardStyle = index === currentIndex ? {
      transform: [
        { translateX: position.x },
        { translateY: position.y },
        { rotate: rotate },
      ],
    } : {
      transform: [{ translateY: (index - currentIndex) * 8 }],
      opacity: 0.95,
    };

    const CardComponent = index === currentIndex ? Animated.View : View;

    return (
      <CardComponent
        key={`${profile.id}-${index}`}
        {...(index === currentIndex ? panResponder.panHandlers : {})}
        style={[
          styles.card,
          cardStyle,
          {
            zIndex: deck.length - index,
          },
        ]}
      >
        {/* Background Gradient - Gen Z style with more vibrant colors */}
        <LinearGradient
          colors={genZGradient.map(color => {
            try {
              const hsl = color.match(/\d+/g);
              if (!hsl || hsl.length < 3) return '#FF6B9D';
              const h = parseInt(hsl[0]) / 360;
              const s = parseInt(hsl[1]) / 100;
              const l = parseInt(hsl[2]) / 100;
              const c = (1 - Math.abs(2 * l - 1)) * s;
              const x = c * (1 - Math.abs((h * 6) % 2 - 1));
              const m = l - c / 2;
              let r, g, b;
              if (h < 1 / 6) { r = c; g = x; b = 0; }
              else if (h < 2 / 6) { r = x; g = c; b = 0; }
              else if (h < 3 / 6) { r = 0; g = c; b = x; }
              else if (h < 4 / 6) { r = 0; g = x; b = c; }
              else if (h < 5 / 6) { r = x; g = 0; b = c; }
              else { r = c; g = 0; b = x; }
              const toHex = (n) => {
                const hex = Math.round((n + m) * 255).toString(16);
                return hex.length === 1 ? '0' + hex : hex;
              };
              return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
            } catch {
              return '#FF6B9D';
            }
          })}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Top Color Wash Layer */}
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)', 'rgba(0, 0, 0, 0.1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* Like Overlay (Heart) - Shows when swiping right */}
        {index === currentIndex && (
          <Animated.View
            style={[
              styles.overlay,
              styles.likeOverlay,
              {
                opacity: likeOpacity,
              },
            ]}
            pointerEvents="none"
          >
            <View style={styles.overlayIconContainer}>
              <Icon name="heart" size={80} color={colors.success} />
              <Text style={styles.overlayText}>LIKE</Text>
            </View>
          </Animated.View>
        )}

        {/* Pass Overlay (Cross) - Shows when swiping left */}
        {index === currentIndex && (
          <Animated.View
            style={[
              styles.overlay,
              styles.passOverlay,
              {
                opacity: passOpacity,
              },
            ]}
            pointerEvents="none"
          >
            <View style={styles.overlayIconContainer}>
              <Icon name="close" size={80} color={colors.error} />
              <Text style={styles.overlayText}>PASS</Text>
            </View>
          </Animated.View>
        )}

        {/* 4-Row Grid Layout */}
        <View style={styles.cardGrid}>
          {/* Row 1: Header (40% height) */}
          <View style={styles.headerRow}>
            {/* 3-column grid */}
            <View style={styles.headerGrid}>
              {/* Avatar Box (left) */}
              <View style={styles.avatarBox}>
                <TokenAvatar name={profile.name} size={70} />
              </View>

              {/* Vertical Dot Badges (center) */}
              <View style={styles.dotColumn}>
                <Dot color="rgb(16, 185, 129)" style={{ marginBottom: 8 }} />
                <Dot color="rgb(147, 51, 234)" style={{ marginBottom: 8 }} />
                <Dot color="rgb(59, 130, 246)" />
              </View>

              {/* Compatibility Gauge (right) */}
              <View style={styles.gaugeBox}>
                <CompatGauge score={compatScore} size={70} />
              </View>
            </View>
          </View>

          {/* Row 2: Name + Handle */}
          <View style={styles.nameRow}>
            <View style={styles.nameContainer}>
              <View style={styles.nameRowContent}>
                <Text style={styles.nameText}>
                  {profile.name} {profile.age && `· ${profile.age}`}
                </Text>
                <Badge style={styles.verifiedBadge}>
                  ✨ Verified
                </Badge>
              </View>
              <Text style={styles.handleText}>
                @{profile.name.toLowerCase().replace(/\s+/g, '_')}
              </Text>
            </View>
          </View>

          {/* Row 3: Bio */}
          <View style={styles.bioRow}>
            <Text style={styles.bioText}>
              {profile.bio || 'No bio available'}
            </Text>
          </View>

          {/* Row 4: Skills & Interests */}
          <View style={styles.bottomRow}>
            <View style={styles.bottomGrid}>
              {/* Left: Skills */}
              <View style={styles.skillsColumn}>
                <Text style={styles.sectionTitle}>Skills</Text>
                <ScrollView
                  style={styles.skillsList}
                  showsVerticalScrollIndicator={false}
                >
                  {teachesSkills.map((skill, idx) => (
                    <View key={idx} style={styles.skillPill}>
                      <Text style={styles.skillPillText}>
                        {skill.skill?.name || 'Unknown'}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>

              {/* Right: Interests */}
              <View style={styles.interestsColumn}>
                <Text style={styles.sectionTitle}>Interests</Text>
                <ScrollView
                  style={styles.interestsList}
                  showsVerticalScrollIndicator={false}
                >
                  {learnsSkills.map((skill, idx) => (
                    <View key={idx} style={styles.interestPill}>
                      <Text style={styles.interestPillText}>
                        {skill.skill?.name || 'Unknown'}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>
        </View>
      </CardComponent>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading profiles...</Text>
      </View>
    );
  }

  if (currentIndex >= deck.length) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="heart-outline" size={80} color={colors.textLight} />
        <Text style={styles.emptyTitle}>No more profiles</Text>
        <Text style={styles.emptyText}>
          Check back later or adjust your filters
        </Text>
        <TouchableOpacity style={styles.reloadButton} onPress={loadDeck}>
          <Text style={styles.reloadButtonText}>Reload Deck</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.deckContainer}>
        {deck.slice(currentIndex, currentIndex + 3).map((profile, index) =>
          renderCard(profile, currentIndex + index)
        )}
      </View>

      <View style={styles.actionButtons}>
        {/* Pass Button - Swipe Left */}
        <TouchableOpacity
          style={[styles.actionButton, styles.passButton]}
          onPress={() => handleSwipe('left', true)}
        >
          <Icon name="close" size={36} color={colors.error} />
        </TouchableOpacity>

        {/* Like Button - Swipe Right */}
        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => handleSwipe('right', true)}
        >
          <Icon name="heart" size={36} color={colors.success} />
        </TouchableOpacity>
      </View>

      <Text style={styles.cardCounter}>
        {currentIndex + 1} / {deck.length}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
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
  reloadButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  reloadButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  deckContainer: {
    width: CARD_WIDTH + 60,
    height: CARD_HEIGHT + 60,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 28, // More rounded for Gen Z aesthetic
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)', // Subtle border for depth
    cursor: Platform.OS === 'web' ? 'grab' : 'default',
    // Web-specific props to prevent browser handling of gestures
    ...(Platform.OS === 'web' ? {
      userSelect: 'none',
      touchAction: 'pan-y', // Allow vertical scroll but handle horizontal in JS
      draggable: false,
    } : {}),
  },
  cardGrid: {
    flex: 1,
    flexDirection: 'column',
  },
  // Row 1: Header (40% height)
  headerRow: {
    flex: 0.4,
    padding: 20,
    justifyContent: 'center',
  },
  headerGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarBox: {
    flex: 1,
    alignItems: 'flex-start',
  },
  dotColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeBox: {
    flex: 1,
    alignItems: 'flex-end',
  },
  // Row 2: Name + Handle
  nameRow: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
  },
  nameContainer: {
    // Container for name and handle
  },
  nameRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 32, // Bigger, bolder for Gen Z
    fontWeight: '800', // Extra bold
    color: '#FFFFFF',
    marginRight: 10,
    letterSpacing: -0.5, // Tighter letter spacing
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  verifiedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.9)', // More vibrant green
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  handleText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 6,
    fontWeight: '500',
  },
  // Row 3: Bio
  bioRow: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flex: 0.2,
  },
  bioText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
  },
  // Row 4: Skills & Interests
  bottomRow: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 8,
    flex: 0.4,
  },
  bottomGrid: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  skillsColumn: {
    flex: 1,
  },
  interestsColumn: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18, // Bigger
    fontWeight: '800', // Extra bold
    color: '#FFFFFF',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  skillsList: {
    flex: 1,
  },
  interestsList: {
    flex: 1,
  },
  skillPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // More visible
    borderRadius: 20, // More rounded
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  interestPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  skillPillText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600', // Bolder
    letterSpacing: 0.2,
  },
  interestPillText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    gap: 20,
  },
  actionButton: {
    width: 70, // Slightly bigger
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 3,
    borderColor: colors.borderBright,
    cursor: Platform.OS === 'web' ? 'pointer' : 'default',
  },
  passButton: {
    borderWidth: 2,
    borderColor: colors.error,
  },
  likeButton: {
    borderWidth: 2,
    borderColor: colors.success,
  },
  starButton: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  cardCounter: {
    marginTop: 20,
    fontSize: 16,
    color: colors.textLight,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
  },
  likeOverlay: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 4,
    borderColor: colors.success,
  },
  passOverlay: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 4,
    borderColor: colors.error,
  },
  overlayIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayText: {
    marginTop: 12,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});

export default SwipeScreen;
