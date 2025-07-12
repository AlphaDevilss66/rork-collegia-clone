import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, darkColors } from '@/constants/colors';
import { useThemeStore } from '@/stores/theme-store';
import { useNotificationStore } from '@/stores/notification-store';
import { MessageCircle, Heart, UserPlus, MessageSquare } from 'lucide-react-native';

interface InAppNotificationProps {
  notification: {
    type: 'message' | 'like' | 'comment' | 'follow';
    title: string;
    body: string;
    timestamp: Date;
  } | null;
  onPress?: () => void;
  onDismiss?: () => void;
}

export default function InAppNotification({ notification, onPress, onDismiss }: InAppNotificationProps) {
  const { isDarkMode } = useThemeStore();
  const [slideAnim] = useState(new Animated.Value(-100));
  const [visible, setVisible] = useState(false);

  const currentColors = isDarkMode ? darkColors : colors;

  useEffect(() => {
    if (notification) {
      setVisible(true);
      // Slide down
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();

      // Auto dismiss after 4 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleDismiss = () => {
    Animated.spring(slideAnim, {
      toValue: -100,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start(() => {
      setVisible(false);
      onDismiss?.();
    });
  };

  const handlePress = () => {
    handleDismiss();
    onPress?.();
  };

  const getIcon = () => {
    switch (notification?.type) {
      case 'message':
        return <MessageCircle size={20} color={currentColors.primary} />;
      case 'like':
        return <Heart size={20} color={currentColors.error} />;
      case 'comment':
        return <MessageSquare size={20} color={currentColors.success} />;
      case 'follow':
        return <UserPlus size={20} color={currentColors.systemIndigo} />;
      default:
        return <MessageCircle size={20} color={currentColors.primary} />;
    }
  };

  if (!visible || !notification) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.touchable}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        {Platform.OS === 'ios' ? (
          <BlurView intensity={100} tint={isDarkMode ? 'dark' : 'light'} style={styles.blurContainer}>
            <View style={[styles.content, { backgroundColor: 'transparent' }]}>
              <View style={styles.iconContainer}>
                {getIcon()}
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.title, { color: currentColors.text }]} numberOfLines={1}>
                  {notification.title}
                </Text>
                <Text style={[styles.body, { color: currentColors.textSecondary }]} numberOfLines={2}>
                  {notification.body}
                </Text>
              </View>
            </View>
          </BlurView>
        ) : (
          <View style={[styles.content, { backgroundColor: currentColors.surface }]}>
            <View style={styles.iconContainer}>
              {getIcon()}
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.title, { color: currentColors.text }]} numberOfLines={1}>
                {notification.title}
              </Text>
              <Text style={[styles.body, { color: currentColors.textSecondary }]} numberOfLines={2}>
                {notification.body}
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: Platform.OS === 'ios' ? 50 : 25,
    paddingHorizontal: 16,
  },
  touchable: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  blurContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 64,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(120, 120, 128, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  body: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 16,
  },
});