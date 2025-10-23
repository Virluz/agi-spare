import i18next from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';

import { En, He, Hin, Mr } from '../Localization/Export';
import { useMemo } from 'react';
import SecureStorage from '../utils/SecureStorage';
import Constants from '../utils/Constants';

const resources = {
  En: {
    translation: En,
  },
  Hin: {
    translation: Hin,
  },
  MR: {
    translation: Mr,
  },
  HE: {
    translation: He,
  },
};

const initializeI18n = async () => {
  const language = await SecureStorage.getItem(Constants.LOCAL_STORAGE_KEYS.LANGUANGE);

  i18next.use(initReactI18next).init({
    // debug: true,
    compatibilityJSON: 'v3',
    fallbackLng: language,
    interpolation: {
      escapeValue: false,
    },
    resources,
  });
};

const IMLocalized = (key) => {
  const { t } = useTranslation();
  const translatedText = useMemo(() => t(key), [key, t]);
  return translatedText;
};

const changeLanguage = (lang) => {
  i18next.changeLanguage(lang);
  SecureStorage.setItem(Constants.LOCAL_STORAGE_KEYS.LANGUANGE, lang);
};

const getLanguage = () => {
  return i18next.language;
};

export { changeLanguage, IMLocalized, initializeI18n, getLanguage };
