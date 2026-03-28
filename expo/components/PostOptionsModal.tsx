import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { X, Trash2, Flag, Share } from 'lucide-react-native';
import { colors, darkColors } from '@/constants/colors';
import { useThemeStore } from '@/stores/theme-store';

interface PostOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onDelete: () => void;
  onShare: () => void;
  isOwnPost: boolean;
  postAuthor: string;
}

export default function PostOptionsModal({ 
  visible, 
  onClose, 
  onDelete, 
  onShare, 
  isOwnPost, 
  postAuthor 
}: PostOptionsModalProps) {
  const { isDarkMode } = useThemeStore();
  const currentColors = isDarkMode ? darkColors : colors;
  
  const handleDelete = () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            onDelete();
            onClose();
          }
        }
      ]
    );
  };

  const handleReport = () => {
    Alert.alert(
      'Report Post',
      `Report this post by ${postAuthor}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Report', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Reported', 'Thank you for your report. We will review this content.');
            onClose();
          }
        }
      ]
    );
  };

  const options = [
    {
      id: 'share',
      title: 'Share Post',
      icon: Share,
      color: currentColors.primary,
      onPress: () => {
        onShare();
        onClose();
      },
    },
    ...(isOwnPost ? [{
      id: 'delete',
      title: 'Delete Post',
      icon: Trash2,
      color: currentColors.error,
      onPress: handleDelete,
    }] : [{
      id: 'report',
      title: 'Report Post',
      icon: Flag,
      color: currentColors.systemOrange,
      onPress: handleReport,
    }]),
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      presentationStyle="overFullScreen"
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: currentColors.background }]}>
          <View style={[styles.header, { borderBottomColor: currentColors.border }]}>
            <Text style={[styles.headerTitle, { color: currentColors.text }]}>Post Options</Text>
            <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: currentColors.systemFill }]}>
              <X size={22} color={currentColors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.optionsList}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[styles.optionItem, { borderBottomColor: currentColors.border }]}
                onPress={option.onPress}
              >
                <View style={[styles.optionIcon, { backgroundColor: `${option.color}15` }]}>
                  <option.icon size={22} color={option.color} />
                </View>
                <Text style={[styles.optionTitle, { color: currentColors.text }, option.id === 'delete' && { color: option.color }]}>
                  {option.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={[styles.cancelButton, { backgroundColor: currentColors.systemFill }]} onPress={onClose}>
            <Text style={[styles.cancelButtonText, { color: currentColors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
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
  optionsList: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  cancelButton: {
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: colors.systemFill,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});