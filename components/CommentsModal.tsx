import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { X, Send } from 'lucide-react-native';
import { colors, darkColors } from '@/constants/colors';
import { useCommentsStore } from '@/stores/comments-store';
import { useUserStore } from '@/stores/user-store';
import { useThemeStore } from '@/stores/theme-store';

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
        <View style={[styles.header, { backgroundColor: currentColors.background, borderBottomColor: currentColors.border }]}>
          <Text style={[styles.headerTitle, { color: currentColors.text }]}>Comments</Text>
          <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: currentColors.systemFill }]}>
            <X size={22} color={currentColors.textSecondary} />
          </TouchableOpacity>
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
              <View key={comment.id} style={[styles.commentItem, { backgroundColor: currentColors.background }]}>
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

        <View style={[styles.inputContainer, { backgroundColor: currentColors.background, borderTopColor: currentColors.border }]}>
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
            <TouchableOpacity 
              style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
              onPress={handleAddComment}
              disabled={!newComment.trim()}
            >
              <Send size={18} color={newComment.trim() ? currentColors.primary : currentColors.textSecondary} />
            </TouchableOpacity>
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
    borderBottomWidth: 0.33,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.systemFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentsList: {
    flex: 1,
    backgroundColor: colors.background,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.systemFill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyIconText: {
    fontSize: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  commentItem: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 0.33,
    borderBottomColor: colors.border,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.systemFill,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  commentAvatarText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginRight: 8,
  },
  commentTime: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  commentText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 18,
    fontWeight: '400',
  },
  inputContainer: {
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 0.33,
    borderTopColor: colors.border,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.systemFill,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 40,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    maxHeight: 80,
    paddingVertical: 6,
    fontWeight: '400',
  },
  sendButton: {
    marginLeft: 8,
    padding: 6,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});