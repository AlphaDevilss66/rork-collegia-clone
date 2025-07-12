import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Switch, Alert, TextInput, Platform } from 'react-native';
import { ArrowLeft, User, Shield, HelpCircle, Info, Trash2, Globe, Search, Moon, Mic } from 'lucide-react-native';
import { colors, darkColors } from '@/constants/colors';
import { useUserStore } from '@/stores/user-store';
import { useThemeStore } from '@/stores/theme-store';
import { useLanguageStore } from '@/stores/language-store';
import { useTranslation } from '@/hooks/useTranslation';
import LanguageSelectionModal from '@/components/LanguageSelectionModal';
import { VoiceSearch } from '@/components/VoiceSearch';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const { user, signOut } = useUserStore();
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const { getCurrentLanguageName } = useLanguageStore();
  const { t } = useTranslation();
  const [privateProfile, setPrivateProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const currentColors = isDarkMode ? darkColors : colors;

  const handleSignOut = () => {
    Alert.alert(
      t('signOut'),
      t('signOutConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        { 
          text: t('signOut'), 
          style: 'destructive',
          onPress: () => {
            signOut();
            router.replace('/(tabs)');
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('deleteAccount'),
      t('deleteAccountConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        { 
          text: t('delete'), 
          style: 'destructive',
          onPress: () => {
            Alert.alert(t('accountDeleted'), t('accountDeletedMessage'));
            signOut();
            router.replace('/(tabs)');
          }
        }
      ]
    );
  };

  const handleVoiceSearch = (text: string) => {
    setSearchQuery(text);
  };

  const settingSections = [
    {
      items: [
        {
          icon: User,
          title: t('editProfile'),
          subtitle: t('updatePersonalInfo'),
          onPress: () => router.push('/onboarding'),
          showArrow: true,
          iconColor: currentColors.primary,
          iconBg: `${currentColors.primary}20`,
        },
        {
          icon: Shield,
          title: t('privacy'),
          subtitle: t('makeProfilePrivate'),
          iconColor: currentColors.success,
          iconBg: `${currentColors.success}20`,
          rightComponent: (
            <Switch
              value={privateProfile}
              onValueChange={setPrivateProfile}
              trackColor={{ false: currentColors.systemFill, true: currentColors.primary }}
              thumbColor="white"
              ios_backgroundColor={currentColors.systemFill}
            />
          ),
        },
      ],
    },
    {
      items: [
        {
          icon: Moon,
          title: t('darkMode'),
          subtitle: isDarkMode ? t('darkAppearance') : t('lightAppearance'),
          iconColor: currentColors.systemIndigo,
          iconBg: `${currentColors.systemIndigo}20`,
          rightComponent: (
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: currentColors.systemFill, true: currentColors.primary }}
              thumbColor="white"
              ios_backgroundColor={currentColors.systemFill}
            />
          ),
        },
      ],
    },
    {
      items: [
        {
          icon: Globe,
          title: t('language'),
          subtitle: getCurrentLanguageName(),
          iconColor: currentColors.systemIndigo,
          iconBg: `${currentColors.systemIndigo}20`,
          onPress: () => setShowLanguageModal(true),
          showArrow: true,
        },
      ],
    },
    {
      items: [
        {
          icon: HelpCircle,
          title: t('helpCenter'),
          subtitle: t('getHelpSupport'),
          iconColor: currentColors.systemGreen,
          iconBg: `${currentColors.systemGreen}20`,
          onPress: () => Alert.alert(t('helpCenter'), t('contactSupport')),
          showArrow: true,
        },
        {
          icon: Info,
          title: t('about'),
          subtitle: t('version') + ' 1.0.0',
          iconColor: currentColors.systemYellow,
          iconBg: `${currentColors.systemYellow}20`,
          onPress: () => Alert.alert(t('about') + ' Collegia', t('aboutCollegia')),
          showArrow: true,
        },
      ],
    },
    {
      items: [
        {
          icon: Trash2,
          title: t('deleteAccount'),
          subtitle: t('permanentlyDelete'),
          onPress: handleDeleteAccount,
          iconColor: currentColors.error,
          iconBg: `${currentColors.error}20`,
          textColor: currentColors.error,
          showArrow: true,
        },
      ],
    },
  ];

  const renderSettingItem = (item: any, index: number, isLast: boolean) => (
    <TouchableOpacity
      key={index}
      style={[styles.settingItem, isLast && styles.settingItemLast, { borderBottomColor: currentColors.border }]}
      onPress={item.onPress}
      disabled={!item.onPress}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: item.iconBg }]}>
          <item.icon size={20} color={item.iconColor} />
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, item.textColor && { color: item.textColor }, { color: currentColors.text }]}>
            {item.title}
          </Text>
          <Text style={[styles.settingSubtitle, { color: currentColors.textSecondary }]}>{item.subtitle}</Text>
        </View>
      </View>
      
      <View style={styles.settingRight}>
        {item.rightComponent}
        {item.showArrow && (
          <Text style={[styles.settingArrow, { color: currentColors.textTertiary }]}>›</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSection = (section: any, sectionIndex: number) => (
    <View key={sectionIndex} style={[styles.section, { backgroundColor: currentColors.background }]}>
      {section.items.map((item: any, itemIndex: number) => 
        renderSettingItem(item, itemIndex, itemIndex === section.items.length - 1)
      )}
    </View>
  );

  const displayName = user?.name && user.name.trim() ? user.name : user?.email?.split('@')[0] || 'User';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.groupedBackground }]}>
      <View style={[styles.header, { backgroundColor: currentColors.groupedBackground }]}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: currentColors.systemFill }]}
          onPress={() => router.back()}
        >
          <ArrowLeft size={22} color={currentColors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: currentColors.text }]}>{t('settings')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.searchContainer, { backgroundColor: currentColors.systemFill }]}>
          <Search size={16} color={currentColors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: currentColors.text }]}
            placeholder={t('search')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={currentColors.textSecondary}
          />
          <VoiceSearch
            onTranscription={handleVoiceSearch}
            size={16}
            color={currentColors.textSecondary}
          />
        </View>

        <View style={[styles.userSection, { backgroundColor: currentColors.background }]}>
          <TouchableOpacity style={styles.userItem} onPress={() => router.push('/onboarding')}>
            <View style={[styles.userAvatar, { backgroundColor: currentColors.systemFill }]}>
              <Text style={[styles.userAvatarText, { color: currentColors.primary }]}>
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: currentColors.text }]}>{displayName}</Text>
              <Text style={[styles.userSubtitle, { color: currentColors.textSecondary }]}>
                {t(user?.role || 'user')} • {user?.email}
              </Text>
            </View>
            <Text style={[styles.settingArrow, { color: currentColors.textTertiary }]}>›</Text>
          </TouchableOpacity>
        </View>

        {settingSections.map(renderSection)}

        <TouchableOpacity style={[styles.signOutSection, { backgroundColor: currentColors.background }]} onPress={handleSignOut}>
          <Text style={[styles.signOutText, { color: currentColors.error }]}>{t('signOut')}</Text>
        </TouchableOpacity>
      </ScrollView>
      
      <LanguageSelectionModal
        visible={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginRight: 32,
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 36,
    marginHorizontal: 20,
    marginBottom: 20,
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
  userSection: {
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    textTransform: 'capitalize',
  },
  section: {
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.33,
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 1,
  },
  settingSubtitle: {
    fontSize: 13,
    fontWeight: '400',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingArrow: {
    fontSize: 17,
    marginLeft: 8,
    fontWeight: '400',
  },
  signOutSection: {
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 40,
    paddingVertical: 12,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '400',
  },
});