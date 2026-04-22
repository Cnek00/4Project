import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShoppingCart,
  LogIn,
  LogOut,
  Package,
  Sun,
  Moon,
  Languages,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { i18n, t } = useTranslation();
  const { isAuthenticated, logout, cartCount } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleLang = () => {
    const langs = ['tr', 'en', 'de'];
    const currentFull = i18n.language || i18n.resolvedLanguage || 'tr';
    const current = currentFull.split('-')[0].toLowerCase();
    const currentIndex = langs.indexOf(current) !== -1 ? langs.indexOf(current) : 0;
    const nextLang = langs[(currentIndex + 1) % langs.length];
    i18n.changeLanguage(nextLang);
  };

  const activeLink = (path) => location.pathname === path;

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 text-lg font-black tracking-tight text-slate-900 dark:text-white">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 dark:bg-cyan-500 text-white dark:text-slate-950">3D</span>
            3D Shop
          </Link>

          <div className="hidden md:flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <Link
              to="/"
              className={`px-4 py-2 rounded-full transition ${
                activeLink('/') ? 'bg-indigo-600 dark:bg-cyan-500 text-white dark:text-slate-950' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {t('common.shop')}
            </Link>
            <Link
              to="/about"
              className={`px-4 py-2 rounded-full transition ${
                activeLink('/about') ? 'bg-indigo-600 dark:bg-cyan-500 text-white dark:text-slate-950' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {t('common.about')}
            </Link>
            <Link
              to="/cart"
              className={`relative px-4 py-2 rounded-full transition flex items-center gap-2 ${
                activeLink('/cart') ? 'bg-indigo-600 dark:bg-cyan-500 text-white dark:text-slate-950' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <ShoppingCart className="w-4 h-4" /> {t('common.cart')}
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white px-1">
                  {cartCount}
                </span>
              )}
            </Link>
            {isAuthenticated && (
              <Link
                to="/orders"
                className={`px-4 py-2 rounded-full transition ${
                  activeLink('/orders') ? 'bg-indigo-600 dark:bg-cyan-500 text-white dark:text-slate-950' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {t('common.orders')}
              </Link>
            )}
            <button
              type="button"
              onClick={toggleLang}
              className="hidden xl:inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 hover:border-slate-300 dark:hover:border-slate-700 transition"
            >
              <Languages className="w-4 h-4" /> {(i18n.language || i18n.resolvedLanguage || 'tr').toUpperCase().slice(0, 2)}
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="hidden xl:inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 hover:border-slate-300 dark:hover:border-slate-700 transition"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {theme === 'dark' ? t('common.light') : t('common.dark')}
            </button>
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition"
              >
                <LogOut className="w-4 h-4" /> {t('common.logout')}
              </button>
            ) : (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <Package className="w-4 h-4" /> {t('common.register')}
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 dark:bg-cyan-500 px-4 py-2 text-white dark:text-slate-950 hover:bg-indigo-600 dark:hover:bg-cyan-400 transition"
                >
                  <LogIn className="w-4 h-4" /> {t('common.login')}
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 transition"
              aria-label="Tema değiştir"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 transition"
              aria-label="Mobil menü"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3">
            <Link
              to="/"
              className="block rounded-2xl px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t('common.shop')}
            </Link>
            <Link
              to="/about"
              className="block rounded-2xl px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t('common.about')}
            </Link>
            <Link
              to="/cart"
              className="block rounded-2xl px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t('common.cart')}
            </Link>
            {isAuthenticated && (
              <Link
                to="/orders"
                className="block rounded-2xl px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {t('common.orders')}
              </Link>
            )}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={toggleLang}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
              >
                <Languages className="w-4 h-4" /> {(i18n.language || i18n.resolvedLanguage || 'tr').toUpperCase().slice(0, 2)}
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {t('common.theme')}
              </button>
            </div>
            <div>
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40"
                >
                  <LogOut className="w-4 h-4" /> {t('common.logout')}
                </button>
              ) : (
                <div className="space-y-3">
                  <Link
                    to="/register"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Package className="w-4 h-4" /> {t('common.register')}
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 dark:bg-cyan-500 px-4 py-3 text-white dark:text-slate-950 hover:bg-indigo-600 dark:hover:bg-cyan-400"
                  >
                    <LogIn className="w-4 h-4" /> {t('common.login')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
