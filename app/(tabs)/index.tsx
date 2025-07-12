import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
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

  const handleLikePost = (postId: string) => {
    if (!user) {
      router.push('/auth/sign-in');
    } else {
      toggleLike(postId, user.id);
    }
  };

  const renderRecentPostCard = (post: any, index: number) => {
    const isLiked = user ? isPostLikedByUser(post.id, user.id) : false;
    return (
      <TouchableOpacity 
        key={post.id} 
        style={[styles.recentPostCard, { backgroundColor: currentColors.background }]}
        onPress={() => {
          // Navigate to post details or expand
        }}
      >
        <View style={styles.recentPostContent}>
          <View style={styles.recentPostHeader}>
            <View style={styles.recentPostUserInfo}>
              <View style={[styles.recentPostAvatar, { backgroundColor: currentColors.systemFill }]}>
                <Text style={[styles.recentPostAvatarText, { color: currentColors.primary }]}>
                  {post.userName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={[styles.recentPostAuthor, { color: currentColors.text }]} numberOfLines={1}>
                  {post.userName}
                </Text>
                <Text style={[styles.recentPostTime, { color: currentColors.textSecondary }]}>
                  {formatTimeAgo(post.timestamp)}
                </Text>
              </View>
            </View>
          </View>
          <Text style={[styles.recentPostContentText, { color: currentColors.text }]} numberOfLines={2}>
            {post.content}
          </Text>
          <View style={styles.recentPostStats}>
            <TouchableOpacity 
              style={styles.recentPostStat}
              onPress={() => handleLikePost(post.id)}
            >
              <Heart size={16} color={isLiked ? currentColors.error : currentColors.textSecondary} fill={isLiked ? currentColors.error : 'none'} />
              <Text style={[styles.recentPostStatText, { color: currentColors.textSecondary }]}>{post.likes}</Text>
            </TouchableOpacity>
            <View style={styles.recentPostStat}>
              <MessageCircle size={16} color={currentColors.textSecondary} />
              <Text style={[styles.recentPostStatText, { color: currentColors.textSecondary }]}>{post.comments?.length || 0}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderUserCard = (userItem: any, index: number) => {
    const isCoach = userItem.role === 'coach';
    return (
      <TouchableOpacity 
        key={userItem.id} 
        style={[styles.userCard, { backgroundColor: currentColors.background }]}
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
          <Text style={[styles.userCardSubtitle, { color: 'rgba(255,255,255,0.8)' }]} numberOfLines={1}>
            {userItem.name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.groupedBackground }]}>
      <View style={[styles.header, { backgroundColor: currentColors.groupedBackground }]}>
        <Text style={[styles.headerTitle, { color: currentColors.text }]}>{t('dashboard')}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.createButton, shadows.createButton]}
            onPress={handleCreatePost}
          >
            <Plus size={20} color="#000000" strokeWidth={2.5} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.myPostsButton, shadows.createButton]}
            onPress={handleMyPosts}
          >
            <Edit3 size={18} color="#000000" strokeWidth={2.5} />
          </TouchableOpacity>
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
            <Text style={[styles.sectionTitle, { color: currentColors.text }]}>{t('recentPost')}</Text>
            <TouchableOpacity style={styles.sectionAction} onPress={() => router.push('/all-posts')}>
              <Text style={[styles.sectionActionText, { color: currentColors.primary }]}>{t('seeAll')}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.recentPostsGrid}>
            {recentPosts.map(renderRecentPostCard)}
          </View>
        </View>

        {/* All Coaches Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: currentColors.text }]}>{t('allCoaches')}</Text>
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
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  feed: {
    flex: 1,
  },
  feedContent: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 32,
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
    letterSpacing: -0.3,
  },
  sectionAction: {
    padding: 4,
  },
  sectionActionText: {
    fontSize: 16,
    fontWeight: '500',
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
    minHeight: 140,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  recentPostContent: {
    flex: 1,
  },
  recentPostContentText: {
    fontSize: 14,
    lineHeight: 20,
    marginVertical: 8,
  },
  recentPostHeader: {
    marginBottom: 8,
  },
  recentPostUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentPostAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  recentPostAvatarText: {
    fontSize: 12,
    fontWeight: '600',
  },
  recentPostAuthor: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 1,
  },
  recentPostTime: {
    fontSize: 12,
    fontWeight: '400',
  },
  recentPostStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  recentPostStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recentPostStatText: {
    fontSize: 12,
    fontWeight: '500',
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
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  userCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userCardSubtitle: {
    fontSize: 13,
    fontWeight: '400',
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