import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getProducts, getCategories } from '../services/api';
import { getLang } from '../utils/locale';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState(getLang());
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
    const onLanguageChange = () => {
      setLang(getLang());
      fetchProducts();
      getCategories().then((data) => {
        const list = data?.results ?? data ?? [];
        setCategories(Array.isArray(list) ? list : []);
      }).catch(() => setCategories([]));
    };
    window.addEventListener('language-change', onLanguageChange);
    return () => window.removeEventListener('language-change', onLanguageChange);
  }, [fetchProducts]);

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
      <section className="mb-12 rounded-[32px] border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100 p-8 shadow-[0_28px_80px_rgba(15,23,42,0.08)] sm:p-12">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500 mb-4">3D Shop</p>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mb-5">
            Alışverişin <span className="text-indigo-600">üçüncü boyutu</span>.
          </h1>
          <p className="text-slate-600 text-lg leading-8">
            Fotoğraf, 3D model ve gerçek zamanlı ürün detaylarıyla alışveriş deneyimini yeniden keşfedin.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleClearFilters}
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
            >
              Filtreleri temizle
            </button>
            <a
              href="/about"
              className="rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              Hakkımızda
            </a>
          </div>
        </div>
      </section>

      <div className="mb-8 grid gap-6 sm:grid-cols-[1fr_auto] items-center">
        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
          <input
            ref={searchRef}
            type="search"
            defaultValue={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ürün ara..."
            className="min-w-0 flex-1 rounded-3xl border border-slate-200 bg-white px-5 py-3 text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          />
          <button
            type="submit"
            className="rounded-3xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Ara
          </button>
        </form>

        {hasFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="self-start rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
          >
            Filtreleri temizle
          </button>
        )}
      </div>

      <div className="mb-10 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setSelectedCategory(null)}
          className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
            selectedCategory === null ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Hepsi ({products.length})
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setSelectedCategory(category.id)}
            className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
              selectedCategory === category.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {lang === 'tr' ? category.name_tr || category.name_en : category.name_en || category.name_tr || category.slug}
          </button>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 8 }).map((_, index) => <ProductCardSkeleton key={index} />)
          : products.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>

      {!loading && products.length === 0 && (
        <div className="mt-16 rounded-[32px] border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
          <p className="text-xl font-semibold text-slate-700">Bu kriterlere uygun ürün bulunamadı.</p>
          <p className="mt-3 text-slate-500">Arama terimini değiştirerek veya tüm ürünleri görüntüleyerek tekrar deneyin.</p>
        </div>
      )}
    </div>
  );
}
