import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { getProducts, getCategories } from '../services/api';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function Home() {
  const { i18n, t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const searchRef = useRef(null);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = {};

    if (selectedCategory) params.category = selectedCategory;
    if (search.trim()) params.search = search.trim();

    getProducts(params)
      .then((data) => {
        const list = data?.results ?? data ?? [];
        setProducts(Array.isArray(list) ? list : []);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [selectedCategory, search]);

  useEffect(() => {
    getCategories()
      .then((data) => {
        const list = data?.results ?? data ?? [];
        setCategories(Array.isArray(list) ? list : []);
      })
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  useEffect(() => {
    fetchProducts();
    getCategories().then((data) => {
      const list = data?.results ?? data ?? [];
      setCategories(Array.isArray(list) ? list : []);
    }).catch(() => setCategories([]));
  }, [i18n.language]);

  const handleSearch = (event) => {
    event?.preventDefault();
    fetchProducts();
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory(null);
    if (searchRef.current) searchRef.current.value = '';
  };

  const hasFilters = selectedCategory !== null || search.trim() !== '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="mb-12 rounded-[32px] border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800/80 dark:to-slate-900 p-8 shadow-[0_28px_80px_rgba(15,23,42,0.08)] dark:shadow-[0_28px_80px_rgba(0,0,0,0.5)] sm:p-12"
      >
        <div className="max-w-3xl">
          <motion.p variants={itemVariants} className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-cyan-400 mb-4">
            3D Shop
          </motion.p>
          <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-5">
            {t('home.title')} <span className="text-indigo-600 dark:text-cyan-400">{t('home.subtitle')}</span>.
          </motion.h1>
          <motion.p variants={itemVariants} className="text-slate-600 dark:text-slate-300 text-lg leading-8">
            {t('home.subtitle')}
          </motion.p>
          <motion.div variants={itemVariants} className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleClearFilters}
              className="rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:border-slate-300 dark:hover:border-slate-700 active:scale-95"
            >
              {t('home.clearFilters')}
            </button>
            <a
              href="/about"
              className="rounded-full bg-indigo-600 dark:bg-cyan-500 px-5 py-3 text-sm font-semibold text-white dark:text-slate-950 transition hover:bg-indigo-500 dark:hover:bg-cyan-400 active:scale-95"
            >
              {t('common.about')}
            </a>
          </motion.div>
        </div>
      </motion.section>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8 grid gap-6 sm:grid-cols-[1fr_auto] items-center"
      >
        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
          <input
            ref={searchRef}
            type="search"
            defaultValue={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('common.search') + '...'}
            className="min-w-0 flex-1 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-3 text-slate-900 dark:text-white shadow-sm outline-none transition focus:border-indigo-400 dark:focus:border-cyan-400 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-cyan-900/20 placeholder-slate-400 dark:placeholder-slate-500"
          />
          <button
            type="submit"
            className="rounded-3xl bg-indigo-600 dark:bg-cyan-500 px-6 py-3 text-sm font-semibold text-white dark:text-slate-950 transition hover:bg-indigo-500 dark:hover:bg-cyan-400 active:scale-95"
          >
            {t('common.search')}
          </button>
        </form>

        {hasFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="self-start rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:border-slate-300 dark:hover:border-slate-700 active:scale-95"
          >
            {t('home.clearFilters')}
          </button>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-10 flex flex-wrap gap-3"
      >
        <button
          type="button"
          onClick={() => setSelectedCategory(null)}
          className={`rounded-full px-5 py-3 text-sm font-semibold transition active:scale-95 ${
            selectedCategory === null ? 'bg-indigo-600 dark:bg-cyan-500 text-white dark:text-slate-950 shadow-lg dark:shadow-cyan-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          {t('home.categories')} ({products.length})
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setSelectedCategory(category.id)}
            className={`rounded-full px-5 py-3 text-sm font-semibold transition active:scale-95 ${
              selectedCategory === category.id ? 'bg-indigo-600 dark:bg-cyan-500 text-white dark:text-slate-950 shadow-lg dark:shadow-cyan-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {category.display_name || category.name_en || category.name_tr || category.slug}
          </button>
        ))}
      </motion.div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 8 }).map((_, index) => <ProductCardSkeleton key={index} />)
          : products.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>

      {!loading && products.length === 0 && (
        <div className="mt-16 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-12 text-center">
          <p className="text-xl font-semibold text-slate-700 dark:text-slate-200">{t('home.noProducts')}</p>
          <p className="mt-3 text-slate-500 dark:text-slate-400">{t('home.noProductsDesc')}</p>
        </div>
      )}
    </div>
  );
}
