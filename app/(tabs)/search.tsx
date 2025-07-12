import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { Search as SearchIcon, Hash, User, MapPin, Briefcase } from 'lucide-react-native';
import { colors, darkColors } from '@/constants/colors';
import { useThemeStore } from '@/stores/theme-store';
import { shadows } from '@/styles/shadows';
import { router } from 'expo-router';
import { useUserStore } from '@/stores/user-store';
import { usePostsStore } from '@/stores/posts-store';
import { useTranslation } from '@/hooks/useTranslation';
import { VoiceSearch } from '@/components/VoiceSearch';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { user, searchUsers } = useUserStore();
  const { getTrendingHashtags } = usePostsStore();
  const { isDarkMode } = useThemeStore();
  const { t } = useTranslation();

  const currentColors = isDarkMode ? darkColors : colors;
  const trendingHashtags = getTrendingHashtags();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    const results = searchUsers(query);
    setSearchResults(results);
  };

  const handleHashtagPress = (hashtag: string) => {
    router.push({
      pathname: '/hashtag/[tag]',
      params: { tag: hashtag.toLowerCase() }
    });
  };

  const handleUserPress = (selectedUser: any) => {
    router.push({
      pathname: '/profile/[id]',
      params: { id: selectedUser.id }
    });
  };

  const handleVoiceTranscription = (text: string) => {
    handleSearch(text);
  };

  const renderHashtagItem = (item: any, index: number) => (
    <TouchableOpacity 
      key={index} 
      style={[styles.hashtagItem, index === trendingHashtags.length - 1 && styles.lastItem, { borderBottomColor: currentColors.border }]}
      onPress={() => handleHashtagPress(item.tag)}
    >
      <View style={styles.hashtagLeft}>
        <View style={[styles.hashtagIcon, { backgroundColor: currentColors.systemFill }]}>
          <Hash size={16} color={currentColors.primary} />
        </View>
        <View style={styles.hashtagContent}>
          <Text style={[styles.hashtagText, { color: currentColors.text }]}>#{item.tag}</Text>
          <Text style={[styles.hashtagCount, { color: currentColors.textSecondary }]}>{item.count} {item.count === 1 ? 'post' : 'posts'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderUserResult = (user: any, index: number) => (
    <TouchableOpacity 
      key={index} 
      style={[styles.userResult, index === searchResults.length - 1 && styles.lastItem, { borderBottomColor: currentColors.border }]}
      onPress={() => handleUserPress(user)}
    >
      <View style={styles.userAvatar}>
        {user.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.userAvatarImage} />
        ) : (
          <View style={[styles.userAvatarPlaceholder, { backgroundColor: currentColors.systemFill }]}>
            <Text style={[styles.userAvatarText, { color: currentColors.primary }]}>{user.name.charAt(0) || user.email.charAt(0).toUpperCase()}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.userInfo}>
        <Text style={[styles.userResultName, { color: currentColors.text }]}>{user.name || user.email.split('@')[0]}</Text>
        <View style={styles.userMeta}>
          <View style={styles.userMetaItem}>
            <Briefcase size={12} color={currentColors.textSecondary} />
            <Text style={[styles.userMetaText, { color: currentColors.textSecondary }]}>{user.role}</Text>
          </View>
          {user.sport && (
            <View style={styles.userMetaItem}>
              <Text style={[styles.userMetaText, { color: currentColors.textSecondary }]}>• {user.sport}</Text>
            </View>
          )}
          {user.location && (
            <View style={styles.userMetaItem}>
              <MapPin size={12} color={currentColors.textSecondary} />
              <Text style={[styles.userMetaText, { color: currentColors.textSecondary }]}>{user.location}</Text>
            </View>
          )}
        </View>
        {user.bio && (
          <Text style={[styles.userBio, { color: currentColors.textSecondary }]} numberOfLines={2}>{user.bio}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.groupedBackground }]}>
      <View style={[styles.header, { backgroundColor: currentColors.groupedBackground }]}>
        <Text style={[styles.headerTitle, { color: currentColors.text }]}>{t('discover')}</Text>
        
        <View style={[styles.searchContainer, { backgroundColor: currentColors.systemFill }]}>
          <SearchIcon size={16} color={currentColors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: currentColors.text }]}
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor={currentColors.textSecondary}
          />
          <VoiceSearch onTranscription={handleVoiceTranscription} size={16} />
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {isSearching && searchQuery.trim() ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentColors.text }]}>{t('search')} {t('noResults').split(' ')[0]}</Text>
            {searchResults.length === 0 ? (
              <View style={[styles.noResults, { backgroundColor: currentColors.background, ...shadows.card }]}>
                <User size={32} color={currentColors.textSecondary} />
                <Text style={[styles.noResultsTitle, { color: currentColors.text }]}>{t('noResults')}</Text>
                <Text style={[styles.noResultsSubtitle, { color: currentColors.textSecondary }]}>
                  Try searching with different keywords
                </Text>
              </View>
            ) : (
              <View style={[styles.searchResultsList, { backgroundColor: currentColors.background, ...shadows.card }]}>
                {searchResults.map(renderUserResult)}
              </View>
            )}
          </View>
        ) : (
          <>
            {trendingHashtags.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: currentColors.text }]}>{t('trending')}</Text>
                
                <View style={[styles.hashtagsList, { backgroundColor: currentColors.background, ...shadows.card }]}>
                  {trendingHashtags.map(renderHashtagItem)}
                </View>
              </View>
            )}

            {trendingHashtags.length === 0 && !isSearching && (
              <View style={styles.emptyState}>
                <Hash size={64} color={currentColors.textSecondary} />
                <Text style={[styles.emptyTitle, { color: currentColors.text }]}>No trending topics yet</Text>
                <Text style={[styles.emptySubtitle, { color: currentColors.textSecondary }]}>
                  Start creating posts with hashtags to see trending topics here
                </Text>
                <TouchableOpacity 
                  style={[styles.createPostButton, { backgroundColor: currentColors.primary }]}
                  onPress={() => router.push('/(tabs)/create')}
                >
                  <Text style={styles.createPostButtonText}>{t('createPost')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.41,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 36,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
  },
  microphoneButton: {
    padding: 4,
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  hashtagsList: {
    marginHorizontal: 20,
    borderRadius: 16,
  },
  hashtagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.33,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  hashtagLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  hashtagIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  hashtagContent: {
    flex: 1,
  },
  hashtagText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  hashtagCount: {
    fontSize: 13,
    fontWeight: '400',
  },
  searchResultsList: {
    marginHorizontal: 20,
    borderRadius: 16,
  },
  userResult: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.33,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  userResultName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  userMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  userMetaText: {
    fontSize: 13,
    fontWeight: '400',
    marginLeft: 2,
    textTransform: 'capitalize',
  },
  userBio: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '400',
  },
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
    marginHorizontal: 20,
    borderRadius: 16,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 6,
  },
  noResultsSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '400',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    fontWeight: '400',
  },
  createPostButton: {
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  createPostButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});