import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native';
import { X, Search, User } from 'lucide-react-native';
import { colors, darkColors } from '@/constants/colors';
import { useUserStore } from '@/stores/user-store';
import { useThemeStore } from '@/stores/theme-store';
import { VoiceSearch } from '@/components/VoiceSearch';

interface UserSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectUser: (userId: string, userName: string) => void;
  currentUserId: string;
}

export default function UserSelectionModal({ visible, onClose, onSelectUser, currentUserId }: UserSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { allUsers } = useUserStore();
  const { isDarkMode } = useThemeStore();
  
  const currentColors = isDarkMode ? darkColors : colors;

  // Filter out current user and search by query
  const availableUsers = allUsers.filter(user => {
    if (user.id === currentUserId) return false;
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const displayName = user.name && user.name.trim() ? user.name : user.email.split('@')[0];
    
    return displayName.toLowerCase().includes(query) ||
           user.email.toLowerCase().includes(query) ||
           (user.sport && user.sport.toLowerCase().includes(query));
  });

  const handleSelectUser = (user: any) => {
    const displayName = user.name && user.name.trim() ? user.name : user.email.split('@')[0];
    onSelectUser(user.id, displayName);
    setSearchQuery('');
    onClose();
  };

  const renderUser = (user: any) => {
    const displayName = user.name && user.name.trim() ? user.name : user.email.split('@')[0];
    
    return (
      <TouchableOpacity
        key={user.id}
        style={[styles.userItem, { backgroundColor: currentColors.background, borderBottomColor: currentColors.border }]}
        onPress={() => handleSelectUser(user)}
      >
        <View style={styles.userAvatar}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.userAvatarImage} />
          ) : (
            <View style={[styles.userAvatarPlaceholder, { backgroundColor: currentColors.systemFill }]}>
              <Text style={[styles.userAvatarText, { color: currentColors.primary }]}>{displayName.charAt(0).toUpperCase()}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: currentColors.text }]}>{displayName}</Text>
          <Text style={[styles.userRole, { color: currentColors.textSecondary }]}>
            {user.role}{user.sport && ` • ${user.sport}`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={[styles.container, { backgroundColor: currentColors.groupedBackground }]}>
        <View style={[styles.header, { backgroundColor: currentColors.background, borderBottomColor: currentColors.border }]}>
          <Text style={[styles.headerTitle, { color: currentColors.text }]}>Send Message</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={22} color={currentColors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: currentColors.systemFill }]}>
          <Search size={16} color={currentColors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: currentColors.text }]}
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={currentColors.textSecondary}
          />
          <VoiceSearch
            onTranscription={setSearchQuery}
            size={16}
            color={currentColors.textSecondary}
          />
        </View>

        <ScrollView style={styles.usersList} showsVerticalScrollIndicator={false}>
          {availableUsers.length === 0 ? (
            <View style={styles.emptyState}>
              <User size={32} color={currentColors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: currentColors.text }]}>No users found</Text>
              <Text style={[styles.emptySubtitle, { color: currentColors.textSecondary }]}>
                {searchQuery.trim() ? 'Try searching with different keywords' : 'No other users available'}
              </Text>
            </View>
          ) : (
            availableUsers.map(renderUser)
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.groupedBackground,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 0.33,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.systemFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.systemFill,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 36,
    marginHorizontal: 20,
    marginVertical: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    fontWeight: '400',
  },
  usersList: {
    flex: 1,
    backgroundColor: colors.background,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '400',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 0.33,
    borderBottomColor: colors.border,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    overflow: 'hidden',
  },
  userAvatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  userAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.systemFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  userRole: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '400',
    textTransform: 'capitalize',
  },
});