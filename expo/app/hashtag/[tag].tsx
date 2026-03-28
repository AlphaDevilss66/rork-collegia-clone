import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { ArrowLeft, Hash, Heart, MessageCircle, Share, MoreHorizontal } from 'lucide-react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { colors, darkColors } from '@/constants/colors';
import { usePostsStore } from '@/stores/posts-store';
import { useUserStore } from '@/stores/user-store';
import { useThemeStore } from '@/stores/theme-store';
import { shadows } from '@/styles/shadows';
import CommentsModal from '@/components/CommentsModal';
import ShareModal from '@/components/ShareModal';
import PostOptionsModal from '@/components/PostOptionsModal';

export default function HashtagScreen() {
  const { tag } = useLocalSearchParams<{ tag: string }>();
  const { posts, toggleLike, isPostLikedByUser, deletePost } = usePostsStore();
  const { user } = useUserStore();
  const { isDarkMode } = useThemeStore();
  const [selectedPostForComments, setSelectedPostForComments] = useState<string | null>(null);
  const [selectedPostForShare, setSelectedPostForShare] = useState<{ id: string; content: string; author: string } | null>(null);
  const [selectedPostForOptions, setSelectedPostForOptions] = useState<{ id: string; author: string; isOwnPost: boolean } | null>(null);

  const currentColors = isDarkMode ? darkColors : colors;

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

  const handleDeletePost = (postId: string) => {
    deletePost(postId);
  };

  const handleLikePost = (postId: string) => {
    if (!user) {
      router.push('/auth/sign-in');
    } else {
      toggleLike(postId, user.id);
    }
  };

  const renderPost = (post: any) => {
    const isLiked = user ? isPostLikedByUser(post.id, user.id) : false;
    const isOwnPost = user ? post.userId === user.id : false;

    return (
      <View key={post.id} style={[styles.postCard, { backgroundColor: currentColors.background }]}>
        <View style={styles.postHeader}>
          <View style={styles.userInfo}>
            <View style={[styles.avatar, { backgroundColor: currentColors.systemFill }]}>
              {post.userAvatar ? (
                <Image source={{ uri: post.userAvatar }} style={styles.avatarImage} />
              ) : (
                <Text style={[styles.avatarText, { color: currentColors.primary }]}>
                  {post.userName.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <View style={styles.userDetails}>
              <Text style={[styles.userName, { color: currentColors.text }]}>{post.userName}</Text>
              <View style={styles.userMeta}>
                <Text style={[styles.userRole, { color: currentColors.primary }]}>{post.userRole}</Text>
                {post.sport && <Text style={[styles.userSport, { color: currentColors.textSecondary }]}>• {post.sport}</Text>}
                <Text style={[styles.timestamp, { color: currentColors.textSecondary }]}>• {formatTimeAgo(post.timestamp)}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.moreButton}
            onPress={() => setSelectedPostForOptions({
              id: post.id,
              author: post.userName,
              isOwnPost
            })}
          >
            <MoreHorizontal size={20} color={currentColors.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.postContent, { color: currentColors.text }]}>{post.content}</Text>

        {post.skills && post.skills.length > 0 && (
          <View style={styles.skillsContainer}>
            {post.skills.map((skill: string, index: number) => (
              <View key={index} style={[styles.skillTag, { backgroundColor: currentColors.primary }]}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.postActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleLikePost(post.id)}
          >
            <Heart 
              size={20} 
              color={isLiked ? currentColors.error : currentColors.textSecondary}
              fill={isLiked ? currentColors.error : 'none'}
            />
            <Text style={[styles.actionText, { color: currentColors.textSecondary }, isLiked && { color: currentColors.error }]}>
              {post.likes}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setSelectedPostForComments(post.id)}
          >
            <MessageCircle size={20} color={currentColors.textSecondary} />
            <Text style={[styles.actionText, { color: currentColors.textSecondary }]}>{post.comments}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setSelectedPostForShare({
              id: post.id,
              content: post.content,
              author: post.userName
            })}
          >
            <Share size={20} color={currentColors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.groupedBackground }]}>
      <Stack.Screen 
        options={{
          title: `#${tag}`,
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
        }} 
      />

      <View style={[styles.hashtagHeader, { backgroundColor: currentColors.background }]}>
        <View style={styles.hashtagInfo}>
          <Hash size={20} color={currentColors.primary} />
          <Text style={[styles.hashtagTitle, { color: currentColors.text }]}>{tag}</Text>
        </View>
        <Text style={[styles.postCount, { color: currentColors.textSecondary }]}>
          {allPosts.length} {allPosts.length === 1 ? 'post' : 'posts'}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {allPosts.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: currentColors.systemFill }]}>
              <Hash size={32} color={currentColors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: currentColors.text }]}>No posts found</Text>
            <Text style={[styles.emptySubtitle, { color: currentColors.textSecondary }]}>
              There are no posts with #{tag} yet.{'\n'}
              Be the first to post with this hashtag!
            </Text>
          </View>
        ) : (
          <View style={styles.postsContainer}>
            {allPosts.map(renderPost)}
          </View>
        )}
      </ScrollView>

      <CommentsModal
        visible={selectedPostForComments !== null}
        onClose={() => setSelectedPostForComments(null)}
        postId={selectedPostForComments || ''}
      />

      <ShareModal
        visible={selectedPostForShare !== null}
        onClose={() => setSelectedPostForShare(null)}
        postContent={selectedPostForShare?.content || ''}
        postAuthor={selectedPostForShare?.author || ''}
      />

      <PostOptionsModal
        visible={selectedPostForOptions !== null}
        onClose={() => setSelectedPostForOptions(null)}
        onDelete={() => selectedPostForOptions && handleDeletePost(selectedPostForOptions.id)}
        onShare={() => {
          if (selectedPostForOptions) {
            const post = allPosts.find(p => p.id === selectedPostForOptions.id);
            if (post) {
              setSelectedPostForShare({
                id: post.id,
                content: post.content,
                author: post.userName
              });
            }
          }
        }}
        isOwnPost={selectedPostForOptions?.isOwnPost || false}
        postAuthor={selectedPostForOptions?.author || ''}
      />
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
  hashtagHeader: {
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 0.33,
    borderBottomColor: colors.border,
  },
  hashtagInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  hashtagTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginLeft: 8,
  },
  postCount: {
    fontSize: 14,
    fontWeight: '400',
  },
  content: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '400',
  },
  postsContainer: {
    paddingBottom: 20,
  },
  postCard: {
    padding: 20,
    marginBottom: 12,
    marginHorizontal: 16,
    borderRadius: 16,
    ...shadows.card,
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
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userRole: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  userSport: {
    fontSize: 14,
  },
  timestamp: {
    fontSize: 14,
  },
  moreButton: {
    padding: 4,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  skillTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    paddingTop: 12,
    borderTopWidth: 0.33,
    borderTopColor: colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
});