import React, { useState, useEffect } from 'react';
import { getProducts, getCategories } from '../services/api';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProducts(), getCategories()])

      .then(([productsRes, categoriesRes]) => {
        // Django'da sayfalama varsa veri .results içindedir, yoksa direkt .data içindedir
        const pData = productsRes.data.results || productsRes.data || [];
        const cData = categoriesRes.data.results || categoriesRes.data || [];

        console.log("Gelen Ürün Sayısı:", pData.length);

        setProducts(pData);
        setCategories(cData);
        setLoading(false);
      })
      .catch(err => {
        console.error("API Hatası:", err);
        setLoading(false);
      });
  }, []);

  // FİLTRELEME MANTIĞINI BASİTLEŞTİRDİK
  const filteredProducts = products.filter(p => {
    if (!selectedCategory) return true; // Hiçbir şey seçili değilse hepsini göster

    // Ürünün kategori bilgisini al (ID olarak)
    const pCatId = p.category?.id || p.category;

    // Karşılaştır
    return String(pCatId) === String(selectedCategory);
  });

  if (loading) return <div className="text-center py-20 font-black text-2xl text-indigo-600">Yükleniyor...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-10">
        <h1 className="text-5xl font-black mb-4 text-gray-900 tracking-tight">Koleksiyonlar</h1>
        <div className="h-1 w-20 bg-indigo-600 rounded-full"></div>
      </div>

      {/* KATEGORİ BUTONLARI */}
      <div className="flex flex-wrap gap-3 mb-12">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-6 py-2 rounded-full font-bold transition-all ${
            selectedCategory === null 
            ? 'bg-indigo-600 text-white shadow-lg' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Hepsi ({products.length})
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-6 py-2 rounded-full font-bold transition-all ${
              selectedCategory === cat.id 
              ? 'bg-indigo-600 text-white shadow-lg' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.name_tr || cat.name}
          </button>
        ))}
      </div>

      {/* ÜRÜN LİSTESİ */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-3xl p-20 text-center border-2 border-dashed">
          <p className="text-gray-500 text-lg">
            {products.length === 0
              ? "Veritabanında hiç ürün bulunamadı. Backend'i kontrol et knk!"
              : "Bu kategoride ürün bulunmuyor."}
          </p>
          <button
            onClick={() => setSelectedCategory(null)}
            className="mt-4 text-indigo-600 font-bold underline"
          >
            Tüm ürünleri göster
          </button>
        </div>
      )}
    </div>
  );
}