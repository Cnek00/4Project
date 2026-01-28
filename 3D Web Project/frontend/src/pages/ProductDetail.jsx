import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProductDetail } from '../services/api';
import { ShoppingCart, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProductDetail(id)
      .then(response => {
        setProduct(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Detay çekilirken hata:", error);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="text-center py-20 font-bold">Yükleniyor...</div>;
  if (!product) return <div className="text-center py-20 font-bold">Ürün bulunamadı!</div>;

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Geri Dön Butonu */}
      <Link to="/" className="flex items-center text-gray-500 hover:text-indigo-600 mb-8 transition">
        <ArrowLeft className="w-4 h-4 mr-2" /> Mağazaya Dön
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* SOL TARAF: GÖRSEL (Aynı ProductCard'daki thumbnail yapısı) */}
        <div className="bg-white aspect-square rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex items-center justify-center">
          {product.thumbnail ? (
            <img
              src={product.thumbnail}
              alt={product.name_tr}
              className="w-full h-full object-contain p-6"
            />
          ) : (
            <div className="text-gray-300 italic">Görsel mevcut değil.</div>
          )}
        </div>

        {/* SAĞ TARAF: DETAYLAR */}
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-black text-gray-900 mb-2 leading-tight">
            {product.name_tr}
          </h1>
          <p className="text-xl text-gray-400 italic mb-6">
            {product.name_en}
          </p>

          <div className="text-3xl font-extrabold text-indigo-600 mb-8 bg-indigo-50 inline-block px-4 py-2 rounded-xl self-start">
            {product.price} <span className="text-lg font-medium">{product.currency}</span>
          </div>

          {/* BEDEN SEÇİMİ (API'den gelen sizes verisi) */}
          <div className="mb-10">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center">
              Mevcut Stok Durumu
            </h3>
            <div className="flex flex-wrap gap-3">
              {product.sizes && product.sizes.length > 0 ? (
                product.sizes.map((item, index) => (
                  <div key={index} className="px-5 py-3 bg-white border-2 border-gray-100 rounded-2xl shadow-sm hover:border-indigo-200 transition cursor-default">
                    <p className="text-xs text-gray-400 uppercase font-bold">Beden</p>
                    <p className="text-lg font-black text-gray-800">{item.size}</p>
                    <p className="text-[10px] text-green-600 font-medium">{item.stock} adet stokta</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm italic">Bu ürün için beden bilgisi girilmemiş.</p>
              )}
            </div>
          </div>

          {/* SATIN ALMA ALANI */}
          <div className="space-y-4">
            <button className="w-full flex items-center justify-center gap-3 bg-gray-900 text-white py-5 rounded-2xl font-bold hover:bg-indigo-600 transition shadow-xl shadow-gray-200 active:scale-[0.98]">
              <ShoppingCart className="w-6 h-6" />
              Sepete Ekle
            </button>
            <div className="flex items-center justify-center gap-6 text-gray-400 text-xs font-medium">
              <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500" /> Orijinal Ürün</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500" /> Hızlı Kargo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}