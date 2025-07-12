import { create } from 'zustand';

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: Date;
}

interface CommentsState {
  comments: Comment[];
  addComment: (comment: Comment) => void;
  getCommentsByPostId: (postId: string) => Comment[];
}

export const useCommentsStore = create<CommentsState>((set, get) => ({
  comments: [],
  addComment: (comment) => set((state) => ({ 
    comments: [...state.comments, comment] 
  })),
  getCommentsByPostId: (postId) => {
    return get().comments.filter(comment => comment.postId === postId);
  },
}));