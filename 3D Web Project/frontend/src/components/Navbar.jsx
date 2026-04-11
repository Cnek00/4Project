import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
import { getLang, setLang, getLangLabel } from '../utils/locale';

export default function Navbar() {
  const { isAuthenticated, logout, cartCount } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [lang, setLangState] = useState(getLang);
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
    const onLangChange = () => setLangState(getLang());
    window.addEventListener('language-change', onLangChange);
    window.addEventListener('storage', onLangChange);
    return () => {
      window.removeEventListener('language-change', onLangChange);
      window.removeEventListener('storage', onLangChange);
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleLang = () => {
    const next = setLang(lang === 'tr' ? 'en' : 'tr');
    setLangState(next);
    window.dispatchEvent(new Event('language-change'));
  };

  const activeLink = (path) => location.pathname === path;

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'backdrop-blur-xl bg-white/80 border-b border-slate-200 shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 text-lg font-black tracking-tight text-slate-900">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white">3D</span>
            3D Shop
          </Link>

          <div className="hidden md:flex items-center gap-2 text-sm font-semibold text-slate-600">
            <Link
              to="/"
              className={`px-4 py-2 rounded-full transition ${
                activeLink('/') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100'
              }`}
            >
              Mağaza
            </Link>
            <Link
              to="/about"
              className={`px-4 py-2 rounded-full transition ${
                activeLink('/about') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100'
              }`}
            >
              Hakkında
            </Link>
            <Link
              to="/cart"
              className={`relative px-4 py-2 rounded-full transition flex items-center gap-2 ${
                activeLink('/cart') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100'
              }`}
            >
              <ShoppingCart className="w-4 h-4" /> Sepet
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
                  activeLink('/orders') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100'
                }`}
              >
                Siparişlerim
              </Link>
            )}
            <button
              type="button"
              onClick={toggleLang}
              className="hidden xl:inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 hover:border-slate-300 transition"
            >
              <Languages className="w-4 h-4" /> {lang.toUpperCase()}
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="hidden xl:inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 hover:border-slate-300 transition"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {theme === 'dark' ? 'Açık' : 'Koyu'}
            </button>
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-2 text-red-700 hover:bg-red-100 transition"
              >
                <LogOut className="w-4 h-4" /> Çıkış
              </button>
            ) : (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-900 hover:bg-slate-100 transition"
                >
                  <Package className="w-4 h-4" /> Kayıt Ol
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-white hover:bg-indigo-600 transition"
                >
                  <LogIn className="w-4 h-4" /> Giriş
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:border-slate-300 transition"
              aria-label="Tema değiştir"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:border-slate-300 transition"
              aria-label="Mobil menü"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3">
            <Link
              to="/"
              className="block rounded-2xl px-4 py-3 text-slate-700 hover:bg-slate-100"
            >
              Mağaza
            </Link>
            <Link
              to="/about"
              className="block rounded-2xl px-4 py-3 text-slate-700 hover:bg-slate-100"
            >
              Hakkında
            </Link>
            <Link
              to="/cart"
              className="block rounded-2xl px-4 py-3 text-slate-700 hover:bg-slate-100"
            >
              Sepetim
            </Link>
            {isAuthenticated && (
              <Link
                to="/orders"
                className="block rounded-2xl px-4 py-3 text-slate-700 hover:bg-slate-100"
              >
                Siparişlerim
              </Link>
            )}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={toggleLang}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 hover:border-slate-300"
              >
                <Languages className="w-4 h-4" /> {lang.toUpperCase()}
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 hover:border-slate-300"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                Tema
              </button>
            </div>
            <div>
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-red-700 hover:bg-red-100"
                >
                  <LogOut className="w-4 h-4" /> Çıkış
                </button>
              ) : (
                <div className="space-y-3">
                  <Link
                    to="/register"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 hover:bg-slate-100"
                  >
                    <Package className="w-4 h-4" /> Kayıt Ol
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-white hover:bg-indigo-600"
                  >
                    <LogIn className="w-4 h-4" /> Giriş
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
