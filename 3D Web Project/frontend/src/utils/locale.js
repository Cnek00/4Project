export const SITE_LANG_KEY = 'i18nextLng';

export const getLang = () => {
  const stored = localStorage.getItem(SITE_LANG_KEY);
  if (stored && stored.startsWith('en')) return 'en';
  if (stored && stored.startsWith('de')) return 'de';
  return 'tr';
};

export const setLang = (lang) => {
  const normalized = ['en', 'de'].includes(lang) ? lang : 'tr';
  localStorage.setItem(SITE_LANG_KEY, normalized);
  document.documentElement.lang = normalized;
  return normalized;
};

export const getLangLabel = (lang) => {
  if (lang === 'en') return 'EN';
  if (lang === 'de') return 'DE';
  return 'TR';
};

