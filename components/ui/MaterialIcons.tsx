// Material Icons - Clean Material You style icons
// Realistic, minimal icons using React Native

import React from 'react';
import { Text, View } from 'react-native';

interface IconProps {
  size?: number;
  color?: string;
}

export const ProfileIcon: React.FC<IconProps> = ({ size = 24, color = '#5F6368' }) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: '#E8F0FE',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <Text style={{ fontSize: size * 0.5, color: '#1A73E8', fontWeight: 'bold' }}>
      U
    </Text>
  </View>
);

export const ShareIcon: React.FC<IconProps> = ({ size = 24, color = '#5F6368' }) => (
  <View
    style={{
      width: size,
      height: size,
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <View
      style={{
        width: size * 0.7,
        height: size * 0.7,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: color,
        backgroundColor: 'transparent',
      }}
    />
    <View
      style={{
        position: 'absolute',
        top: size * 0.2,
        right: size * 0.15,
        width: size * 0.3,
        height: size * 0.3,
        borderRadius: 2,
        backgroundColor: color,
      }}
    />
  </View>
);

export const CameraIcon: React.FC<IconProps> = ({ size = 24, color = '#5F6368' }) => (
  <View
    style={{
      width: size,
      height: size * 0.8,
      borderRadius: 4,
      borderWidth: 1.5,
      borderColor: color,
      backgroundColor: 'transparent',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <View
      style={{
        width: size * 0.4,
        height: size * 0.4,
        borderRadius: size * 0.2,
        borderWidth: 1,
        borderColor: color,
      }}
    />
  </View>
);

export const MicrophoneIcon: React.FC<IconProps> = ({ size = 24, color = '#5F6368' }) => (
  <View
    style={{
      width: size,
      height: size,
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <View
      style={{
        width: size * 0.4,
        height: size * 0.6,
        borderRadius: size * 0.2,
        borderWidth: 1.5,
        borderColor: color,
        backgroundColor: 'transparent',
      }}
    />
    <View
      style={{
        position: 'absolute',
        bottom: size * 0.1,
        width: size * 0.6,
        height: 1,
        backgroundColor: color,
      }}
    />
  </View>
);

export const HomeIcon: React.FC<IconProps> = ({ size = 24, color = '#5F6368' }) => (
  <View
    style={{
      width: size,
      height: size,
      justifyContent: 'flex-end',
      alignItems: 'center',
    }}
  >
    <View
      style={{
        width: size * 0.7,
        height: size * 0.6,
        borderWidth: 1.5,
        borderColor: color,
        borderTopWidth: 0,
        backgroundColor: 'transparent',
      }}
    />
    <View
      style={{
        position: 'absolute',
        top: size * 0.2,
        width: 0,
        height: 0,
        borderLeftWidth: size * 0.4,
        borderRightWidth: size * 0.4,
        borderBottomWidth: size * 0.3,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: color,
      }}
    />
  </View>
);

export const ExploreIcon: React.FC<IconProps> = ({ size = 24, color = '#5F6368' }) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth: 1.5,
      borderColor: color,
      backgroundColor: 'transparent',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <View
      style={{
        width: size * 0.3,
        height: size * 0.3,
        borderRadius: size * 0.15,
        backgroundColor: color,
      }}
    />
  </View>
);

export const UserIcon: React.FC<IconProps> = ({ size = 24, color = '#5F6368' }) => (
  <View
    style={{
      width: size,
      height: size,
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <View
      style={{
        width: size * 0.4,
        height: size * 0.4,
        borderRadius: size * 0.2,
        backgroundColor: color,
        marginBottom: size * 0.05,
      }}
    />
    <View
      style={{
        width: size * 0.7,
        height: size * 0.4,
        borderTopLeftRadius: size * 0.35,
        borderTopRightRadius: size * 0.35,
        backgroundColor: color,
      }}
    />
  </View>
);