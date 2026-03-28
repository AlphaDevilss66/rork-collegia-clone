import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNotificationStore } from './notification-store';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[]; // Array of user IDs
  participantNames: string[]; // Array of user names
  lastMessage?: Message;
  lastMessageTime: Date;
  unreadCount: number;
  unreadBy: string[]; // Array of user IDs who haven't read the latest messages
}

interface MessagingState {
  conversations: Conversation[];
  messages: Message[];
  isHydrated: boolean;
  addConversation: (conversation: Conversation) => void;
  addMessage: (message: Message) => void;
  getConversationById: (id: string) => Conversation | undefined;
  getMessagesByConversationId: (conversationId: string) => Message[];
  getConversationsForUser: (userId: string) => Conversation[];
  markConversationAsRead: (conversationId: string, userId: string) => void;
  createOrGetConversation: (currentUserId: string, otherUserId: string, otherUserName: string, currentUserName: string) => string;
  sendMessage: (conversationId: string, senderId: string, senderName: string, content: string) => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useMessagingStore = create<MessagingState>()(
  persist(
    (set, get) => ({
      conversations: [],
      messages: [],
      isHydrated: false,

      addConversation: (conversation) => set((state) => ({
        conversations: [...state.conversations, conversation]
      })),

      addMessage: (message) => set((state) => {
        const updatedMessages = [...state.messages, message];
        
        // Update the conversation's last message
        const updatedConversations = state.conversations.map(conv => {
          if (conv.id === message.conversationId) {
            return {
              ...conv,
              lastMessage: message,
              lastMessageTime: message.timestamp,
              unreadCount: conv.unreadBy.includes(message.senderId) ? conv.unreadCount : conv.unreadCount + 1,
              unreadBy: conv.participants.filter(id => id !== message.senderId)
            };
          }
          return conv;
        });

        // Send notification to recipient
        const conversation = updatedConversations.find(conv => conv.id === message.conversationId);
        if (conversation) {
          const recipientId = conversation.participants.find(id => id !== message.senderId);
          if (recipientId) {
            useNotificationStore.getState().addNotification({
              type: 'message',
              title: `New message from ${message.senderName}`,
              body: message.content,
              userId: recipientId,
              data: { conversationId: message.conversationId, messageId: message.id }
            });
          }
        }

        return {
          messages: updatedMessages,
          conversations: updatedConversations
        };
      }),

      getConversationById: (id) => {
        return get().conversations.find(conv => conv.id === id);
      },

      getMessagesByConversationId: (conversationId) => {
        return get().messages
          .filter(msg => msg.conversationId === conversationId)
          .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      },

      getConversationsForUser: (userId) => {
        return get().conversations
          .filter(conv => conv.participants.includes(userId))
          .sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
      },

      markConversationAsRead: (conversationId, userId) => set((state) => ({
        conversations: state.conversations.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              unreadCount: conv.unreadBy.includes(userId) ? Math.max(0, conv.unreadCount - 1) : conv.unreadCount,
              unreadBy: conv.unreadBy.filter(id => id !== userId)
            };
          }
          return conv;
        })
      })),

      createOrGetConversation: (currentUserId, otherUserId, otherUserName, currentUserName) => {
        const state = get();
        
        // Check if conversation already exists
        const existingConv = state.conversations.find(conv => 
          conv.participants.includes(currentUserId) && conv.participants.includes(otherUserId)
        );

        if (existingConv) {
          return existingConv.id;
        }

        // Create new conversation
        const newConversation: Conversation = {
          id: Date.now().toString(),
          participants: [currentUserId, otherUserId],
          participantNames: [currentUserName, otherUserName],
          lastMessageTime: new Date(),
          unreadCount: 0,
          unreadBy: []
        };

        get().addConversation(newConversation);
        return newConversation.id;
      },

      sendMessage: (conversationId, senderId, senderName, content) => {
        const newMessage: Message = {
          id: Date.now().toString(),
          conversationId,
          senderId,
          senderName,
          content,
          timestamp: new Date(),
          read: false
        };

        get().addMessage(newMessage);
      },

      setHydrated: (hydrated) => set({ isHydrated: hydrated }),
    }),
    {
      name: 'messaging-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        conversations: state.conversations,
        messages: state.messages,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Error rehydrating messaging store:', error);
        }
        
        if (state) {
          // Convert timestamp strings back to Date objects after rehydration
          if (state.conversations) {
            state.conversations = state.conversations.map(conv => ({
              ...conv,
              lastMessageTime: new Date(conv.lastMessageTime),
              lastMessage: conv.lastMessage ? {
                ...conv.lastMessage,
                timestamp: new Date(conv.lastMessage.timestamp)
              } : undefined
            }));
          }
          if (state.messages) {
            state.messages = state.messages.map(msg => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }));
          }
          state.isHydrated = true;
        }
      },
    }
  )
);