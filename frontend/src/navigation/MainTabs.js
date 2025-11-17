import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../theme/colors';

import SwipeScreen from '../screens/main/SwipeScreen';
import BuddiesScreen from '../screens/main/BuddiesScreen';
import BuddyDetailScreen from '../screens/main/BuddyDetailScreen';
import SessionsScreen from '../screens/main/SessionsScreen';
import CreateSessionScreen from '../screens/main/CreateSessionScreen';
import FeedbackScreen from '../screens/main/FeedbackScreen';
import MessagesScreen from '../screens/main/MessagesScreen';
import ChatScreen from '../screens/main/ChatScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator();
const BuddiesStack = createNativeStackNavigator();
const SessionsStack = createNativeStackNavigator();
const MessagesStack = createNativeStackNavigator();

const BuddiesStackNavigator = () => {
  return (
    <BuddiesStack.Navigator
      screenOptions={{
        headerStyle: { 
          backgroundColor: colors.backgroundSecondary,
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
        },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '800', fontSize: 20 },
      }}
    >
      <BuddiesStack.Screen
        name="BuddiesList"
        component={BuddiesScreen}
        options={{ title: 'My Buddies' }}
      />
      <BuddiesStack.Screen
        name="BuddyDetail"
        component={BuddyDetailScreen}
        options={{ title: 'Buddy Details' }}
      />
      <BuddiesStack.Screen
        name="CreateSession"
        component={CreateSessionScreen}
        options={{ title: 'Plan Session' }}
      />
      <BuddiesStack.Screen
        name="Chat"
        component={ChatScreen}
      />
    </BuddiesStack.Navigator>
  );
};

const SessionsStackNavigator = () => {
  return (
    <SessionsStack.Navigator
      screenOptions={{
        headerStyle: { 
          backgroundColor: colors.backgroundSecondary,
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
        },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '800', fontSize: 20 },
      }}
    >
      <SessionsStack.Screen
        name="SessionsList"
        component={SessionsScreen}
        options={{ title: 'Sessions' }}
      />
      <SessionsStack.Screen
        name="CreateSession"
        component={CreateSessionScreen}
        options={{ title: 'Plan Session' }}
      />
      <SessionsStack.Screen
        name="Feedback"
        component={FeedbackScreen}
        options={{ title: 'Session Feedback' }}
      />
    </SessionsStack.Navigator>
  );
};

const MessagesStackNavigator = () => {
  return (
    <MessagesStack.Navigator
      screenOptions={{
        headerStyle: { 
          backgroundColor: colors.backgroundSecondary,
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
        },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '800', fontSize: 20 },
      }}
    >
      <MessagesStack.Screen
        name="MessagesList"
        component={MessagesScreen}
        options={{ title: 'Messages' }}
      />
      <MessagesStack.Screen
        name="Chat"
        component={ChatScreen}
      />
    </MessagesStack.Navigator>
  );
};

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Buddies') {
            iconName = 'account-group';
          } else if (route.name === 'Sessions') {
            iconName = 'calendar-clock';
          } else if (route.name === 'Messages') {
            iconName = 'message-text';
          } else if (route.name === 'Profile') {
            iconName = 'account';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.backgroundSecondary,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          height: Platform.OS === 'ios' ? 88 : 64,
        },
        headerStyle: {
          backgroundColor: colors.backgroundSecondary,
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '800',
          fontSize: 20,
          letterSpacing: 0.5,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={SwipeScreen} 
        options={{ title: 'Skillera' }}
      />
      <Tab.Screen 
        name="Buddies" 
        component={BuddiesStackNavigator}
        options={{ title: 'My Buddies', headerShown: false }}
      />
      <Tab.Screen 
        name="Sessions" 
        component={SessionsStackNavigator}
        options={{ title: 'Sessions', headerShown: false }}
      />
      <Tab.Screen 
        name="Messages" 
        component={MessagesStackNavigator}
        options={{ title: 'Messages', headerShown: false }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default MainTabs;

