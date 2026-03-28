import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { ArrowLeft, Send } from 'lucide-react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { colors } from '@/constants/colors';
import { useMessagingStore } from '@/stores/messaging-store';
import { useUserStore } from '@/stores/user-store';

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [newMessage, setNewMessage] = useState('');
  const { user } = useUserStore();
  const { 
    getConversationById, 
    getMessagesByConversationId, 
    sendMessage, 
    markConversationAsRead 
  } = useMessagingStore();

  const conversation = getConversationById(id || '');
  const messages = getMessagesByConversationId(id || '');

  useEffect(() => {
    // Mark conversation as read when user opens it
    if (id && user?.id) {
      markConversationAsRead(id, user.id);
    }
  }, [id, user?.id]); // Only depend on id and user.id, not the whole conversation object

  if (!conversation || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Conversation</Text>
        </View>
        
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Conversation not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const otherParticipantIndex = conversation.participants.findIndex(participantId => participantId !== user.id);
  const otherParticipantName = conversation.participantNames[otherParticipantIndex] || 'Unknown';

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const currentUserName = user.name && user.name.trim() ? user.name : user.email.split('@')[0];
    sendMessage(conversation.id, user.id, currentUserName, newMessage.trim());
    setNewMessage('');
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const renderMessage = (message: any) => {
    const isMyMessage = message.senderId === user.id;
    
    return (
      <View key={message.id} style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isMyMessage ? styles.myMessageText : styles.otherMessageText
          ]}>
            {message.content}
          </Text>
        </View>
        <Text style={[
          styles.messageTime,
          isMyMessage ? styles.myMessageTime : styles.otherMessageTime
        ]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{otherParticipantName}</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.messagesContainer} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Start the conversation</Text>
              <Text style={styles.emptySubtitle}>
                Send a message to {otherParticipantName}
              </Text>
            </View>
          ) : (
            messages.map(renderMessage)
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              maxLength={1000}
              placeholderTextColor={colors.textSecondary}
            />
            <TouchableOpacity 
              style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
              onPress={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <Send size={18} color={newMessage.trim() ? colors.primary : colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 0.33,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  content: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 10,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
    textAlign: 'center',
    fontWeight: '400',
  },
  messageContainer: {
    marginBottom: 16,
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  myMessageBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: colors.systemFill,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '400',
  },
  myMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: colors.text,
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '400',
  },
  myMessageTime: {
    color: colors.textSecondary,
    textAlign: 'right',
  },
  otherMessageTime: {
    color: colors.textSecondary,
    textAlign: 'left',
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