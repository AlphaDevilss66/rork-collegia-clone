import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userRole: 'athlete' | 'coach';
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  sport?: string;
  skills?: string[];
  likes: number;
  comments: number;
  timestamp: Date;
  likedBy: string[]; // Array of user IDs who liked this post
}

interface PostsState {
  posts: Post[];
  isHydrated: boolean;
  setPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  updatePost: (postId: string, updates: Partial<Post>) => void;
  deletePost: (postId: string) => void;
  toggleLike: (postId: string, userId: string) => void;
  isPostLikedByUser: (postId: string, userId: string) => boolean;
  getPostById: (postId: string) => Post | undefined;
  getTrendingHashtags: () => { tag: string; count: number }[];
  setHydrated: (hydrated: boolean) => void;
}

export const usePostsStore = create<PostsState>()(
  persist(
    (set, get) => ({
      posts: [],
      isHydrated: false,
      setPosts: (posts) => set({ posts }),
      addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
      updatePost: (postId, updates) => set((state) => ({
        posts: state.posts.map(post => 
          post.id === postId ? { ...post, ...updates } : post
        )
      })),
      deletePost: (postId) => set((state) => ({
        posts: state.posts.filter(post => post.id !== postId)
      })),
      toggleLike: (postId, userId) => set((state) => ({
        posts: state.posts.map(post => {
          if (post.id === postId) {
            const isCurrentlyLiked = post.likedBy.includes(userId);
            const newLikedBy = isCurrentlyLiked 
              ? post.likedBy.filter(id => id !== userId)
              : [...post.likedBy, userId];
            
            return {
              ...post,
              likedBy: newLikedBy,
              likes: newLikedBy.length
            };
          }
          return post;
        })
      })),
      isPostLikedByUser: (postId, userId) => {
        const post = get().posts.find(p => p.id === postId);
        return post ? post.likedBy.includes(userId) : false;
      },
      getPostById: (postId) => {
        return get().posts.find(p => p.id === postId);
      },
      getTrendingHashtags: () => {
        const posts = get().posts;
        const hashtagCounts: { [key: string]: number } = {};
        
        posts.forEach(post => {
          // Extract hashtags from content
          const hashtags = post.content.match(/#\w+/g) || [];
          hashtags.forEach(hashtag => {
            const tag = hashtag.substring(1).toLowerCase(); // Remove # and lowercase
            hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
          });
          
          // Also count skills as potential hashtags
          if (post.skills) {
            post.skills.forEach(skill => {
              const tag = skill.toLowerCase();
              hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
            });
          }
        });
        
        // Convert to array and sort by count
        return Object.entries(hashtagCounts)
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10); // Top 10 trending hashtags
      },
      setHydrated: (hydrated) => set({ isHydrated: hydrated }),
    }),
    {
      name: 'posts-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        posts: state.posts,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Error rehydrating posts store:', error);
        }
        
        if (state) {
          // Convert timestamp strings back to Date objects after rehydration
          if (state.posts) {
            state.posts = state.posts.map(post => ({
              ...post,
              timestamp: new Date(post.timestamp)
            }));
          }
          state.isHydrated = true;
        }
      },
    }
  )
);