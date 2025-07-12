import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { X, Check } from 'lucide-react-native';
import { colors, darkColors } from '@/constants/colors';
import { useThemeStore } from '@/stores/theme-store';
import { useLanguageStore, SUPPORTED_LANGUAGES, Language } from '@/stores/language-store';

interface LanguageSelectionModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function LanguageSelectionModal({ visible, onClose }: LanguageSelectionModalProps) {
  const { isDarkMode } = useThemeStore();
  const { currentLanguage, setLanguage } = useLanguageStore();
  const currentColors = isDarkMode ? darkColors : colors;

  const handleLanguageSelect = (language: Language) => {
    setLanguage(language);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: currentColors.groupedBackground }]}>
        <View style={[styles.header, { backgroundColor: currentColors.groupedBackground, borderBottomColor: currentColors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={currentColors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: currentColors.text }]}>Language</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.languageList, { backgroundColor: currentColors.background }]}>
            {SUPPORTED_LANGUAGES.map((language, index) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageItem,
                  index === SUPPORTED_LANGUAGES.length - 1 && styles.lastItem,
                  { borderBottomColor: currentColors.border }
                ]}
                onPress={() => handleLanguageSelect(language)}
              >
                <View style={styles.languageInfo}>
                  <Text style={[styles.languageName, { color: currentColors.text }]}>
                    {language.nativeName}
                  </Text>
                  <Text style={[styles.languageSubtitle, { color: currentColors.textSecondary }]}>
                    {language.name}
                  </Text>
                </View>
                {currentLanguage.code === language.code && (
                  <Check size={20} color={currentColors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
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
    paddingVertical: 16,
    borderBottomWidth: 0.33,
  },
  closeButton: {
    padding: 4,
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
    paddingTop: 20,
  },
  languageList: {
    marginHorizontal: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.33,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 2,
  },
  languageSubtitle: {
    fontSize: 13,
    fontWeight: '400',
  },
});