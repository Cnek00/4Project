import React, { useState, useEffect } from 'react';
import { getProducts, getCategories } from '../services/api';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProducts = () => {
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
  };

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

  const handleSearch = (e) => {
    e?.preventDefault();
    fetchProducts();
  };

  if (loading && products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center font-black text-2xl text-indigo-600">
        Yükleniyor...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-10">
        <h1 className="text-5xl font-black mb-4 text-gray-900 tracking-tight">Koleksiyonlar</h1>
        <div className="h-1 w-20 bg-indigo-600 rounded-full" />
      </div>

      {/* Arama */}
      <form onSubmit={handleSearch} className="mb-8 flex gap-2 flex-wrap">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ürün ara..."
          className="flex-1 min-w-[200px] px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition"
        >
          Ara
        </button>
      </form>

      {/* Kategori butonları */}
      <div className="flex flex-wrap gap-3 mb-12">
        <button
          type="button"
          onClick={() => setSelectedCategory(null)}
          className={`px-6 py-2 rounded-full font-bold transition-all ${
            selectedCategory === null
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Hepsi ({products.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-6 py-2 rounded-full font-bold transition-all ${
              selectedCategory === cat.id
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.name_tr || cat.name_en || cat.name}
          </button>
        ))}
      </div>

      {/* Ürün listesi */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-3xl p-20 text-center border-2 border-dashed">
          <p className="text-gray-500 text-lg">
            {loading ? 'Yükleniyor...' : 'Bu kriterlere uygun ürün bulunamadı.'}
          </p>
          <button
            type="button"
            onClick={() => { setSelectedCategory(null); setSearch(''); fetchProducts(); }}
            className="mt-4 text-indigo-600 font-bold underline"
          >
            Filtreleri temizle
          </button>
        </div>
      )}
    </div>
  );
}
