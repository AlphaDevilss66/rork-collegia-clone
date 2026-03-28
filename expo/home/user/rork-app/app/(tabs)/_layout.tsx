import React from "react";
import { Tabs } from "expo-router";
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors, darkColors } from "@/constants/colors";
import { Platform } from 'react-native';
import { useThemeStore } from '@/stores/theme-store';
import { useNotificationStore } from '@/stores/notification-store';
import { useUserStore } from '@/stores/user-store';
import { Home, Search, MessageCircle, User } from 'lucide-react-native';

function TabBarIcon({ name, color, focused }: { name: string; color: string; focused: boolean }) {
  const { unreadCount } = useNotificationStore();
  const { user } = useUserStore();
  const { isDarkMode } = useThemeStore();
  
  const iconComponents = {
    home: () => <Home size={24} color={color} strokeWidth={focused ? 2.5 : 2} />,
    search: () => <Search size={24} color={color} strokeWidth={focused ? 2.5 : 2} />,
    message: () => (
      <View style={tabStyles.messageIconContainer}>
        <MessageCircle size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
        {unreadCount > 0 && (
          <View style={tabStyles.notificationBadge}>
            <Text style={tabStyles.notificationBadgeText}>
              {unreadCount > 99 ? '99+' : unreadCount.toString()}
            </Text>
          </View>
        )}
      </View>
    ),
    user: () => {
      if (user?.avatar) {
        return (
          <View style={tabStyles.avatarContainer}>
            <Image source={{ uri: user.avatar }} style={tabStyles.avatarImage} />
            {focused && <View style={tabStyles.avatarRing} />}
          </View>
        );
      }
      return <User size={24} color={color} strokeWidth={focused ? 2.5 : 2} />;
    },
  };
  
  const IconComponent = iconComponents[name as keyof typeof iconComponents];
  
  return (
    <View style={[
      tabStyles.iconContainer,
      focused && tabStyles.focusedIconContainer
    ]}>
      {IconComponent ? <IconComponent /> : null}
      {focused && (
        <View style={[
          tabStyles.activeIndicator,
          { backgroundColor: color }
        ]} />
      )}
    </View>
  );
}

const tabStyles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    position: 'relative',
  },
  focusedIconContainer: {
    // No additional styling needed - indicator handles focus state
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  messageIconContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
  },
  avatarContainer: {
    width: 26,
    height: 26,
    borderRadius: 13,
    overflow: 'hidden',
    position: 'relative',
  },
  avatarImage: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  avatarRing: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
});



export default function TabLayout() {
  const { isDarkMode } = useThemeStore();
  const currentColors = isDarkMode ? darkColors : colors;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: currentColors.primary,
        tabBarInactiveTintColor: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)',
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 34 : 20,
          left: 20,
          right: 20,
          height: 70,
          backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
          borderRadius: 25,
          paddingTop: 8,
          paddingBottom: 8,
          paddingHorizontal: 20,
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: '#000000',
          shadowOffset: {
            width: 0,
            height: 10,
          },
          shadowOpacity: isDarkMode ? 0.4 : 0.1,
          shadowRadius: 20,
          borderWidth: isDarkMode ? 0 : 0.5,
          borderColor: isDarkMode ? 'transparent' : 'rgba(0, 0, 0, 0.05)',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
          letterSpacing: 0.2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="home" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Discover",
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="search" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="message" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="user" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}