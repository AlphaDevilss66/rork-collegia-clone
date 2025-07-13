import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Image, Pressable } from 'react-native';
import { Heart, MessageCircle, Share, MoreHorizontal, Sparkles, Plus, ChevronRight, Users, User, Edit3, ArrowUpRight } from 'lucide-react-native';
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
    
    return (
      <Pressable 
        key={post.id} 
        style={({ pressed }) => [
          styles.recentPostCard, 
          { backgroundColor: currentColors.background },
          pressed && { opacity: 0.96, transform: [{ scale: 0.98 }] }
        ]}
        onPress={() => {
          // Navigate to post details or expand
        }}
      >
        <View style={styles.recentPostContent}>
          <View style={styles.recentPostHeader}>
            <View style={[styles.roleIndicator, { backgroundColor: post.userRole === 'athlete' ? currentColors.systemBlue : currentColors.systemOrange }]} />
            <View style={styles.recentPostUserInfo}>
              <View style={[styles.recentPostAvatar, { backgroundColor: currentColors.systemFill }]}>
                <Text style={[styles.recentPostAvatarText, { color: currentColors.primary }]}>
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
          <View style={styles.recentPostFooter}>
            <View style={styles.recentPostStats}>
              <View style={styles.recentPostStat}>
                <Heart size={14} color={isLiked ? currentColors.error : currentColors.textSecondary} fill={isLiked ? currentColors.error : 'none'} />
                <Text style={[styles.recentPostStatText, { color: currentColors.textSecondary }]}>{post.likes}</Text>
              </View>
              <View style={styles.recentPostStat}>
                <MessageCircle size={14} color={currentColors.textSecondary} />
                <Text style={[styles.recentPostStatText, { color: currentColors.textSecondary }]}>{post.comments?.length || 0}</Text>
              </View>
            </View>
            <ArrowUpRight size={16} color={currentColors.textTertiary} />
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
          { backgroundColor: currentColors.background },
          pressed && { opacity: 0.96, transform: [{ scale: 0.98 }] }
        ]}
        onPress={() => {
          // Navigate to user profile
        }}
      >
        <View style={styles.userCardImageContainer}>
          <Image 
            source={{ uri: userItem.avatar }} 
            style={styles.userCardImage}
          />
          <View style={[styles.userRoleBadge, { backgroundColor: isCoach ? currentColors.systemOrange : currentColors.systemBlue }]}>
            <Text style={styles.userRoleBadgeText}>{isCoach ? 'C' : 'A'}</Text>
          </View>
        </View>
        <View style={styles.userCardContent}>
          <Text style={[styles.userCardName, { color: currentColors.text }]} numberOfLines={1}>
            {userItem.name}
          </Text>
          <Text style={[styles.userCardSpecialty, { color: currentColors.textSecondary }]} numberOfLines={1}>
            {isCoach ? userItem.specialization : userItem.sport}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.groupedBackground }]}>
      <View style={[styles.header, { backgroundColor: currentColors.groupedBackground }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.headerGreeting, { color: currentColors.textSecondary }]}>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}</Text>
            <Text style={[styles.headerTitle, { color: currentColors.text }]}>{user?.name ? user.name.split(' ')[0] : 'Welcome'}</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable 
              style={({ pressed }) => [
                styles.actionButton, 
                { backgroundColor: currentColors.systemFill },
                pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] }
              ]}
              onPress={handleMyPosts}
            >
              <Edit3 size={18} color={currentColors.primary} strokeWidth={2} />
            </Pressable>
            <Pressable 
              style={({ pressed }) => [
                styles.primaryButton, 
                { backgroundColor: currentColors.primary },
                pressed && { opacity: 0.9, transform: [{ scale: 0.95 }] }
              ]}
              onPress={handleCreatePost}
            >
              <Plus size={18} color="white" strokeWidth={2.5} />
            </Pressable>
          </View>
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
            <View>
              <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Recent Activity</Text>
              <Text style={[styles.sectionSubtitle, { color: currentColors.textSecondary }]}>Latest posts from the community</Text>
            </View>
            <TouchableOpacity 
              style={[styles.seeAllButton, { backgroundColor: currentColors.systemFill }]} 
              onPress={() => router.push('/all-posts')}
            >
              <Text style={[styles.seeAllText, { color: currentColors.primary }]}>{t('seeAll')}</Text>
              <ChevronRight size={14} color={currentColors.primary} />
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentPostsContainer}
            style={styles.recentPostsScroll}
          >
            {recentPosts.map(renderRecentPostCard)}
          </ScrollView>
        </View>

        {/* All Coaches/Athletes Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: currentColors.text }]}>{sectionTitle}</Text>
              <Text style={[styles.sectionSubtitle, { color: currentColors.textSecondary }]}>Connect with {user?.role === 'athlete' ? 'coaches' : 'athletes'}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.seeAllButton, { backgroundColor: currentColors.systemFill }]} 
              onPress={() => router.push('/all-users')}
            >
              <Text style={[styles.seeAllText, { color: currentColors.primary }]}>{t('seeAll')}</Text>
              <ChevronRight size={14} color={currentColors.primary} />
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  headerGreeting: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feed: {
    flex: 1,
  },
  feedContent: {
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.4,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 15,
    fontWeight: '400',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  seeAllText: {
    fontSize: 15,
    fontWeight: '600',
  },
  recentPostsScroll: {
    marginBottom: 8,
  },
  recentPostsContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  recentPostCard: {
    width: 280,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  recentPostContent: {
    flex: 1,
  },
  recentPostHeader: {
    position: 'relative',
    marginBottom: 16,
  },
  roleIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  recentPostUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentPostAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recentPostAvatarText: {
    fontSize: 14,
    fontWeight: '600',
  },
  recentPostDetails: {
    flex: 1,
  },
  recentPostAuthor: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  recentPostTime: {
    fontSize: 13,
    fontWeight: '400',
  },
  recentPostContentText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
    fontWeight: '400',
  },
  recentPostFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  },
  usersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  userCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  userCardImageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 12,
  },
  userCardImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  userRoleBadge: {
    position: 'absolute',
    bottom: -2,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userRoleBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
  },
  userCardContent: {
    alignItems: 'center',
  },
  userCardName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  userCardSpecialty: {
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
  },
});