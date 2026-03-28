import { useLanguageStore } from '@/stores/language-store';
import { translations, TranslationKey, LanguageCode } from '@/constants/translations';

export const useTranslation = () => {
  const { currentLanguage } = useLanguageStore();
  
  const t = (key: TranslationKey): string => {
    const languageCode = currentLanguage.code as LanguageCode;
    return translations[languageCode]?.[key] || translations.en[key] || key;
  };
  
  return { t, currentLanguage };
};