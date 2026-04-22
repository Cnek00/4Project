import { Link } from 'react-router-dom';
import { mediaUrl } from '../services/api';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export function ProductCardSkeleton() {
  return (
    <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 shadow-sm animate-pulse">
      <div className="h-56 w-full bg-slate-200 dark:bg-slate-700/50" />
      <div className="p-5 space-y-4">
        <div className="h-5 w-3/4 rounded-full bg-slate-200 dark:bg-slate-700/50" />
        <div className="h-4 w-1/2 rounded-full bg-slate-200 dark:bg-slate-700/50" />
        <div className="h-8 w-full rounded-2xl bg-slate-200 dark:bg-slate-700/50" />
      </div>
    </div>
  );
}

export default function ProductCard({ product }) {
  const { t } = useTranslation();
  const imageSrc = product.thumbnail || product.images?.[0]?.image;
  const src = imageSrc ? mediaUrl(imageSrc) : null;
  const displayName = product.display_name || product.name_en || product.name_tr;
  const subtitle = product.display_description || product.description_en || product.description_tr || '';
  const has3d = !!product.model_3d;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      whileHover={{ y: -6, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
      className="group rounded-[28px] overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm will-change-transform dark:shadow-cyan-900/10"
    >
      <div className="relative overflow-hidden bg-slate-100 dark:bg-slate-800/50">
        {src ? (
          <img
            src={src}
            alt={displayName}
            className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-64 items-center justify-center text-slate-400 dark:text-slate-500">{t('product.noImage')}</div>
        )}
        {has3d && (
          <span className="absolute left-4 top-4 rounded-full bg-indigo-600 dark:bg-cyan-500 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white dark:text-slate-950 shadow-xl">
            ◈ 3D
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{displayName}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{subtitle}</p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('product.price')}</p>
            <p className="text-2xl font-black text-indigo-600 dark:text-cyan-400">{product.price} {product.currency}</p>
          </div>
          <motion.div whileTap={{ scale: 0.93 }} whileHover={{ scale: 1.05 }}>
            <Link
              to={`/product/${product.id}`}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 dark:bg-cyan-500 px-4 py-3 text-sm font-semibold text-white dark:text-slate-950 transition hover:bg-indigo-600 dark:hover:bg-cyan-400"
            >
              {t('product.inspect')} <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
