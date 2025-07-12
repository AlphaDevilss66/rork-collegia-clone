import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { X, Camera, Image as ImageIcon, Hash, AtSign } from 'lucide-react-native';
import { usePostsStore } from '@/stores/posts-store';
import { useUserStore } from '@/stores/user-store';
import { useThemeStore } from '@/stores/theme-store';
import { useTranslation } from '@/hooks/useTranslation';
import { colors, darkColors } from '@/constants/colors';
import { shadows } from '@/styles/shadows';

export default function CreatePostScreen() {
  const [content, setContent] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const { addPost } = usePostsStore();
  const { user } = useUserStore();
  const { isDarkMode } = useThemeStore();
  const { t } = useTranslation();

  const currentColors = isDarkMode ? darkColors : colors;

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

    addPost({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      content: content.trim(),
      skills: selectedSkills,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      userAvatar: user.avatar,
      sport: user.sport,
      likes: 0,
      comments: 0,
      timestamp: new Date(),
      likedBy: [],
    });

    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.groupedBackground }]}>
      <Stack.Screen 
        options={{
          title: t('createPost'),
          headerStyle: { backgroundColor: currentColors.groupedBackground },
          headerTintColor: currentColors.text,
          headerTitleStyle: { fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <X size={24} color={currentColors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
              onPress={handlePost}
              style={[styles.postButton, { backgroundColor: content.trim() ? currentColors.primary : currentColors.systemFill }]}
              disabled={!content.trim()}
            >
              <Text style={[styles.postButtonText, { color: content.trim() ? 'white' : currentColors.textSecondary }]}>
                {t('post')}
              </Text>
            </TouchableOpacity>
          ),
        }} 
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.inputSection, { backgroundColor: currentColors.background }]}>
          <TextInput
            style={[styles.textInput, { color: currentColors.text }]}
            placeholder={t('whatsOnYourMind')}
            placeholderTextColor={currentColors.textSecondary}
            multiline
            value={content}
            onChangeText={setContent}
            maxLength={500}
            autoFocus
          />
          <Text style={[styles.characterCount, { color: currentColors.textSecondary }]}>
            {content.length}/500
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: currentColors.background }]}>
          <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Skills & Achievements</Text>
          <Text style={[styles.sectionSubtitle, { color: currentColors.textSecondary }]}>
            Add up to 5 skills you want to highlight
          </Text>
          
          <View style={styles.skillInputContainer}>
            <TextInput
              style={[styles.skillInput, { 
                backgroundColor: currentColors.systemFill,
                color: currentColors.text,
                borderColor: currentColors.border
              }]}
              placeholder="Add a skill..."
              placeholderTextColor={currentColors.textSecondary}
              value={skillInput}
              onChangeText={setSkillInput}
              onSubmitEditing={handleAddSkill}
              returnKeyType="done"
            />
            <TouchableOpacity 
              onPress={handleAddSkill}
              style={[styles.addSkillButton, { backgroundColor: currentColors.primary }]}
              disabled={!skillInput.trim() || selectedSkills.length >= 5}
            >
              <Text style={styles.addSkillButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {selectedSkills.length > 0 && (
            <View style={styles.selectedSkills}>
              {selectedSkills.map((skill, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.skillTag, { backgroundColor: currentColors.primary }]}
                  onPress={() => handleRemoveSkill(skill)}
                >
                  <Text style={styles.skillTagText}>{skill}</Text>
                  <X size={14} color="white" />
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.suggestedSkills}>
            <Text style={[styles.suggestedTitle, { color: currentColors.textSecondary }]}>Suggested:</Text>
            <View style={styles.suggestedSkillsContainer}>
              {availableSkills
                .filter(skill => !selectedSkills.includes(skill))
                .slice(0, 8)
                .map((skill, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.suggestedSkill, { 
                      backgroundColor: currentColors.systemFill,
                      borderColor: currentColors.border
                    }]}
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
                  </TouchableOpacity>
                ))}
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: currentColors.background }]}>
          <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Add Media</Text>
          <View style={styles.mediaOptions}>
            <TouchableOpacity style={[styles.mediaOption, { backgroundColor: currentColors.systemFill }]}>
              <Camera size={24} color={currentColors.primary} />
              <Text style={[styles.mediaOptionText, { color: currentColors.text }]}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.mediaOption, { backgroundColor: currentColors.systemFill }]}>
              <ImageIcon size={24} color={currentColors.primary} />
              <Text style={[styles.mediaOptionText, { color: currentColors.text }]}>Gallery</Text>
            </TouchableOpacity>
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
  postButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...shadows.card,
  },
  textInput: {
    fontSize: 16,
    lineHeight: 22,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...shadows.card,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  skillInputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  skillInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
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
  },
  selectedSkills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
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
  },
  suggestedSkills: {
    marginTop: 8,
  },
  suggestedTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
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
  },
});