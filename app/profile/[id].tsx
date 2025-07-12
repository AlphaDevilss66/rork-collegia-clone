import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { ArrowLeft, MapPin, Calendar, MessageCircle, Heart, TrendingUp } from 'lucide-react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useUserStore } from '@/stores/user-store';
import { usePostsStore } from '@/stores/posts-store';
import { colors } from '@/constants/colors';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { allUsers } = useUserStore();
  const { posts } = usePostsStore();

  const profileUser = allUsers.find(user => user.id === id);

  if (!profileUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>User not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate real stats for this user
  const userPosts = posts.filter(post => post.userId === profileUser.id);
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

  const displayName = profileUser.name && profileUser.name.trim() ? profileUser.name : profileUser.email.split('@')[0];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              {profileUser.avatar ? (
                <Image source={{ uri: profileUser.avatar }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
                </View>
              )}
            </View>
          </View>

          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userRole}>
            {profileUser.role} 
            {profileUser.sport && ` • ${profileUser.sport}`} 
            {profileUser.position && ` • ${profileUser.position}`}
          </Text>

          {profileUser.location && (
            <View style={styles.locationContainer}>
              <MapPin size={14} color={colors.textSecondary} />
              <Text style={styles.locationText}>{profileUser.location}</Text>
            </View>
          )}

          {profileUser.bio && (
            <Text style={styles.bio}>{profileUser.bio}</Text>
          )}

          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.messageButton}>
            <MessageCircle size={16} color="white" />
            <Text style={styles.messageButtonText}>Message</Text>
          </TouchableOpacity>
        </View>

        {profileUser.role === 'coach' && profileUser.teamAffiliation && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Team Affiliation</Text>
            </View>
            <Text style={styles.affiliationText}>{profileUser.teamAffiliation}</Text>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>Activity</Text>
          </View>
          {userPosts.length > 0 ? (
            <View style={styles.activityList}>
              <View style={styles.activityItem}>
                <Text style={styles.activityText}>
                  📝 Posted {userPosts.length} {userPosts.length === 1 ? 'time' : 'times'}
                </Text>
              </View>
              <View style={styles.activityItem}>
                <Text style={styles.activityText}>
                  ❤️ Received {totalLikes} {totalLikes === 1 ? 'like' : 'likes'} on posts
                </Text>
              </View>
              <View style={styles.activityItem}>
                <Text style={styles.activityText}>
                  💬 Got {totalComments} {totalComments === 1 ? 'comment' : 'comments'} from the community
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.activityText}>
              No recent activity to show.
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
    backgroundColor: colors.groupedBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 0.33,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 20,
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
    backgroundColor: colors.systemFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: '600',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  userRole: {
    fontSize: 15,
    color: colors.textSecondary,
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
    color: colors.textSecondary,
    marginLeft: 4,
    fontWeight: '400',
  },
  bio: {
    fontSize: 15,
    color: colors.text,
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
    color: colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    gap: 6,
  },
  messageButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
  section: {
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  affiliationText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 20,
    fontWeight: '400',
  },
  activityList: {
    gap: 8,
  },
  activityItem: {
    backgroundColor: colors.systemFill,
    borderRadius: 8,
    padding: 12,
  },
  activityText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
    fontWeight: '400',
  },
});