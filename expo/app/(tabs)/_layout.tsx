import React from "react";
import { Tabs } from "expo-router";
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors, darkColors } from "@/constants/colors";
import { Platform } from 'react-native';
import { useThemeStore } from '@/stores/theme-store';
import { useNotificationStore } from '@/stores/notification-store';
import { useUserStore } from '@/stores/user-store';
import { Home, Grid2X2, MessageCircle, UserCircle } from 'lucide-react-native';

function TabBarIcon({ name, color, focused }: { name: string; color: string; focused: boolean }) {
  const { unreadCount } = useNotificationStore();
  const { user } = useUserStore();
  
  const iconComponents = {
    home: () => <Home size={24} color={color} strokeWidth={focused ? 2.5 : 1.5} fill={focused ? color : 'none'} />,
    search: () => <Grid2X2 size={24} color={color} strokeWidth={focused ? 2.5 : 1.5} />,
    message: () => (
      <View style={tabStyles.messageIconContainer}>
        <MessageCircle size={24} color={color} strokeWidth={focused ? 2.5 : 1.5} />
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
      return <UserCircle size={24} color={color} strokeWidth={focused ? 2.5 : 1.5} />;
    },
  };
  
  const IconComponent = iconComponents[name as keyof typeof iconComponents];
  
  return (
    <View style={tabStyles.iconContainer}>
      {IconComponent ? <IconComponent /> : null}
    </View>
  );
}

const tabStyles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
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
          backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
          borderTopWidth: 0.33,
          borderTopColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 34 : 8,
          height: Platform.OS === 'ios' ? 88 : 64,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 0,
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
    </Tabs>
  );
}