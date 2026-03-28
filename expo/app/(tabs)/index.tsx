import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Image, Pressable } from 'react-native';
import { Heart, MessageCircle, Share, MoreHorizontal, Sparkles, Plus, ChevronRight, Users, User, Edit3 } from 'lucide-react-native';
import { router } from 'expo-router';
import { usePostsStore } from '@/stores/posts-store';
import { useUserStore } from '@/stores/user-store';
import { useCommentsStore } from '@/stores/comments-store';
import { useThemeStore } from '@/stores/theme-store';
import { useTranslation } from '@/hooks/useTranslation';
import { colors, darkColors } from '@/constants/colors';
import { shadows } from '@/styles/shadows';
import { mockPosts, mockCoaches, mockAthletes } from '@/mocks/posts';
import CommentsModal from '@/components/CommentsModal';
import ShareModal from '@/components/ShareModal';
import PostOptionsModal from '@/components/PostOptionsModal';

export default function HomeScreen() {
  const { posts, toggleLike, isPostLikedByUser, deletePost } = usePostsStore();
  const { user } = useUserStore();
  const { getCommentsByPostId } = useCommentsStore();
  const { isDarkMode } = useThemeStore();
  const { t } = useTranslation();
  const [selectedPostForComments, setSelectedPostForComments] = useState<string | null>(null);
  const [selectedPostForShare, setSelectedPostForShare] = useState<{ id: string; content: string; author: string } | null>(null);
  const [selectedPostForOptions, setSelectedPostForOptions] = useState<{ id: string; author: string; isOwnPost: boolean } | null>(null);

  const currentColors = isDarkMode ? darkColors : colors;
  
  // Use mock posts if no posts exist
  const displayPosts = posts.length > 0 ? posts : mockPosts;
  const recentPosts = displayPosts.slice(0, 2);
  
  // Get users to display based on current user's role
  const usersToShow = user?.role === 'athlete' ? mockCoaches : mockAthletes;
  const sectionTitle = user?.role === 'athlete' ? t('allCoaches') : t('allAthletes');

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  const handleDeletePost = (postId: string) => {
    deletePost(postId);
  };

  const handleCreatePost = () => {
    if (!user) {
      router.push('/auth/sign-in');
    } else {
      router.push('/create');
    }
  };

  const handleMyPosts = () => {
    if (!user) {
      router.push('/auth/sign-in');
    } else {
      router.push('/my-posts');
    }
  };

  const renderRecentPostCard = (post: any, index: number) => {
    const isLiked = user ? isPostLikedByUser(post.id, user.id) : false;
    const roleAccent = post.userRole === 'athlete' ? currentColors.athleteAccent : currentColors.coachAccent;
    
    return (
      <Pressable 
        key={post.id} 
        style={({ pressed }) => [
          styles.recentPostCard, 
          { backgroundColor: currentColors.cardBackground },
          shadows.card,
          pressed && { opacity: 0.95, transform: [{ scale: 0.98 }] }
        ]}
        onPress={() => {
          // Navigate to post details or expand
        }}
      >
        <View style={styles.recentPostContent}>
          <View style={styles.recentPostHeader}>
            <View style={styles.recentPostUserInfo}>
              <View style={[styles.recentPostAvatar, { backgroundColor: currentColors.systemFill }]}>
                <Text style={[styles.recentPostAvatarText, { color: roleAccent }]}>
                  {post.userName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.recentPostDetails}>
                <Text style={[styles.recentPostAuthor, { color: currentColors.text }]} numberOfLines={1}>
                  {post.userName}
                </Text>
                <Text style={[styles.recentPostTime, { color: currentColors.textSecondary }]}>
                  {formatTimeAgo(post.timestamp)}
                </Text>
              </View>
            </View>
          </View>
          <Text style={[styles.recentPostContentText, { color: currentColors.text }]} numberOfLines={3}>
            {post.content}
          </Text>
          <View style={styles.recentPostStats}>
            <View style={styles.recentPostStat}>
              <Heart size={16} color={isLiked ? currentColors.error : currentColors.textSecondary} fill={isLiked ? currentColors.error : 'none'} />
              <Text style={[styles.recentPostStatText, { color: currentColors.textSecondary }]}>{post.likes}</Text>
            </View>
            <View style={styles.recentPostStat}>
              <MessageCircle size={16} color={currentColors.textSecondary} />
              <Text style={[styles.recentPostStatText, { color: currentColors.textSecondary }]}>{post.comments?.length || 0}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderUserCard = (userItem: any, index: number) => {
    const isCoach = userItem.role === 'coach';
    return (
      <Pressable 
        key={userItem.id} 
        style={({ pressed }) => [
          styles.userCard, 
          { backgroundColor: currentColors.cardBackground },
          shadows.card,
          pressed && { opacity: 0.95, transform: [{ scale: 0.98 }] }
        ]}
        onPress={() => {
          // Navigate to user profile
        }}
      >
        <Image 
          source={{ uri: userItem.avatar }} 
          style={styles.userCardImage}
        />
        <View style={styles.userCardOverlay}>
          <Text style={[styles.userCardTitle, { color: 'white' }]} numberOfLines={1}>
            {isCoach ? userItem.specialization : userItem.sport}
          </Text>
          <Text style={[styles.userCardSubtitle, { color: 'rgba(255,255,255,0.85)' }]} numberOfLines={1}>
            {userItem.name}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.groupedBackground }]}>
      <View style={[styles.header, { backgroundColor: currentColors.groupedBackground }]}>
        <Text style={[styles.headerTitle, { color: currentColors.text }]}>{t('dashboard')}</Text>
        <View style={styles.headerActions}>
          <Pressable 
            style={({ pressed }) => [
              styles.createButton, 
              shadows.createButton,
              pressed && { opacity: 0.9, transform: [{ scale: 0.95 }] }
            ]}
            onPress={handleCreatePost}
          >
            <Plus size={20} color="#000000" strokeWidth={2.5} />
          </Pressable>
          <Pressable 
            style={({ pressed }) => [
              styles.myPostsButton, 
              shadows.createButton,
              pressed && { opacity: 0.9, transform: [{ scale: 0.95 }] }
            ]}
            onPress={handleMyPosts}
          >
            <Edit3 size={18} color="#000000" strokeWidth={2.5} />
          </Pressable>
        </View>
      </View>
      
      <ScrollView 
        style={styles.feed} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedContent}
      >
        {/* Recent Posts Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Recent Post</Text>
            <TouchableOpacity style={styles.sectionAction} onPress={() => router.push('/all-posts')}>
              <Text style={[styles.sectionActionText, { color: currentColors.primary }]}>{t('seeAll')}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.recentPostsGrid}>
            {recentPosts.map(renderRecentPostCard)}
          </View>
        </View>

        {/* All Coaches/Athletes Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: currentColors.text }]}>{sectionTitle}</Text>
            <TouchableOpacity style={styles.sectionAction} onPress={() => router.push('/all-users')}>
              <Text style={[styles.sectionActionText, { color: currentColors.primary }]}>{t('seeAll')}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.usersGrid}>
            {usersToShow.slice(0, 4).map(renderUserCard)}
          </View>
        </View>
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
            const post = posts.find(p => p.id === selectedPostForOptions.id);
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.41,
    lineHeight: 41,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  feed: {
    flex: 1,
  },
  feedContent: {
    paddingBottom: 32,
  },
  section: {
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.26,
    lineHeight: 28,
  },
  sectionAction: {
    padding: 8,
  },
  sectionActionText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 21,
  },
  recentPostsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  recentPostCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    minHeight: 160,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  recentPostContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  recentPostHeader: {
    marginBottom: 12,
  },
  recentPostUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentPostAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  recentPostAvatarText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 16,
  },
  recentPostDetails: {
    flex: 1,
  },
  recentPostAuthor: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 1,
  },
  recentPostTime: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
  recentPostContentText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 12,
    fontWeight: '400',
  },
  recentPostStats: {
    flexDirection: 'row',
    gap: 16,
  },
  recentPostStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recentPostStatText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  usersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  userCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  userCardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  userCardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  userCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 21,
    marginBottom: 2,
  },
  userCardSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  myPostsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
});