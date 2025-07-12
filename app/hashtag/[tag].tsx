import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { ArrowLeft, Hash, Heart, MessageCircle, Share, MoreHorizontal } from 'lucide-react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { colors } from '@/constants/colors';
import { usePostsStore } from '@/stores/posts-store';
import { useUserStore } from '@/stores/user-store';

export default function HashtagScreen() {
  const { tag } = useLocalSearchParams<{ tag: string }>();
  const { posts, toggleLike, isPostLikedByUser } = usePostsStore();
  const { user } = useUserStore();

  // Filter posts by hashtag (for demo, we'll create some mock posts with hashtags)
  const hashtagPosts = posts.filter(post => 
    post.content.toLowerCase().includes(`#${tag?.toLowerCase()}`) ||
    post.skills?.some(skill => skill.toLowerCase().includes(tag?.toLowerCase() || ''))
  );

  // Mock posts for demonstration
  const mockHashtagPosts = tag === 'recruitment' ? [
    {
      id: 'hashtag-1',
      userId: 'user-1',
      userName: 'Marcus Johnson',
      userRole: 'athlete' as const,
      content: `Just finished an amazing training session! Working hard to improve my game every day. Looking forward to the upcoming season and potential #recruitment opportunities. 🏀 #Basketball #Training #HardWork`,
      sport: 'Basketball',
      skills: ['3-point shooting', 'Ball handling'],
      likes: 24,
      comments: 8,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      likedBy: ['user-2', 'user-3'], // Mock liked by users
    },
    {
      id: 'hashtag-2',
      userId: 'user-2',
      userName: 'Sarah Williams',
      userRole: 'coach' as const,
      content: `Excited to announce that we're actively looking for talented point guards for our upcoming season! If you're a dedicated athlete with strong leadership skills, we want to hear from you. #recruitment #basketball #pointguard #opportunity`,
      sport: 'Basketball',
      likes: 45,
      comments: 12,
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      likedBy: ['user-1', 'user-3', 'user-4'], // Mock liked by users
    }
  ] : [];

  const allPosts = [...hashtagPosts, ...mockHashtagPosts];

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const renderPost = (post: any) => {
    const isLiked = user ? isPostLikedByUser(post.id, user.id) : false;

    return (
      <View key={post.id} style={styles.postCard}>
        <View style={styles.postHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{post.userName.charAt(0)}</Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{post.userName}</Text>
              <View style={styles.userMeta}>
                <Text style={styles.userRole}>{post.userRole}</Text>
                {post.sport && <Text style={styles.userSport}>• {post.sport}</Text>}
                <Text style={styles.timestamp}>• {formatTimeAgo(post.timestamp)}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <MoreHorizontal size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.postContent}>{post.content}</Text>

        {post.skills && post.skills.length > 0 && (
          <View style={styles.skillsContainer}>
            {post.skills.map((skill: string, index: number) => (
              <View key={index} style={styles.skillTag}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.postActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => user && toggleLike(post.id, user.id)}
            disabled={!user}
          >
            <Heart 
              size={20} 
              color={isLiked ? colors.error : colors.textSecondary}
              fill={isLiked ? colors.error : 'none'}
            />
            <Text style={[styles.actionText, isLiked && { color: colors.error }]}>
              {post.likes}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <MessageCircle size={20} color={colors.textSecondary} />
            <Text style={styles.actionText}>{post.comments}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Share size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <View style={styles.hashtagHeader}>
            <Hash size={20} color={colors.primary} />
            <Text style={styles.headerTitle}>{tag}</Text>
          </View>
          <Text style={styles.postCount}>
            {allPosts.length} {allPosts.length === 1 ? 'post' : 'posts'}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {allPosts.length === 0 ? (
          <View style={styles.emptyState}>
            <Hash size={64} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No posts found</Text>
            <Text style={styles.emptySubtitle}>
              There are no posts with #{tag} yet.{'\n'}
              Be the first to post with this hashtag!
            </Text>
            <TouchableOpacity 
              style={styles.createPostButton}
              onPress={() => router.push('/(tabs)/create')}
            >
              <Text style={styles.createPostButtonText}>Create Post</Text>
            </TouchableOpacity>
          </View>
        ) : (
          allPosts.map(renderPost)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerContent: {
    flex: 1,
  },
  hashtagHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  postCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
    paddingTop: 120,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  createPostButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  createPostButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  postCard: {
    backgroundColor: colors.background,
    padding: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userRole: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  userSport: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  timestamp: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  moreButton: {
    padding: 4,
  },
  postContent: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 12,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  skillTag: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  skillText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    paddingTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});