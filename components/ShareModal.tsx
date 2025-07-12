import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Share, Platform, Alert } from 'react-native';
import { X, MessageCircle, Copy, ExternalLink } from 'lucide-react-native';
import { colors, darkColors } from '@/constants/colors';
import { useUserStore } from '@/stores/user-store';
import { useMessagingStore } from '@/stores/messaging-store';
import { useThemeStore } from '@/stores/theme-store';
import UserSelectionModal from './UserSelectionModal';
import { router } from 'expo-router';

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  postContent: string;
  postAuthor: string;
}

export default function ShareModal({ visible, onClose, postContent, postAuthor }: ShareModalProps) {
  const [showUserSelection, setShowUserSelection] = useState(false);
  const { user } = useUserStore();
  const { createOrGetConversation, sendMessage } = useMessagingStore();
  const { isDarkMode } = useThemeStore();
  const currentColors = isDarkMode ? darkColors : colors;

  const shareOptions = [
    {
      id: 'native',
      title: 'Share via...',
      subtitle: 'Use system share',
      icon: ExternalLink,
      color: currentColors.primary,
    },
    {
      id: 'copy',
      title: 'Copy Link',
      subtitle: 'Copy to clipboard',
      icon: Copy,
      color: currentColors.systemOrange,
    },
    {
      id: 'message',
      title: 'Send Message',
      subtitle: 'Share privately',
      icon: MessageCircle,
      color: currentColors.success,
    },
  ];

  const handleShare = async (optionId: string) => {
    const shareText = `Check out this post by ${postAuthor}: "${postContent.substring(0, 100)}${postContent.length > 100 ? '...' : ''}"`;
    
    switch (optionId) {
      case 'native':
        try {
          await Share.share({
            message: shareText,
            title: 'Collegia Post',
          });
        } catch (error) {
          Alert.alert('Error', 'Unable to share at this time');
        }
        onClose();
        break;
      
      case 'copy':
        // In a real app, you would copy the actual post URL
        if (Platform.OS === 'web') {
          navigator.clipboard.writeText(shareText);
        }
        Alert.alert('Copied!', 'Post content copied to clipboard');
        onClose();
        break;
      
      case 'message':
        if (!user) {
          Alert.alert('Error', 'You need to be signed in to send messages');
          onClose();
          return;
        }
        setShowUserSelection(true);
        break;
    }
  };

  const handleUserSelected = (selectedUserId: string, selectedUserName: string) => {
    if (!user) return;

    const currentUserName = user.name && user.name.trim() ? user.name : user.email.split('@')[0];
    const shareText = `Check out this post by ${postAuthor}: "${postContent.substring(0, 100)}${postContent.length > 100 ? '...' : ''}"`;
    
    // Create or get conversation
    const conversationId = createOrGetConversation(
      user.id,
      selectedUserId,
      selectedUserName,
      currentUserName
    );

    // Send the message
    sendMessage(conversationId, user.id, currentUserName, shareText);

    // Close modals
    setShowUserSelection(false);
    onClose();

    Alert.alert('Message Sent!', `Post shared with ${selectedUserName}`, [
      { 
        text: 'View Conversation', 
        onPress: () => {
          router.push({
            pathname: '/conversation/[id]',
            params: { id: conversationId }
          });
        }
      },
      { text: 'OK' }
    ]);
  };

  const handleCloseUserSelection = () => {
    setShowUserSelection(false);
  };

  const handleCloseShareModal = () => {
    setShowUserSelection(false);
    onClose();
  };

  return (
    <>
      <Modal
        visible={visible && !showUserSelection}
        transparent
        animationType="slide"
        presentationStyle="overFullScreen"
      >
        <View style={styles.overlay}>
          <View style={[styles.container, { backgroundColor: currentColors.background }]}>
            <View style={[styles.handle, { backgroundColor: currentColors.systemFill }]} />
            
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: currentColors.text }]}>Share Post</Text>
              <TouchableOpacity onPress={handleCloseShareModal} style={[styles.closeButton, { backgroundColor: currentColors.systemFill }]}>
                <X size={20} color={currentColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.optionsList}>
              {shareOptions.map((option, index) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionItem,
                    { borderBottomColor: currentColors.border },
                    index === shareOptions.length - 1 && styles.lastOption
                  ]}
                  onPress={() => handleShare(option.id)}
                >
                  <View style={[styles.optionIcon, { backgroundColor: `${option.color}15` }]}>
                    <option.icon size={20} color={option.color} />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionTitle, { color: currentColors.text }]}>{option.title}</Text>
                    <Text style={[styles.optionSubtitle, { color: currentColors.textSecondary }]}>{option.subtitle}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={[styles.cancelButton, { backgroundColor: currentColors.systemFill }]} onPress={handleCloseShareModal}>
              <Text style={[styles.cancelButtonText, { color: currentColors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <UserSelectionModal
        visible={showUserSelection}
        onClose={handleCloseUserSelection}
        onSelectUser={handleUserSelected}
        currentUserId={user?.id || ''}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 34,
  },
  handle: {
    width: 36,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsList: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 0.33,
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '400',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 13,
    fontWeight: '400',
  },
  cancelButton: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: '400',
  },
});