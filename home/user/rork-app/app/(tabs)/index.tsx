import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { Heart, MessageCircle, Share, MoreHorizontal, Sparkles, Plus, ChevronRight, Users, User } from 'lucide-react-native';
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

  const renderRecentPostCard = (post: any, index: number) => {
    return (
      <TouchableOpacity 
        key={post.id} 
        style={[styles.recentPostCard, { backgroundColor: currentColors.systemFill }]}
        onPress={() => {
          // Navigate to post details or expand
        }}
      >
        <View style={styles.recentPostContent}>
          <View style={[styles.recentPostIcon, { backgroundColor: currentColors.primary }]}>
            <Heart size={20} color="white" fill="white" />
          </View>
          <View style={styles.recentPostInfo}>
            <Text style={[styles.recentPostAuthor, { color: currentColors.text }]} numberOfLines={1}>
              {post.userName}
            </Text>
            <Text style={[styles.recentPostMeta, { color: currentColors.textSecondary }]}>
              {t('recentPost')}
            </Text>
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
        <TouchableOpacity 
          style={[styles.createButton, shadows.createButton]}
          onPress={() => {
            if (!user) {
              router.push('/auth/sign-in');
            } else {
              router.push('/create');
            }
          }}
        >
          <Plus size={20} color="#000000" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.feed} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedContent}
      >
        {/* Recent Posts Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: currentColors.text }]}>{t('recentPosts')}</Text>
            <TouchableOpacity style={styles.sectionAction}>
              <ChevronRight size={20} color={currentColors.textSecondary} />
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
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.2,
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
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  sectionAction: {
    padding: 4,
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
    minHeight: 120,
    justifyContent: 'flex-end',
  },
  recentPostContent: {
    alignItems: 'flex-start',
  },
  recentPostIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  recentPostInfo: {
    flex: 1,
  },
  recentPostAuthor: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  recentPostMeta: {
    fontSize: 13,
    fontWeight: '400',
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
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
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
    backgroundColor: 'rgba(0,0,0,0.4)',
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
});