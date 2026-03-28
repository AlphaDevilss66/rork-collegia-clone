import { Post } from '@/stores/posts-store';

export const mockPosts: Post[] = [
  {
    id: '1',
    content: 'Just finished an amazing training session! Working on my serve technique and feeling stronger every day. 💪',
    skills: ['Serve', 'Technique', 'Training'],
    userId: 'user1',
    userName: 'Emma Rodriguez',
    userRole: 'athlete',
    userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    sport: 'Tennis',
    likes: 24,
    comments: [],
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    likedBy: [],
    mediaUrl: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400&h=300&fit=crop'
  },
  {
    id: '2',
    content: 'Great practice with the team today. Remember: consistency beats perfection. Keep pushing your limits!',
    skills: ['Leadership', 'Motivation', 'Team Building'],
    userId: 'user2',
    userName: 'Coach Martinez',
    userRole: 'coach',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    sport: 'Basketball',
    likes: 18,
    comments: [],
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    likedBy: []
  },
  {
    id: '3',
    content: 'Recovery day is just as important as training day. Taking care of my body with proper nutrition and rest.',
    skills: ['Recovery', 'Nutrition', 'Wellness'],
    userId: 'user3',
    userName: 'Alex Chen',
    userRole: 'athlete',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    sport: 'Swimming',
    likes: 31,
    comments: [],
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    likedBy: [],
    mediaUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'
  }
];

export const mockCoaches = [
  {
    id: 'coach1',
    name: 'Sarah Johnson',
    role: 'coach' as const,
    sport: 'Tennis',
    experience: '8 years',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    specialization: 'Technique & Strategy'
  },
  {
    id: 'coach2',
    name: 'Mike Thompson',
    role: 'coach' as const,
    sport: 'Basketball',
    experience: '12 years',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    specialization: 'Team Development'
  },
  {
    id: 'coach3',
    name: 'Lisa Park',
    role: 'coach' as const,
    sport: 'Swimming',
    experience: '6 years',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    specialization: 'Endurance Training'
  },
  {
    id: 'coach4',
    name: 'David Wilson',
    role: 'coach' as const,
    sport: 'Soccer',
    experience: '10 years',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    specialization: 'Youth Development'
  }
];

export const mockAthletes = [
  {
    id: 'athlete1',
    name: 'Emma Rodriguez',
    role: 'athlete' as const,
    sport: 'Tennis',
    level: 'Intermediate',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    achievements: ['Regional Champion 2023']
  },
  {
    id: 'athlete2',
    name: 'Alex Chen',
    role: 'athlete' as const,
    sport: 'Swimming',
    level: 'Advanced',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    achievements: ['State Qualifier', 'Team Captain']
  },
  {
    id: 'athlete3',
    name: 'Jordan Smith',
    role: 'athlete' as const,
    sport: 'Basketball',
    level: 'Beginner',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    achievements: ['Most Improved Player']
  },
  {
    id: 'athlete4',
    name: 'Maya Patel',
    role: 'athlete' as const,
    sport: 'Soccer',
    level: 'Advanced',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    achievements: ['MVP 2023', 'All-Star Team']
  }
];