import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'athlete' | 'coach';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  location?: string;
  sport?: string;
  position?: string;
  achievements?: string[];
  experience?: string;
  teamAffiliation?: string;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  isLoading: boolean;
  isHydrated: boolean; // New flag to track hydration status
  allUsers: User[]; // Store all registered users for search
  setUser: (user: User) => void;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, role: UserRole) => Promise<boolean>;
  signOut: () => void;
  completeOnboarding: () => void;
  updateProfile: (updates: Partial<User>) => void;
  updateUser: (updates: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  searchUsers: (query: string) => User[];
  setHydrated: (hydrated: boolean) => void;
}

// Persistent storage for mock users database
const USERS_STORAGE_KEY = 'collegia_users_db';

const getUsersDatabase = async (): Promise<{ [email: string]: { password: string; user: User } }> => {
  try {
    const stored = await AsyncStorage.getItem(USERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading users database:', error);
    return {};
  }
};

const saveUsersDatabase = async (users: { [email: string]: { password: string; user: User } }) => {
  try {
    await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving users database:', error);
  }
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isOnboarded: false,
      isLoading: true,
      isHydrated: false,
      allUsers: [],
      
      setUser: (user) => set({ user, isAuthenticated: true }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setHydrated: (hydrated) => set({ isHydrated: hydrated }),
      
      signIn: async (email: string, password: string) => {
        set({ isLoading: true });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const usersDb = await getUsersDatabase();
          const userData = usersDb[email.toLowerCase()];
          
          if (userData && userData.password === password) {
            set({ 
              user: userData.user, 
              isAuthenticated: true,
              isOnboarded: true,
              isLoading: false
            });
            return true;
          }
          
          set({ isLoading: false });
          return false;
        } catch (error) {
          set({ isLoading: false });
          return false;
        }
      },
      
      signUp: async (email: string, password: string, role: UserRole) => {
        set({ isLoading: true });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const usersDb = await getUsersDatabase();
          
          if (usersDb[email.toLowerCase()]) {
            set({ isLoading: false });
            return false; // User already exists
          }
          
          const newUser: User = {
            id: Date.now().toString(),
            name: '',
            email: email.toLowerCase(),
            role,
          };
          
          // Save to persistent database
          usersDb[email.toLowerCase()] = {
            password,
            user: newUser
          };
          
          await saveUsersDatabase(usersDb);
          
          // Update allUsers array
          const allUsers = Object.values(usersDb).map(userData => userData.user);
          
          set({ 
            user: newUser, 
            isAuthenticated: true,
            isOnboarded: false,
            isLoading: false,
            allUsers
          });
          return true;
        } catch (error) {
          set({ isLoading: false });
          return false;
        }
      },
      
      signOut: () => set({ 
        user: null, 
        isAuthenticated: false, 
        isOnboarded: false,
        isLoading: false
      }),
      
      completeOnboarding: () => set({ isOnboarded: true }),
      
      updateProfile: async (updates) => {
        const state = get();
        if (!state.user) return;
        
        const updatedUser = { ...state.user, ...updates };
        
        // Update in persistent database
        try {
          const usersDb = await getUsersDatabase();
          const userData = usersDb[state.user.email];
          if (userData) {
            userData.user = updatedUser;
            await saveUsersDatabase(usersDb);
            
            // Update allUsers array
            const allUsers = Object.values(usersDb).map(userData => userData.user);
            set({ user: updatedUser, allUsers });
          }
        } catch (error) {
          console.error('Error updating user in database:', error);
        }
      },
      
      updateUser: async (updates) => {
        const state = get();
        if (!state.user) return;
        
        const updatedUser = { ...state.user, ...updates };
        
        // Update in persistent database
        try {
          const usersDb = await getUsersDatabase();
          const userData = usersDb[state.user.email];
          if (userData) {
            userData.user = updatedUser;
            await saveUsersDatabase(usersDb);
            
            // Update allUsers array
            const allUsers = Object.values(usersDb).map(userData => userData.user);
            set({ user: updatedUser, allUsers });
          }
        } catch (error) {
          console.error('Error updating user in database:', error);
        }
      },
      
      searchUsers: (query: string) => {
        const state = get();
        if (!query.trim()) return [];
        
        const searchTerm = query.toLowerCase();
        return state.allUsers.filter(user => 
          user.name.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm) ||
          user.role.toLowerCase().includes(searchTerm) ||
          (user.sport && user.sport.toLowerCase().includes(searchTerm)) ||
          (user.location && user.location.toLowerCase().includes(searchTerm))
        );
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isOnboarded: state.isOnboarded,
        allUsers: state.allUsers,
      }),
      onRehydrateStorage: () => async (state, error) => {
        if (error) {
          console.error('Error rehydrating user store:', error);
        }
        
        // Set hydrated flag and stop loading after rehydration
        if (state) {
          state.isHydrated = true;
          state.isLoading = false;
          
          // Load all users from database
          try {
            const usersDb = await getUsersDatabase();
            const allUsers = Object.values(usersDb).map(userData => userData.user);
            state.allUsers = allUsers;
          } catch (error) {
            console.error('Error loading all users:', error);
          }
        }
      },
    }
  )
);