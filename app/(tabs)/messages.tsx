import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { MessageCircle, Search, Plus } from 'lucide-react-native';
import { colors, darkColors } from '@/constants/colors';
import { shadows } from '@/styles/shadows';
import { useMessagingStore } from '@/stores/messaging-store';
import { useUserStore } from '@/stores/user-store';
import { useThemeStore } from '@/stores/theme-store';
import { useTranslation } from '@/hooks/useTranslation';
import { router } from 'expo-router';
import UserSelectionModal from '@/components/UserSelectionModal';

export default function MessagesScreen() {
  const { user } = useUserStore();
  const { getConversationsForUser, createOrGetConversation } = useMessagingStore();
  const { isDarkMode } = useThemeStore();
  const { t } = useTranslation();
  const [showUserSelection, setShowUserSelection] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  
  const currentColors = isDarkMode ? darkColors : colors;

  const conversations = user ? getConversationsForUser(user.id) : [];

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  const getOtherParticipant = (conversation: any) => {
    if (!user) return { name: 'Unknown', id: '' };
    
    const otherParticipantIndex = conversation.participants.findIndex((id: string) => id !== user.id);
    if (otherParticipantIndex === -1) return { name: 'Unknown', id: '' };
    
    return {
      name: conversation.participantNames[otherParticipantIndex] || 'Unknown',
      id: conversation.participants[otherParticipantIndex]
    };
  };

  const handleUserSelected = (selectedUserId: string, selectedUserName: string) => {
    if (!user) return;

    const currentUserName = user.name && user.name.trim() ? user.name : user.email.split('@')[0];
    
    // Create or get conversation
    const conversationId = createOrGetConversation(
      user.id,
      selectedUserId,
      selectedUserName,
      currentUserName
    );

    // Navigate to conversation
    router.push({
      pathname: '/conversation/[id]',
      params: { id: conversationId }
    });
  };

  const renderConversation = (conversation: any, index: number) => {
    const otherParticipant = getOtherParticipant(conversation);
    const hasUnread = user ? conversation.unreadBy.includes(user.id) : false;

    return (
      <TouchableOpacity 
        key={conversation.id} 
        style={[styles.conversationCard, { backgroundColor: currentColors.background, borderBottomColor: currentColors.border }, index === conversations.length - 1 && styles.lastConversation]}
        onPress={() => router.push({
          pathname: '/conversation/[id]',
          params: { id: conversation.id }
        })}
      >
        <View style={styles.avatar}>
          <View style={[styles.avatarPlaceholder, { backgroundColor: currentColors.systemFill }]}>
            <Text style={[styles.avatarText, { color: currentColors.primary }]}>{otherParticipant.name.charAt(0)}</Text>
          </View>
        </View>
        
        <View style={styles.conversationInfo}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.conversationName, { color: currentColors.text }, hasUnread && styles.unreadText]}>
              {otherParticipant.name}
            </Text>
            <Text style={[styles.conversationTime, { color: currentColors.textSecondary }]}>
              {formatTime(conversation.lastMessageTime)}
            </Text>
          </View>
          
          {conversation.lastMessage && (
            <Text style={[styles.lastMessage, { color: currentColors.textSecondary }, hasUnread && styles.unreadText]} numberOfLines={1}>
              {conversation.lastMessage.senderId === user?.id ? 'You: ' : ''}
              {conversation.lastMessage.content}
            </Text>
          )}
        </View>
        
        {hasUnread && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>•</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentColors.groupedBackground }]}>
        <View style={[styles.header, { backgroundColor: currentColors.groupedBackground }]}>
          <Text style={[styles.headerTitle, { color: currentColors.text }]}>{t('messages')}</Text>
        </View>
        
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: currentColors.systemFill }]}>
            <MessageCircle size={28} color={currentColors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: currentColors.text }]}>Sign In Required</Text>
          <Text style={[styles.emptySubtitle, { color: currentColors.textSecondary }]}>
            Please sign in to view your messages
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.groupedBackground }]}>
      <View style={[styles.header, { backgroundColor: currentColors.groupedBackground }]}>
        <Text style={[styles.headerTitle, { color: currentColors.text }]}>{t('messages')}</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.headerButton, { backgroundColor: currentColors.systemFill }]}
            onPress={() => setShowSearch(true)}
          >
            <Search size={18} color={currentColors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.headerButton, { backgroundColor: currentColors.systemFill }]}
            onPress={() => setShowUserSelection(true)}
          >
            <Plus size={18} color={currentColors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {conversations.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <MessageCircle size={28} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>No Messages</Text>
          <Text style={styles.emptySubtitle}>
            Start connecting with athletes and coaches to begin conversations
          </Text>
          <TouchableOpacity 
            style={styles.startButton}
            onPress={() => setShowUserSelection(true)}
          >
            <Text style={styles.startButtonText}>Start Chat</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          style={styles.conversations} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.conversationsContent}
        >
          <View style={styles.conversationsList}>
            {conversations.map(renderConversation)}
          </View>
        </ScrollView>
      )}

      <UserSelectionModal
        visible={showUserSelection || showSearch}
        onClose={() => {
          setShowUserSelection(false);
          setShowSearch(false);
        }}
        onSelectUser={handleUserSelected}
        currentUserId={user?.id || ''}
      />
    </SafeAreaView>
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
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: colors.groupedBackground,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.41,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.systemFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.systemFill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  conversations: {
    flex: 1,
  },
  conversationsContent: {
    paddingBottom: 20,
  },
  conversationsList: {
    backgroundColor: colors.background,
    marginHorizontal: 20,
    borderRadius: 16,
    ...shadows.card,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.33,
    borderBottomColor: colors.border,
  },
  lastConversation: {
    borderBottomWidth: 0,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.systemFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  conversationTime: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  lastMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
    fontWeight: '400',
  },
  unreadText: {
    fontWeight: '600',
    color: colors.text,
  },
  unreadBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  unreadBadgeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: '600',
  },
});