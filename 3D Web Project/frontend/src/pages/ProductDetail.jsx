import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProductDetail, addToCart, mediaUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProductDetail() {
  const { id } = useParams();
  const { isAuthenticated, refreshCartCount } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSizeId, setSelectedSizeId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  useEffect(() => {
    getProductDetail(id)
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-20 font-bold">Yükleniyor...</div>;
  if (!product) return <div className="text-center py-20 font-bold">Ürün bulunamadı!</div>;

  const images = product.images && product.images.length > 0
    ? product.images.map((img) => mediaUrl(img.image))
    : product.thumbnail
      ? [mediaUrl(product.thumbnail)]
      : [];
  const mainImage = images[galleryIndex] || images[0];

  const handleAddToCart = () => {
    if (!selectedSizeId) {
      setMessage('Lütfen beden seçin.');
      return;
    }
    if (!isAuthenticated) {
      setMessage('Sepete eklemek için giriş yapmalısınız.');
      return;
    }
    setMessage(null);
    addToCart(product.id, selectedSizeId, quantity)
      .then(() => {
        setMessage('Ürün sepete eklendi.');
        refreshCartCount?.();
      })
      .catch((err) => {
        setMessage(err.response?.data?.error || 'Sepete eklenirken hata oluştu.');
      });
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <Link to="/" className="flex items-center text-gray-500 hover:text-indigo-600 mb-8 transition">
        <ArrowLeft className="w-4 h-4 mr-2" /> Mağazaya Dön
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Sol: Görsel / Galeri */}
        <div className="space-y-4">
          <div className="bg-white aspect-square rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex items-center justify-center">
            {mainImage ? (
              <img
                src={mainImage}
                alt={product.name_tr}
                className="w-full h-full object-contain p-6"
              />
            ) : (
              <div className="text-gray-300 italic">Görsel mevcut değil.</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((src, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setGalleryIndex(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 ${
                    galleryIndex === idx ? 'border-indigo-600' : 'border-gray-200'
                  }`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sağ: Detay */}
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-black text-gray-900 mb-2 leading-tight">
            {product.name_tr}
          </h1>
          <p className="text-xl text-gray-400 italic mb-6">{product.name_en}</p>

          <div className="text-3xl font-extrabold text-indigo-600 mb-8 bg-indigo-50 inline-block px-4 py-2 rounded-xl self-start">
            {product.price} <span className="text-lg font-medium">{product.currency}</span>
          </div>

          {/* Beden seçimi */}
          <div className="mb-10">
            <h3 className="font-bold text-gray-700 mb-4">Mevcut Stok / Beden Seçin</h3>
            <div className="flex flex-wrap gap-3">
              {product.sizes && product.sizes.length > 0 ? (
                product.sizes.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedSizeId(item.id)}
                    disabled={item.stock < 1}
                    className={`px-5 py-3 rounded-2xl border-2 transition cursor-pointer ${
                      selectedSizeId === item.id
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-100 hover:border-indigo-200'
                    } ${item.stock < 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <p className="text-xs text-gray-400 uppercase font-bold">Beden</p>
                    <p className="text-lg font-black text-gray-800">{item.size_value}</p>
                    <p className="text-[10px] text-green-600 font-medium">
                      {item.stock} adet stokta
                    </p>
                  </button>
                ))
              ) : (
                <p className="text-gray-400 text-sm italic">Bu ürün için beden bilgisi girilmemiş.</p>
              )}
            </div>
          </div>

          {/* Miktar */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Miktar</label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-24 px-3 py-2 rounded-xl border border-gray-200"
            />
          </div>

          {message && (
            <div className={`mb-4 px-4 py-2 rounded-xl text-sm ${
              message.includes('eklendi') ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
            }`}>
              {message}
            </div>
          )}

          <div className="space-y-4">
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-3 bg-gray-900 text-white py-5 rounded-2xl font-bold hover:bg-indigo-600 transition shadow-xl shadow-gray-200 active:scale-[0.98]"
            >
              <ShoppingCart className="w-6 h-6" />
              Sepete Ekle
            </button>
            <div className="flex items-center justify-center gap-6 text-gray-400 text-xs font-medium">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" /> Orijinal Ürün
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" /> Hızlı Kargo
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
