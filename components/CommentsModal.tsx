import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { X, Send } from 'lucide-react-native';
import { colors, darkColors } from '@/constants/colors';
import { useCommentsStore } from '@/stores/comments-store';
import { useUserStore } from '@/stores/user-store';
import { useThemeStore } from '@/stores/theme-store';
import { shadows } from '@/styles/shadows';

interface CommentsModalProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
}

export default function CommentsModal({ visible, onClose, postId }: CommentsModalProps) {
  const [newComment, setNewComment] = useState('');
  const { comments, addComment, getCommentsByPostId } = useCommentsStore();
  const { user } = useUserStore();
  const { isDarkMode } = useThemeStore();
  
  const currentColors = isDarkMode ? darkColors : colors;

  const postComments = getCommentsByPostId(postId);

  const handleAddComment = () => {
    if (!newComment.trim() || !user) return;

    const comment = {
      id: Date.now().toString(),
      postId,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      content: newComment.trim(),
      timestamp: new Date(),
    };

    addComment(comment);
    setNewComment('');
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <KeyboardAvoidingView 
        style={[styles.container, { backgroundColor: currentColors.groupedBackground }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.header, { backgroundColor: currentColors.cardBackground, borderBottomColor: currentColors.border }, shadows.navbar]}>
          <Text style={[styles.headerTitle, { color: currentColors.text }]}>Comments</Text>
          <Pressable 
            onPress={onClose} 
            style={({ pressed }) => [
              styles.closeButton, 
              { backgroundColor: currentColors.systemFill },
              pressed && { opacity: 0.7 }
            ]}
          >
            <X size={22} color={currentColors.textSecondary} />
          </Pressable>
        </View>

        <ScrollView style={styles.commentsList} showsVerticalScrollIndicator={false}>
          {postComments.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: currentColors.systemFill }]}>
                <Text style={styles.emptyIconText}>💬</Text>
              </View>
              <Text style={[styles.emptyTitle, { color: currentColors.text }]}>No comments yet</Text>
              <Text style={[styles.emptySubtitle, { color: currentColors.textSecondary }]}>Be the first to comment!</Text>
            </View>
          ) : (
            postComments.map((comment) => (
              <View key={comment.id} style={[styles.commentItem, { backgroundColor: currentColors.cardBackground }]}>
                <View style={[styles.commentAvatar, { backgroundColor: currentColors.systemFill }]}>
                  <Text style={[styles.commentAvatarText, { color: currentColors.primary }]}>
                    {comment.userName.charAt(0)}
                  </Text>
                </View>
                <View style={styles.commentContent}>
                  <View style={styles.commentHeader}>
                    <Text style={[styles.commentUserName, { color: currentColors.text }]}>{comment.userName}</Text>
                    <Text style={[styles.commentTime, { color: currentColors.textSecondary }]}>
                      {formatTimeAgo(comment.timestamp)}
                    </Text>
                  </View>
                  <Text style={[styles.commentText, { color: currentColors.text }]}>{comment.content}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        <View style={[styles.inputContainer, { backgroundColor: currentColors.cardBackground, borderTopColor: currentColors.border }, shadows.navbar]}>
          <View style={[styles.inputWrapper, { backgroundColor: currentColors.systemFill }]}>
            <TextInput
              style={[styles.textInput, { color: currentColors.text }]}
              placeholder="Add a comment..."
              value={newComment}
              onChangeText={setNewComment}
              multiline
              maxLength={500}
              placeholderTextColor={currentColors.textSecondary}
            />
            <Pressable 
              style={({ pressed }) => [
                styles.sendButton, 
                !newComment.trim() && styles.sendButtonDisabled,
                pressed && newComment.trim() && { opacity: 0.7 }
              ]}
              onPress={handleAddComment}
              disabled={!newComment.trim()}
            >
              <Send size={18} color={newComment.trim() ? currentColors.primary : currentColors.textSecondary} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentsList: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyIconText: {
    fontSize: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 23,
  },
  emptySubtitle: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 20,
  },
  commentItem: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.04)',
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  commentAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
    lineHeight: 18,
  },
  commentTime: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 40,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    maxHeight: 80,
    paddingVertical: 6,
    fontWeight: '400',
    lineHeight: 20,
  },
  sendButton: {
    marginLeft: 8,
    padding: 6,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});