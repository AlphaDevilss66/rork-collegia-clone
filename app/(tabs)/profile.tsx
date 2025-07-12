import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { Settings, MapPin, Calendar, Users, Edit3, LogOut, TrendingUp, Heart, MessageCircle, Camera, ImageIcon } from 'lucide-react-native';
import { useUserStore } from '@/stores/user-store';
import { usePostsStore } from '@/stores/posts-store';
import { useThemeStore } from '@/stores/theme-store';
import { colors, darkColors } from '@/constants/colors';
import { shadows } from '@/styles/shadows';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const { user, isAuthenticated, signOut, updateUser } = useUserStore();
  const { posts } = usePostsStore();
  const { isDarkMode } = useThemeStore();
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  
  const currentColors = isDarkMode ? darkColors : colors;

  const handleSignIn = () => {
    router.push('/auth/sign-in');
  };

  const handleSignUp = () => {
    router.push('/auth/sign-up');
  };

  const handleSignOut = () => {
    signOut();
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  const handleAvatarPress = () => {
    Alert.alert(
      'Update Profile Picture',
      'Choose how you want to update your profile picture',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: handleTakePhoto },
        { text: 'Choose from Library', onPress: handleChoosePhoto },
      ]
    );
  };

  const handleTakePhoto = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Available', 'Camera is not available on web. Please choose from library.');
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is required to take photos.');
      return;
    }

    setIsUpdatingAvatar(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        updateUser({ avatar: result.assets[0].uri });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  const handleChoosePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Photo library permission is required to choose photos.');
      return;
    }

    setIsUpdatingAvatar(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        updateUser({ avatar: result.assets[0].uri });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to choose photo. Please try again.');
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  // Show sign in/sign up buttons if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentColors.groupedBackground }]}>
        <View style={[styles.header, { backgroundColor: currentColors.groupedBackground }]}>
          <Text style={[styles.headerTitle, { color: currentColors.text }]}>Profile</Text>
        </View>

        <View style={styles.authContainer}>
          <View style={[styles.authIcon, { backgroundColor: currentColors.systemFill }]}>
            <Users size={28} color={currentColors.primary} />
          </View>
          
          <View style={styles.authContent}>
            <Text style={[styles.authTitle, { color: currentColors.text }]}>Welcome to Collegia</Text>
            <Text style={[styles.authSubtitle, { color: currentColors.textSecondary }]}>
              Connect with athletes and coaches, showcase your skills, and get recruited.
            </Text>

            <View style={styles.authButtons}>
              <TouchableOpacity style={[styles.signInButton, { backgroundColor: currentColors.primary }]} onPress={handleSignIn}>
                <Text style={styles.signInButtonText}>Sign In</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.signUpButton, { backgroundColor: currentColors.systemFill }]} onPress={handleSignUp}>
                <Text style={[styles.signUpButtonText, { color: currentColors.primary }]}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.authFooter, { color: currentColors.textSecondary }]}>
              Join thousands of athletes and coaches already on Collegia
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate real stats
  const userPosts = posts.filter(post => post.userId === user.id);
  const totalLikes = userPosts.reduce((sum, post) => sum + post.likes, 0);
  const totalComments = userPosts.reduce((sum, post) => sum + post.comments, 0);

  const stats = [
    { 
      label: 'Posts', 
      value: userPosts.length.toString(),
      icon: TrendingUp,
    },
    { 
      label: 'Likes', 
      value: totalLikes.toString(),
      icon: Heart,
    },
    { 
      label: 'Comments', 
      value: totalComments.toString(),
      icon: MessageCircle,
    },
  ];

  // Get display name - prioritize name, fallback to email username
  const displayName = user.name && user.name.trim() ? user.name : user.email.split('@')[0];
  const needsProfileCompletion = !user.name || !user.name.trim();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.groupedBackground }]}>
      <View style={[styles.header, { backgroundColor: currentColors.groupedBackground }]}>
        <Text style={[styles.headerTitle, { color: currentColors.text }]}>Profile</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={[styles.headerButton, { backgroundColor: currentColors.systemFill }]} onPress={handleSettings}>
            <Settings size={18} color={currentColors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerButton, { backgroundColor: currentColors.systemFill }]} onPress={handleSignOut}>
            <LogOut size={18} color={currentColors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={[styles.profileHeader, { backgroundColor: currentColors.background }]}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              {user.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: currentColors.systemFill }]}>
                  <Text style={[styles.avatarText, { color: currentColors.primary }]}>{displayName.charAt(0).toUpperCase()}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity 
              style={[styles.editAvatarButton, { backgroundColor: currentColors.background, borderColor: currentColors.border }]} 
              onPress={handleAvatarPress}
              disabled={isUpdatingAvatar}
            >
              {isUpdatingAvatar ? (
                <Text style={{ fontSize: 10, color: currentColors.primary }}>...</Text>
              ) : (
                <Edit3 size={14} color={currentColors.primary} />
              )}
            </TouchableOpacity>
          </View>

          <Text style={[styles.userName, { color: currentColors.text }]}>{displayName}</Text>
          <Text style={[styles.userRole, { color: currentColors.textSecondary }]}>{user.role} {user.sport && `• ${user.sport}`} {user.position && `• ${user.position}`}</Text>

          {user.location && (
            <View style={styles.locationContainer}>
              <MapPin size={14} color={currentColors.textSecondary} />
              <Text style={[styles.locationText, { color: currentColors.textSecondary }]}>{user.location}</Text>
            </View>
          )}

          {user.bio && (
            <Text style={[styles.bio, { color: currentColors.text }]}>{user.bio}</Text>
          )}

          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <Text style={[styles.statValue, { color: currentColors.text }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: currentColors.textSecondary }]}>{stat.label}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity 
            style={[styles.editProfileButton, { backgroundColor: currentColors.systemFill }]}
            onPress={() => router.push('/onboarding')}
          >
            <Text style={[styles.editProfileButtonText, { color: currentColors.primary }]}>
              {needsProfileCompletion ? 'Complete Profile' : 'Edit Profile'}
            </Text>
          </TouchableOpacity>
        </View>

        {user.role === 'coach' && user.teamAffiliation && (
          <View style={[styles.section, { backgroundColor: currentColors.background }]}>
            <View style={styles.sectionHeader}>
              <Users size={18} color={currentColors.primary} />
              <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Team Affiliation</Text>
            </View>
            <Text style={[styles.affiliationText, { color: currentColors.text }]}>{user.teamAffiliation}</Text>
          </View>
        )}

        <View style={[styles.section, { backgroundColor: currentColors.background }]}>
          <View style={styles.sectionHeader}>
            <Calendar size={18} color={currentColors.primary} />
            <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Recent Activity</Text>
          </View>
          {userPosts.length > 0 ? (
            <View style={styles.activityList}>
              <View style={[styles.activityItem, { backgroundColor: currentColors.systemFill }]}>
                <Text style={[styles.activityText, { color: currentColors.textSecondary }]}>
                  📝 Posted {userPosts.length} {userPosts.length === 1 ? 'time' : 'times'} this month
                </Text>
              </View>
              <View style={[styles.activityItem, { backgroundColor: currentColors.systemFill }]}>
                <Text style={[styles.activityText, { color: currentColors.textSecondary }]}>
                  ❤️ Received {totalLikes} {totalLikes === 1 ? 'like' : 'likes'} on your posts
                </Text>
              </View>
              <View style={[styles.activityItem, { backgroundColor: currentColors.systemFill }]}>
                <Text style={[styles.activityText, { color: currentColors.textSecondary }]}>
                  💬 Got {totalComments} {totalComments === 1 ? 'comment' : 'comments'} from the community
                </Text>
              </View>
            </View>
          ) : (
            <Text style={[styles.activityText, { color: currentColors.textSecondary }]}>
              No recent activity to show. Start posting to see your activity here.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.41,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  authIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  authContent: {
    alignItems: 'center',
    maxWidth: 320,
  },
  authTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  authSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    fontWeight: '400',
  },
  authButtons: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  signInButton: {
    borderRadius: 22,
    paddingVertical: 12,
    alignItems: 'center',
  },
  signInButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  signUpButton: {
    borderRadius: 22,
    paddingVertical: 12,
    alignItems: 'center',
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  authFooter: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '400',
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 20,
    marginHorizontal: 20,
    borderRadius: 16,
    ...shadows.card,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '600',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  userRole: {
    fontSize: 15,
    fontWeight: '400',
    textTransform: 'capitalize',
    marginBottom: 8,
    textAlign: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 15,
    marginLeft: 4,
    fontWeight: '400',
  },
  bio: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    fontWeight: '400',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '400',
  },
  editProfileButton: {
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  editProfileButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 20,
    marginHorizontal: 20,
    borderRadius: 16,
    ...shadows.card,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  affiliationText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400',
  },
  activityList: {
    gap: 8,
  },
  activityItem: {
    borderRadius: 8,
    padding: 12,
  },
  activityText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '400',
  },
});