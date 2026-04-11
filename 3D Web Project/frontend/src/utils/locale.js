export const SITE_LANG_KEY = 'site_lang';

export const getLang = () => {
  const stored = localStorage.getItem(SITE_LANG_KEY);
  if (stored === 'en') return 'en';
  return 'tr';
};

export const setLang = (lang) => {
  const normalized = lang === 'en' ? 'en' : 'tr';
  localStorage.setItem(SITE_LANG_KEY, normalized);
  document.documentElement.lang = normalized;
  return normalized;
};

export const toggleLang = () => setLang(getLang() === 'tr' ? 'en' : 'tr');

export const getLangLabel = (lang) => (lang === 'en' ? 'EN' : 'TR');
