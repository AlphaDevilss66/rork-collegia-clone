import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Notification {
  id: string;
  type: 'message' | 'like' | 'comment' | 'follow';
  title: string;
  body: string;
  data?: any;
  timestamp: Date;
  read: boolean;
  userId: string; // The user who should receive this notification
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: (userId: string) => void;
  getNotificationsForUser: (userId: string) => Notification[];
  getUnreadCountForUser: (userId: string) => number;
  clearNotifications: (userId: string) => void;
  showInAppNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (notificationData) => {
        const notification: Notification = {
          ...notificationData,
          id: Date.now().toString(),
          timestamp: new Date(),
          read: false,
        };

        set((state) => {
          const newNotifications = [...state.notifications, notification];
          const unreadCount = newNotifications.filter(n => !n.read && n.userId === notificationData.userId).length;
          
          return {
            notifications: newNotifications,
            unreadCount,
          };
        });

        // Show in-app notification
        get().showInAppNotification(notificationData);
      },

      markAsRead: (notificationId) => set((state) => {
        const updatedNotifications = state.notifications.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        );
        const unreadCount = updatedNotifications.filter(n => !n.read).length;
        
        return {
          notifications: updatedNotifications,
          unreadCount,
        };
      }),

      markAllAsRead: (userId) => set((state) => {
        const updatedNotifications = state.notifications.map(n => 
          n.userId === userId ? { ...n, read: true } : n
        );
        const unreadCount = updatedNotifications.filter(n => !n.read).length;
        
        return {
          notifications: updatedNotifications,
          unreadCount,
        };
      }),

      getNotificationsForUser: (userId) => {
        return get().notifications
          .filter(n => n.userId === userId)
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      },

      getUnreadCountForUser: (userId) => {
        return get().notifications.filter(n => n.userId === userId && !n.read).length;
      },

      clearNotifications: (userId) => set((state) => ({
        notifications: state.notifications.filter(n => n.userId !== userId),
        unreadCount: state.notifications.filter(n => n.userId !== userId && !n.read).length,
      })),

      showInAppNotification: (notificationData) => {
        // This will be handled by the InAppNotification component
        // We can emit an event or use a different mechanism
      },
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        notifications: state.notifications,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Error rehydrating notification store:', error);
        }
        
        if (state) {
          // Convert timestamp strings back to Date objects after rehydration
          if (state.notifications) {
            state.notifications = state.notifications.map(notification => ({
              ...notification,
              timestamp: new Date(notification.timestamp)
            }));
          }
          // Recalculate unread count
          state.unreadCount = state.notifications.filter(n => !n.read).length;
        }
      },
    }
  )
);