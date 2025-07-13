import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { ArrowLeft, MapPin, MessageCircle } from 'lucide-react-native';
import { Stack, router } from 'expo-router';
import { useUserStore } from '@/stores/user-store';
import { useThemeStore } from '@/stores/theme-store';
import { colors, darkColors } from '@/constants/colors';
import { shadows } from '@/styles/shadows';
import { mockCoaches, mockAthletes } from '@/mocks/posts';

export default function AllUsersScreen() {
  const { user } = useUserStore();
  const { isDarkMode } = useThemeStore();

  const currentColors = isDarkMode ? darkColors : colors;

  // Get users to display based on current user's role
  const usersToShow = user?.role === 'athlete' ? mockCoaches : mockAthletes;
  const pageTitle = user?.role === 'athlete' ? 'All Coaches' : 'All Athletes';

  const renderUserCard = (userItem: any) => {
    const isCoach = userItem.role === 'coach';
    
    return (
      <TouchableOpacity 
        key={userItem.id} 
        style={[styles.userCard, { backgroundColor: currentColors.background }]}
        onPress={() => {
          router.push(`/profile/${userItem.id}`);
        }}
      >
        <Image 
          source={{ uri: userItem.avatar }} 
          style={styles.userAvatar}
        />
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: currentColors.text }]}>{userItem.name}</Text>
          <Text style={[styles.userRole, { color: currentColors.primary }]}>
            {isCoach ? userItem.specialization : userItem.sport}
          </Text>
          {userItem.location && (
            <View style={styles.locationContainer}>
              <MapPin size={14} color={currentColors.textSecondary} />
              <Text style={[styles.locationText, { color: currentColors.textSecondary }]}>{userItem.location}</Text>
            </View>
          )}
          {userItem.bio && (
            <Text style={[styles.userBio, { color: currentColors.textSecondary }]} numberOfLines={2}>
              {userItem.bio}
            </Text>
          )}
        </View>
        <TouchableOpacity style={[styles.messageButton, { backgroundColor: currentColors.primary }]}>
          <MessageCircle size={16} color="white" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.groupedBackground }]}>
      <Stack.Screen 
        options={{
          title: pageTitle,
          headerStyle: { backgroundColor: currentColors.groupedBackground },
          headerTintColor: currentColors.text,
          headerTitleStyle: { fontWeight: '600', fontSize: 17 },
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.push('/(tabs)')} style={styles.headerButton}>
              <View style={styles.backButtonContent}>
                <ArrowLeft size={20} color={currentColors.primary} />
                <Text style={[styles.backButtonText, { color: currentColors.primary }]}>Dashboard</Text>
              </View>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/(tabs)')} style={styles.headerButton}>
              <Text style={[styles.backButtonText, { color: currentColors.primary }]}>Dashboard</Text>
            </TouchableOpacity>
          ),
        }} 
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.usersContainer}>
          <Text style={[styles.usersCount, { color: currentColors.textSecondary }]}>
            {usersToShow.length} {usersToShow.length === 1 ? 'user' : 'users'}
          </Text>
          {usersToShow.map(renderUserCard)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    padding: 8,
    marginLeft: -8,
  },
  backButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backButtonText: {
    fontSize: 17,
    fontWeight: '400',
  },
  content: {
    flex: 1,
  },
  usersContainer: {
    paddingBottom: 20,
  },
  usersCount: {
    fontSize: 14,
    fontWeight: '400',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    borderRadius: 16,
    ...shadows.card,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationText: {
    fontSize: 14,
    marginLeft: 4,
  },
  userBio: {
    fontSize: 14,
    lineHeight: 18,
  },
  messageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});