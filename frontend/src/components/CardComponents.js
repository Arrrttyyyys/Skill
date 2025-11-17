import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

// Top Color Wash Layer - Gradient overlay
export const TopColorBand = ({ style }) => {
  return (
    <View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.3,
        },
        style,
      ]}
    />
  );
};

// Token Avatar Component
export const TokenAvatar = ({ name, size = 60, style }) => {
  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '👤';

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: 12,
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 2,
          borderColor: 'rgba(255, 255, 255, 0.3)',
        },
        style,
      ]}
    >
      <Text style={{ fontSize: size * 0.4, color: '#FFFFFF', fontWeight: 'bold' }}>
        {initials}
      </Text>
    </View>
  );
};

// Dot Badge Component
export const Dot = ({ color, style }) => {
  return (
    <View
      style={[
        {
          width: 12,
          height: 12,
          borderRadius: 6,
          borderWidth: 2,
          borderColor: 'rgba(255, 255, 255, 0.5)',
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
};

// Compatibility Gauge - Circular SVG chart
export const CompatGauge = ({ score = 0, size = 60 }) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }} viewBox={`0 0 ${size} ${size}`}>
        {/* Background ring */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth={4}
          fill="none"
        />
        {/* Foreground arc */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgb(16, 185, 129)"
          strokeWidth={4}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      {/* Center text */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' }}>
          {score}%
        </Text>
      </View>
    </View>
  );
};

// Badge Component
export const Badge = ({ children, style }) => {
  return (
    <View
      style={[
        {
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.3)',
        },
        style,
      ]}
    >
      <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>
        {children}
      </Text>
    </View>
  );
};

