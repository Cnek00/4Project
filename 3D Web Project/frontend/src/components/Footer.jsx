import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-base font-black text-slate-900 dark:text-white">3D Shop</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-xl">
              {t('home.subtitle')}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-400">
            <Link to="/" className="hover:text-slate-900 dark:hover:text-white transition">{t('common.shop')}</Link>
            <Link to="/about" className="hover:text-slate-900 dark:hover:text-white transition">{t('common.about')}</Link>
            <Link to="/login" className="hover:text-slate-900 dark:hover:text-white transition">{t('common.login')}</Link>
            <Link to="/orders" className="hover:text-slate-900 dark:hover:text-white transition">{t('common.orders')}</Link>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6 text-sm text-slate-500 dark:text-slate-500 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} 3D Shop. {t('common.allRightsReserved')}</span>
          <span className="inline-flex items-center gap-1 text-slate-400 dark:text-slate-600">
            <Heart className="w-4 h-4 text-pink-500 dark:text-pink-600" /> {t('common.designAndDev')}
          </span>
        </div>
      </div>
    </footer>
  );
}
