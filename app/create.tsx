import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, Pressable } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { X, Camera, Image as ImageIcon } from 'lucide-react-native';
import { usePostsStore } from '@/stores/posts-store';
import { useUserStore } from '@/stores/user-store';
import { useThemeStore } from '@/stores/theme-store';
import { useTranslation } from '@/hooks/useTranslation';
import { colors, darkColors } from '@/constants/colors';
import { shadows } from '@/styles/shadows';

export default function CreatePostScreen() {
  const params = useLocalSearchParams();
  const isEditMode = params.editMode === 'true';
  const editPostId = params.postId as string;
  
  const [content, setContent] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const { addPost, updatePost, getPostById } = usePostsStore();
  const { user } = useUserStore();
  const { isDarkMode } = useThemeStore();
  const { t } = useTranslation();

  const currentColors = isDarkMode ? darkColors : colors;

  // Load post data if in edit mode
  useEffect(() => {
    if (isEditMode && editPostId) {
      const post = getPostById(editPostId);
      if (post) {
        setContent(post.content);
        setSelectedSkills(post.skills || []);
      }
    } else if (params.content) {
      setContent(params.content as string);
    }
    
    if (params.skills) {
      try {
        const skills = JSON.parse(params.skills as string);
        setSelectedSkills(skills);
      } catch (error) {
        console.error('Error parsing skills:', error);
      }
    }
  }, [isEditMode, editPostId, params]);

  const availableSkills = [
    'Leadership', 'Teamwork', 'Strategy', 'Endurance', 'Speed', 'Strength',
    'Agility', 'Coordination', 'Mental Toughness', 'Communication', 'Discipline',
    'Focus', 'Adaptability', 'Motivation', 'Technique', 'Precision'
  ];

  const handleAddSkill = () => {
    if (skillInput.trim() && !selectedSkills.includes(skillInput.trim()) && selectedSkills.length < 5) {
      setSelectedSkills([...selectedSkills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };

  const handlePost = () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please write something to post');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to post');
      return;
    }

    if (isEditMode && editPostId) {
      // Update existing post
      updatePost(editPostId, {
        content: content.trim(),
        skills: selectedSkills,
      });
      Alert.alert('Success', 'Post updated successfully');
    } else {
      // Create new post
      addPost({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        content: content.trim(),
        skills: selectedSkills,
        userId: user.id,
        userName: user.name || user.email.split('@')[0],
        userRole: user.role,
        userAvatar: user.avatar,
        sport: user.sport,
        likes: 0,
        comments: 0,
        timestamp: new Date(),
        likedBy: [],
      });
    }

    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  const roleAccent = user?.role === 'athlete' ? currentColors.athleteAccent : currentColors.coachAccent;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.groupedBackground }]}>
      <Stack.Screen 
        options={{
          title: isEditMode ? 'Edit Post' : 'Create Post',
          headerStyle: { backgroundColor: currentColors.groupedBackground },
          headerTintColor: currentColors.text,
          headerTitleStyle: { fontWeight: '600', fontSize: 17 },
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
              <Text style={[styles.cancelButtonText, { color: currentColors.primary }]}>Cancel</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <Pressable 
              onPress={handlePost}
              style={({ pressed }) => [
                styles.postButton, 
                { 
                  backgroundColor: content.trim() ? currentColors.primary : currentColors.systemFill,
                  opacity: content.trim() ? 1 : 0.6
                },
                pressed && content.trim() && { opacity: 0.9, transform: [{ scale: 0.98 }] }
              ]}
              disabled={!content.trim()}
            >
              <Text style={[
                styles.postButtonText, 
                { 
                  color: content.trim() ? 'white' : currentColors.textSecondary,
                  fontWeight: '600'
                }
              ]}>
                {isEditMode ? 'Update' : 'Post'}
              </Text>
            </Pressable>
          ),
        }} 
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.inputSection, { backgroundColor: currentColors.cardBackground }, shadows.card]}>
          <TextInput
            style={[styles.textInput, { color: currentColors.text }]}
            placeholder={t('whatsOnYourMind')}
            placeholderTextColor={currentColors.textSecondary}
            multiline
            value={content}
            onChangeText={setContent}
            maxLength={500}
            autoFocus={!isEditMode}
          />
          <Text style={[styles.characterCount, { color: currentColors.textSecondary }]}>
            {content.length}/500
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: currentColors.cardBackground }, shadows.card]}>
          <Text style={[styles.sectionTitle, { color: currentColors.text }]}>{t('skillsHighlights')}</Text>
          <Text style={[styles.sectionSubtitle, { color: currentColors.textSecondary }]}>
            {t('addSkillsDescription')}
          </Text>
          
          <View style={styles.skillInputContainer}>
            <TextInput
              style={[styles.skillInput, { 
                backgroundColor: currentColors.systemFill,
                color: currentColors.text,
                borderColor: currentColors.border
              }]}
              placeholder={t('addSkillPlaceholder')}
              placeholderTextColor={currentColors.textSecondary}
              value={skillInput}
              onChangeText={setSkillInput}
              onSubmitEditing={handleAddSkill}
              returnKeyType="done"
            />
            <Pressable 
              onPress={handleAddSkill}
              style={({ pressed }) => [
                styles.addSkillButton, 
                { backgroundColor: roleAccent },
                pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }
              ]}
              disabled={!skillInput.trim() || selectedSkills.length >= 5}
            >
              <Text style={styles.addSkillButtonText}>{t('add')}</Text>
            </Pressable>
          </View>

          {selectedSkills.length > 0 && (
            <View style={styles.selectedSkills}>
              {selectedSkills.map((skill, index) => (
                <Pressable
                  key={index}
                  style={({ pressed }) => [
                    styles.skillTag, 
                    { backgroundColor: roleAccent },
                    pressed && { opacity: 0.8 }
                  ]}
                  onPress={() => handleRemoveSkill(skill)}
                >
                  <Text style={styles.skillTagText}>{skill}</Text>
                  <X size={14} color="white" />
                </Pressable>
              ))}
            </View>
          )}

          <View style={styles.suggestedSkills}>
            <Text style={[styles.suggestedTitle, { color: currentColors.textSecondary }]}>{t('suggested')}:</Text>
            <View style={styles.suggestedSkillsContainer}>
              {availableSkills
                .filter(skill => !selectedSkills.includes(skill))
                .slice(0, 8)
                .map((skill, index) => (
                  <Pressable
                    key={index}
                    style={({ pressed }) => [
                      styles.suggestedSkill, 
                      { 
                        backgroundColor: currentColors.systemFill,
                        borderColor: currentColors.border
                      },
                      pressed && { opacity: 0.7 }
                    ]}
                    onPress={() => {
                      if (selectedSkills.length < 5) {
                        setSelectedSkills([...selectedSkills, skill]);
                      }
                    }}
                    disabled={selectedSkills.length >= 5}
                  >
                    <Text style={[styles.suggestedSkillText, { color: currentColors.primary }]}>
                      {skill}
                    </Text>
                  </Pressable>
                ))}
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: currentColors.cardBackground }, shadows.card]}>
          <Text style={[styles.sectionTitle, { color: currentColors.text }]}>{t('addMedia')}</Text>
          <View style={styles.mediaOptions}>
            <Pressable 
              style={({ pressed }) => [
                styles.mediaOption, 
                { backgroundColor: currentColors.systemFill },
                pressed && { opacity: 0.7 }
              ]}
            >
              <Camera size={24} color={currentColors.primary} />
              <Text style={[styles.mediaOptionText, { color: currentColors.text }]}>{t('camera')}</Text>
            </Pressable>
            <Pressable 
              style={({ pressed }) => [
                styles.mediaOption, 
                { backgroundColor: currentColors.systemFill },
                pressed && { opacity: 0.7 }
              ]}
            >
              <ImageIcon size={24} color={currentColors.primary} />
              <Text style={[styles.mediaOptionText, { color: currentColors.text }]}>{t('gallery')}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    padding: 8,
    marginLeft: -8,
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 22,
  },
  postButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 21,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  textInput: {
    fontSize: 16,
    lineHeight: 22,
    minHeight: 120,
    textAlignVertical: 'top',
    fontWeight: '400',
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 12,
    lineHeight: 16,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.2,
    lineHeight: 25,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 18,
    fontWeight: '400',
  },
  skillInputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  skillInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    lineHeight: 21,
  },
  addSkillButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
  },
  addSkillButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 21,
  },
  selectedSkills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  skillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  skillTagText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  },
  suggestedSkills: {
    marginTop: 8,
  },
  suggestedTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
    lineHeight: 18,
  },
  suggestedSkillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestedSkill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  suggestedSkillText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  },
  mediaOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  mediaOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: 12,
    gap: 8,
  },
  mediaOptionText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  },
});